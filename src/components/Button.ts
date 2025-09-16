import Block from "../ui/block";

interface ButtonProps {
    [key: string]: any;
    id?: string;
    text?: string;
    dataPage?: string;
    type?: string;
    className?: string;
    events?: {
        click?: (event: Event) => void;
        submit?: (event: Event) => void;
    };
}

class Button extends Block<ButtonProps> {
    constructor(props: ButtonProps) {
        super('div', props);
    }

    protected render(): DocumentFragment {
        const fragment = document.createDocumentFragment();
        const container = document.createElement('div');

        container.innerHTML = `
      <button 
        id="${this.props.id || ''}" 
        class="${this.props.className || 'button'}"
        ${this.props.dataPage ? `data-page="${this.props.dataPage}"` : ''}
        ${this.props.type ? `type="${this.props.type}"` : 'type="button"'}
      >
        ${this.props.text || ''}
      </button>
    `;

        if (container.firstElementChild) {
            fragment.appendChild(container.firstElementChild);
        }

        return fragment;
    }
}

interface ButtonHelperProps {
    hash: {
        id?: string;
        text?: string;
        dataPage?: string;
        type?: string;
        className?: string;
    };
}

export function buttonHelper(props: ButtonHelperProps): string {
    const button = new Button({
        id: props.hash.id,
        text: props.hash.text,
        dataPage: props.hash.dataPage,
        type: props.hash.type,
        className: props.hash.className
    });

    const content = button.getContent();
    return content ? content.outerHTML : '';
}
