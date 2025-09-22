import Block from "../ui/block";

interface ButtonProps {
    [key: string]: unknown;
    id?: string;
    text?: string;
    dataPage?: string;
    type?: string;
    className?: string;
    classDiv?: string;
    withIcon?: boolean;
    iconSrc?: string;
    iconAlt?: string;
    iconClass?: string;
    aria_label?: string;
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

        const iconHtml = this.props.withIcon && this.props.iconSrc
            ? `<img src="${this.props.iconSrc}" alt="${this.props.iconAlt || ''}" class="${this.props.iconClass || ''}">`
            : '';
        container.innerHTML = `
        <button 
          id="${this.props.id || ''}" 
          class="${this.props.className || 'button'}"
          ${this.props.dataPage ? `data-page="${this.props.dataPage}"` : ''}
          ${this.props.aria_label ? `aria-label="${this.props.aria_label}"` : ''}
          ${this.props.type ? `type="${this.props.type}"` : 'type="button"'}
        >
          ${this.props.text || ''}
          ${iconHtml}
        </button>
    `;
        if (this.props.classDiv) {
            if(this.element){
                this.element.className = this.props.classDiv;
            }
        }
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
        classDiv?: string;
        withIcon?: boolean;
        iconSrc?: string;
        iconAlt?: string;
        iconClass?: string;
        aria_label?: string;
    };
}

export function buttonHelper(props: ButtonHelperProps): string {
    const button = new Button({
        id: props.hash.id,
        text: props.hash.text,
        dataPage: props.hash.dataPage,
        type: props.hash.type,
        className: props.hash.className,
        classDiv: props.hash.classDiv,
        withIcon: props.hash.withIcon,
        iconSrc: props.hash.iconSrc,
        iconAlt: props.hash.iconAlt,
        iconClass: props.hash.iconClass,
        aria_label: props.hash.aria_label,
    });

    const content = button.getContent();
    return content ? content.outerHTML : '';
}
