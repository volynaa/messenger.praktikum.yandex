import './Confirmation.pcss'
interface ConfirmationOptions {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

export default class Confirmation {
    static show(options: ConfirmationOptions | string): void {
        const config: ConfirmationOptions = typeof options === 'string'
            ? { message: options }
            : options;

        const {
            message,
            type = 'success',
            duration = 3000
        } = config;

        const confirmation = document.createElement('div');
        confirmation.className = `toast toast-${type}`;
        confirmation.innerHTML = `
      <div class="toast-content">
        <span class="toast-message">${message}</span>
      </div>
    `;

        this.addStyles();

        document.body.appendChild(confirmation);

        setTimeout(() => confirmation.classList.add('toast-show'), 10);

        if (duration > 0) {
            setTimeout(() => this.hideConfirmation(confirmation), duration);
        }
    }

    private static hideConfirmation(confirmation: HTMLElement): void {
        confirmation.classList.remove('toast-show');
        confirmation.classList.add('toast-hide');

        setTimeout(() => {
            if (confirmation.parentNode) {
                confirmation.parentNode.removeChild(confirmation);
            }
        }, 300);
    }

    private static addStyles(): void {
        if (document.getElementById('toast-styles')) return;

        const styleElement = document.createElement('style');
        styleElement.id = 'toast-styles';
        document.head.appendChild(styleElement);
    }
}
