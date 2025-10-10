import Block, {Props} from '../../ui/block';
import './Spinner.pcss';
import {Modal} from "../modal/Modal";

interface SpinnerProps extends Props{
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
interface spinnerHelperProps {
    hash: {
        size?: 'small' | 'medium' | 'large';
        color?: 'primary' | 'secondary' | 'white';
        text?: string;
        className?: string;
    };
}
export function spinnerHelper(props: spinnerHelperProps): string {
    const modal = props.hash;

    const spinner = new Spinner(modal);
    return spinner.getContent()?.outerHTML || '';
}
