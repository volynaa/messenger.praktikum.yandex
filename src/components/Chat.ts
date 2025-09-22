import Block from "../ui/block";
import { Props } from '../ui/block';
interface ChatProps extends Props {
    id?: string;
    avatar?: string;
    name?: string;
    lastMessage?: string;
    countNewMessage?: string;
    time?: string;
    events?: {
        click?: (event: Event) => void;
    };
}

class Chat extends Block<ChatProps> {
    constructor(props: ChatProps) {
        super('div', props);
    }

    protected render(): DocumentFragment {
        const fragment = document.createDocumentFragment();
        const container = document.createElement('div');

        const avatarHtml = this.props.avatar
            ? `<img src="${this.props.avatar}" alt="Аватар пользователя">`
            : `<div class="chat-avatar"></div>`;

        const countMessageHtml = this.props.countNewMessage
            ? `<div class="chat-count-message">${this.props.countNewMessage}</div>`
            : '';

        container.innerHTML = `
            <div class="chat-item" id="${this.props.id || ''}">
                ${avatarHtml}
                <div class="chat-info">
                    <h2 class="chat-name">${this.props.name || ''}</h2>
                    <span class="last-message">${this.props.lastMessage || ''}</span>
                </div>
                <div class="chat-time">${this.props.time || ''}</div>
                ${countMessageHtml}
            </div>
        `;

        if (container.firstElementChild) {
            fragment.appendChild(container.firstElementChild);
        }

        return fragment;
    }
}

interface ChatHelperProps {
    hash: {
        id?: string;
        avatar?: string;
        name?: string;
        lastMessage?: string;
        countNewMessage?: string;
        time?: string;
    };
}

export function chatHelper(props: ChatHelperProps): string {
    const chat = new Chat({
        id: props.hash.id,
        avatar: props.hash.avatar,
        name: props.hash.name,
        lastMessage: props.hash.lastMessage,
        countNewMessage: props.hash.countNewMessage,
        time: props.hash.time,
    });

    const content = chat.getContent();
    return content ? content.outerHTML : '';
}
