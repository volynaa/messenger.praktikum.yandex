import Block from "../ui/block";
import { Props } from '../ui/block';
import UserStore from "../stores/user";
interface ChatProps extends Props {
    id?: string;
    avatar?: string;
    name?: string;
    lastMessage?: Record<string, unknown>;
    countNewMessage?: string;
    events?: {
        click?: (event: Event) => void;
    };
}

class Chat extends Block<ChatProps> {
    constructor(props: ChatProps) {
        super('div', props);
    }

    protected render(): DocumentFragment {
        const userStore = new UserStore();
        const fragment = document.createDocumentFragment();
        const container = document.createElement('div');
        const avatarHtml = this.props.avatar
            ? `<img src="${this.props.avatar}" alt="Аватар пользователя">`
            : `<div class="chat-avatar"></div>`;

        const countMessageHtml = this.props.countNewMessage
            ? `<div class="chat-count-message">${this.props.countNewMessage}</div>`
            : '';
        const currentUser = userStore?.getUser()
        const currentLogin = currentUser ? (currentUser as Record<string, unknown>).login : undefined;
        const currentTime = this.props.lastMessage ? (this.props.lastMessage?.time as string).slice(11,16) : ''
        container.innerHTML = `
            <div class="chat-item" id="${this.props.id || ''}">
                ${avatarHtml}
                <div class="chat-info">
                    <h2 class="chat-name">${this.props.name || ''}</h2>
                    <div>
                        <span class="last-message" style="color:var(--text-dark)">
                            ${(this.props.lastMessage?.user as Record<string, unknown>)?.login === currentLogin ? 'Вы: ': ''}
                        </span>
                        <span class="last-message">${this.props.lastMessage?.content || ''}</span>
                    </div>
                </div>
                <div class="chat-time">${currentTime}</div>
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
        lastMessage?: Record<string, unknown>;
        countNewMessage?: string;
    };
}

export function chatHelper(props: ChatHelperProps): string {
    const chat = new Chat({
        id: props.hash.id,
        avatar: props.hash.avatar,
        name: props.hash.name,
        lastMessage: props.hash.lastMessage,
        countNewMessage: props.hash.countNewMessage,
    });

    const content = chat.getContent();
    return content ? content.outerHTML : '';
}
