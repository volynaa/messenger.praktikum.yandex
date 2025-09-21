import Block from "../ui/block";

interface InputProps {
    [key: string]: unknown;
    id?: string;
    text?: string;
    dataPage?: string;
    type?: string;
    className?: string;
    value?:string;
    aria_label?:string;
    req?: boolean | string;
    events?: {
        click?: (event: Event) => void;
        submit?: (event: Event) => void;
    };
}

export default class Input extends Block<InputProps> {
    constructor(props: InputProps) {
        super('div', props);
    }

    protected render(): DocumentFragment {
        const fragment = document.createDocumentFragment();
        const container = document.createElement('div');
        container.innerHTML = `
      <input  
        id="${this.props.id || ''}" 
        class="${this.props.className || 'input'}"
        ${this.props.type ? `type="${this.props.type}"` : 'type="input"'}
        ${this.props.aria_label ? `aria-label="${this.props.aria_label}"` : ''}
        ${this.props.req ? `req="${this.props.req}"` : `req=${false}`}
        ${this.props.placeholder ? `placeholder="${this.props.placeholder}"` : 'placeholder=""'}
        ${this.props.value ? `value="${this.props.value}"` : 'value=""'}
        ${this.props.name ? `name="${this.props.name}"` : 'name=""'}
        ${this.props.minLen ? `minLen="${this.props.minLen}"` : 'minLen=""'}
        ${this.props.maxLen ? `maxLen="${this.props.maxLen}"` : 'maxLen=""'}
        ${this.props.pat ? `pat="${this.props.pat}"` : 'pat=""'}
      </input>
    `;

        if (container.firstElementChild) {
            fragment.appendChild(container.firstElementChild);
        }

        return fragment;
    }
}

interface InputHelperProps {
    hash: {
        id?: string;
        type?: string;
        placeholder?: string;
        value?: string;
        name?: string;
        minLen?: string;
        maxLen?: string;
        pat?: string;
        className?: string;
        req?: boolean | string;
    };
}

export function inputHelper(props: InputHelperProps): string {
    const input = new Input({
        id: props.hash.id,
        type: props.hash.type,
        placeholder: props.hash.placeholder,
        value: props.hash.value,
        name: props.hash.name,
        minLen: props.hash.minLen,
        maxLen: props.hash.maxLen,
        pat: props.hash.pat,
        className: props.hash.className,
        req: props.hash.req
    });

    const content = input.getContent();
    return content ? content.outerHTML : '';
}

