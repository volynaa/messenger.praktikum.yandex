import Block from "../../ui/block";
import Handlebars from "handlebars";
import {buttonHelper} from "../../components/Button";
import { inputHelper } from '../../components/Input';
import { chatHelper } from '../../components/Chat';
import { imgHelper } from '../../components/Img';
import App from "../../App";
import chats from './chats.hbs?raw';
import './chats.pcss'
import FormValidator from "../../ui/validation";
import Router from '../../ui/router';
import BaseAPI from "../../api/base-api";
export default class Chats extends Block {
    private validator: FormValidator | null = null;
    private router: Router;
    private http: BaseAPI;
    constructor() {
        super('div',{
            events: {
                submit: (e: Event) => this.handleSubmit(e),
                click: (e: Event) => this.handleClick(e)
            }
        });
        this.router = new Router('#app');
    }

    protected render(): DocumentFragment {
        const app = App.getInstance();
        const state = app.getState();
        const fragment = document.createDocumentFragment();
        const template = document.createElement('template');
        Handlebars.registerHelper('Button', buttonHelper);
        Handlebars.registerHelper('Input', inputHelper);
        Handlebars.registerHelper('Chat', chatHelper);
        Handlebars.registerHelper('Img', imgHelper);
        this.http = new BaseAPI();
        const chatsList = this.getChats();
        const compiledTemplate = Handlebars.compile(chats);
        template.innerHTML = compiledTemplate({chats: chatsList | [], selected: state.selectedChat});
        fragment.appendChild(template.content.cloneNode(true));
        return fragment;

    }
    protected componentDidMount(): void {
        setTimeout(() => {
                this.initializeValidator();
        }, 100);
    }
    private async getChats() {
        const res = await this.http.get('chats')
        if(res && res.status === 200) {
            return res;
        }
    }
    private initializeValidator(): void {
        try {
            const messageForm = this.element?.querySelector('#message-form') as HTMLFormElement;
            if (messageForm) {
                this.validator = new FormValidator('message-form');
            }
        } catch (error) {
            console.error('Form validation initialization error:', error);
        }
    }
    private handleClick(e: Event): void {
        const target = e.target as HTMLElement;
        if (target.closest('#sendMessage') || target.closest('.button-send')) {
            this.handleSubmit(e);
            return;
        }
        const app = App.getInstance();
        if (target.closest('[data-page]')) {
            const targetPage = target.closest('[data-page]')?.getAttribute('data-page');
            if (targetPage) {
                this.router.go(targetPage);
            }
            return;
        }

        const chatElement = target.closest('.chat-item');
        if (chatElement) {
            const chatId = chatElement.getAttribute('id');
            if (chatId) {
                app.setSelectedChat(chatId)
            }
        }
    }

    private handleSubmit(e: Event): void {
        e.preventDefault();
        if (!this.validator) {
            console.error('Validator not initialized');
            return;
        }

        if (this.validator.isValid()) {
            const messageForm = this.element?.querySelector('#message-form') as HTMLFormElement;
            if (messageForm) {
                const formData = new FormData(messageForm);
                console.log('Сообщение:', formData.get('message'));
            }
        }
    }
}
