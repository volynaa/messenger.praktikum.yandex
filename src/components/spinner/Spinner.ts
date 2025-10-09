import Block from '../../ui/block';
import './Spinner.pcss';

export interface SpinnerProps {
    size?: 'small' | 'medium' | 'large';
    color?: 'primary' | 'secondary' | 'white';
    text?: string;
    className?: string;
}

export class Spinner extends Block<SpinnerProps> {
    constructor(props: SpinnerProps = {}) {
        super('div', {
            size: 'medium',
            color: 'primary',
            ...props
        });
    }

    protected render(): DocumentFragment {
        const fragment = document.createDocumentFragment();
        const container = document.createElement('div');

        const spinnerClasses = [
            'spinner',
            `spinner-${this.props.size}`,
            `spinner-${this.props.color}`,
            this.props.className ? this.props.className : ''
        ].filter(Boolean).join(' ');

        container.innerHTML = `
      <div class="${spinnerClasses}">
        <div class="spinner-circle"></div>
        ${this.props.text ? `<div class="spinner-text">${this.props.text}</div>` : ''}
      </div>
    `;

        fragment.appendChild(container);
        return fragment;
    }
}

export const spinnerHelper = function(this: unknown, options: unknown) {
    const props = options.hash;

    const spinner = new Spinner(props);
    return spinner.getContent()?.outerHTML || '';
};

