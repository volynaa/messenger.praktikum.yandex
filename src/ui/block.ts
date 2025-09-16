type Props = {
  [key: string]: unknown;
  events?: {
    [eventName: string]: EventListener;
  };
};

interface BlockMeta {
  tagName: string;
  props: Props;
}

class EventBus {
  private events: { [eventName: string]: Array<(...args: unknown[]) => void> } = {};

  on(eventName: string, callback: (...args: unknown[]) => void): void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  emit(eventName: string, ...args: unknown[]): void {
    const eventCallbacks = this.events[eventName];
    if (eventCallbacks) {
      eventCallbacks.forEach(callback => callback(...args));
    }
  }

  off(eventName: string, callback: (...args: unknown[]) => void): void {
    const eventCallbacks = this.events[eventName];
    if (eventCallbacks) {
      this.events[eventName] = eventCallbacks.filter(cb => cb !== callback);
    }
  }
}

export default abstract class Block {
  static EVENTS = {
    INIT: 'init',
    FLOW_CDM: 'flow:component-did-mount',
    FLOW_CDU: 'flow:component-did-update',
    FLOW_RENDER: 'flow:render',
  } as const;

  private _element: HTMLElement | null = null;
  private _meta: BlockMeta;
  protected props: Props;
  private eventBus: EventBus;

  constructor(tagName: string = 'div', props: Props = {}) {
    const eventBus = new EventBus();
    this._meta = {
      tagName,
      props,
    };

    this.props = this._makePropsProxy(props);
    this.eventBus = eventBus;

    this._registerEvents(eventBus);
    eventBus.emit(Block.EVENTS.INIT);
  }

  private _registerEvents(eventBus: EventBus): void {
    eventBus.on(Block.EVENTS.INIT, this.init.bind(this));
    eventBus.on(Block.EVENTS.FLOW_CDM, this._componentDidMount.bind(this));
    eventBus.on(Block.EVENTS.FLOW_CDU, this._componentDidUpdate.bind(this));
    eventBus.on(Block.EVENTS.FLOW_RENDER, this._render.bind(this));
  }

  private _createResources(): void {
    const { tagName } = this._meta;
    this._element = this._createDocumentElement(tagName);
  }

  private init(): void {
    this._createResources();
    this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
  }

  private _componentDidMount(): void {
    this.componentDidMount();
  }

  protected componentDidMount(): void {}

  public dispatchComponentDidMount(): void {
    this.eventBus.emit(Block.EVENTS.FLOW_CDM);
  }

  private _componentDidUpdate(oldProps: Props, newProps: Props): void {
    const response = this.componentDidUpdate(oldProps, newProps);
    if (!response) {
      return;
    }
    this._render();
  }

  protected componentDidUpdate(_oldProps: Props, _newProps: Props): boolean {
    return true;
  }

  public setProps(nextProps: Partial<Props>): void {
    if (!nextProps) {
      return;
    }

    Object.assign(this.props, nextProps);
  }

  get element(): HTMLElement | null {
    return this._element;
  }

  private _render(): void {
    const block = this.render();

    this._removeEvents();

    if (this._element) {
      this._element.innerHTML = '';
      this._element.appendChild(block);
    }

    this._addEvents();
  }

  private _addEvents(): void {
    const { events = {} } = this.props;

    Object.keys(events).forEach(eventName => {
      if (this._element && events[eventName]) {
        this._element.addEventListener(eventName, events[eventName]);
      }
    });
  }

  private _removeEvents(): void {
    const { events = {} } = this.props;

    Object.keys(events).forEach(eventName => {
      if (this._element && events[eventName]) {
        this._element.removeEventListener(eventName, events[eventName]);
      }
    });
  }

  protected abstract render(): DocumentFragment;

  public getContent(): HTMLElement | null {
    return this.element;
  }

  private _makePropsProxy(props: Props): Props {
    const self = this;

    return new Proxy(props, {
      get(target: Props, prop: string): unknown {
        const value = target[prop];
        return typeof value === 'function' ? value.bind(target) : value;
      },
      set(target: Props, prop: string, value: unknown): boolean {
        const oldProps = { ...target };
        target[prop] = value;
        self.eventBus.emit(Block.EVENTS.FLOW_CDU, oldProps, target);
        return true;
      },
      deleteProperty(): never {
        throw new Error('Нет доступа');
      },
    });
  }

  private _createDocumentElement(tagName: string): HTMLElement {
    return document.createElement(tagName);
  }

  public show(): void {
    const content = this.getContent();
    if (content) {
      content.style.display = 'block';
    }
  }

  public hide(): void {
    const content = this.getContent();
    if (content) {
      content.style.display = 'none';
    }
  }
}