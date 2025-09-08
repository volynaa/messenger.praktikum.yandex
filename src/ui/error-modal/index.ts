export interface ModalOptions {
    id: string;
    title: string;
    onClose?: () => void;
    onConfirm?: () => void;
}

export class ModalComponent {
    private modalElement: HTMLElement | null = null;
    private messageElement: HTMLElement | null = null;
    private options: ModalOptions;

    constructor(options: ModalOptions) {
        this.options = options;
        this.initialize();
    }

    private initialize(): void {
        this.modalElement = document.getElementById(this.options.id);
        this.messageElement = document.getElementById(`${this.options.id}-message`);
        console.log(this.modalElement)
        console.log(this.messageElement)
        if (!this.modalElement || !this.messageElement) {
            console.error('Modal elements not found');
            return;
        }

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        const closeBtn = this.modalElement!.querySelector('.modal-close');
        const okBtn = this.modalElement!.querySelector('.modal-button');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        if (okBtn) {
            okBtn.addEventListener('click', () => {
                if (this.options.onConfirm) {
                    this.options.onConfirm();
                }
                this.hide();
            });
        }

        // Закрытие по клику вне модального окна
        this.modalElement!.addEventListener('click', (e) => {
            if (e.target === this.modalElement) {
                this.hide();
            }
        });

        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                this.hide();
            }
        });
    }

    show(message: string): void {
        if (!this.messageElement || !this.modalElement) return;

        this.messageElement.textContent = message;
        this.modalElement.classList.add('show');

        // Блокируем скролл body
        document.body.style.overflow = 'hidden';

        // Фокус на кнопку OK для accessibility
        const okButton = this.modalElement.querySelector('.modal-button') as HTMLButtonElement;
        if (okButton) {
            setTimeout(() => okButton.focus(), 100);
        }
    }

    hide(): void {
        if (!this.modalElement) return;

        this.modalElement.classList.remove('show');
        document.body.style.overflow = '';

        if (this.options.onClose) {
            this.options.onClose();
        }
    }

    isVisible(): boolean {
        return this.modalElement?.classList.contains('show') || false;
    }

    updateMessage(message: string): void {
        if (this.messageElement) {
            this.messageElement.textContent = message;
        }
    }

    updateTitle(title: string): void {
        const titleElement = this.modalElement?.querySelector('.modal-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    // Статический метод для быстрого создания модального окна
    static createQuickModal(message: string, title: string = 'Ошибка'): ModalComponent {
        const modalId = `quick-modal-${Date.now()}`;

        // Создаем элемент модального окна
        const modalHtml = `
            <div id="${modalId}" class="modal">
                <div class="modal-content">
                    <span class="modal-close">&times;</span>
                    <h3 class="modal-title">${title}</h3>
                    <p id="${modalId}-message" class="modal-message">${message}</p>
                    <button class="modal-button">OK</button>
                </div>
            </div>
        `;

        // Добавляем в DOM
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Создаем и возвращаем экземпляр компонента
        const modal = new ModalComponent({
            id: modalId,
            title: title
        });

        // Автоматически показываем
        modal.show(message);

        return modal;
    }
}