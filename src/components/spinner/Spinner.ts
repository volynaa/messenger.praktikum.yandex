import Block from '../../ui/block';
import './Spinner.pcss';

export interface SpinnerProps {
    size?: 'small' | 'medium' | 'large';
    color?: 'primary' | 'secondary' | 'white';
    text?: string;
    overlay?: boolean;
}

export class Spinner extends Block<SpinnerProps> {
    constructor(props: SpinnerProps = {}) {
        super('div', {
            size: 'medium',
            color: 'primary',
            overlay: false,
            ...props
        });
    }

    protected render(): DocumentFragment {
        const fragment = document.createDocumentFragment();
        const container = document.createElement('div');

        const spinnerClasses = [
            'spinner',
            `spinner--${this.props.size}`,
            `spinner--${this.props.color}`,
            this.props.overlay ? 'spinner--overlay' : ''
        ].filter(Boolean).join(' ');

        container.innerHTML = `
      ${this.props.overlay ? '<div class="spinner-overlay"></div>' : ''}
      <div class="${spinnerClasses}">
        <div class="spinner__circle"></div>
        ${this.props.text ? `<div class="spinner__text">${this.props.text}</div>` : ''}
      </div>
    `;

        fragment.appendChild(container);
        return fragment;
    }
}

export const spinnerHelper = function(this: any, options: any) {
    const props = options.hash;

    const spinner = new Spinner(props);
    return spinner.getContent()?.outerHTML || '';
};

