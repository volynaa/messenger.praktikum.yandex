import Block from "../../ui/block";
import Handlebars from "handlebars";
import {buttonHelper} from "../../components/Button";
import { inputHelper } from '../../components/Input';
import { chatHelper } from '../../components/Chat';
import { imgHelper } from '../../components/Img';
import {modalHelper} from '../../components/modal/Modal';
import chats from './chats.hbs?raw';
import './chats.pcss'
import FormValidator from "../../ui/validation";
import Router from '../../ui/router';
import BaseAPI from "../../api/base-api";
import {spinnerHelper} from "../../components/spinner/Spinner";
export default class Chats extends Block {
    private validator: FormValidator | null = null;
    private router: Router;
    private http: BaseAPI;
    private modal: boolean = false;
    private chatsList: [] | null = null;
    private selectedChat: {};
    constructor() {
        super('div',{
            isLoading: true,
            events: {
                focusout : (e: Event) => this.handleBlur(e),
                submit: (e: Event) => this.handleSubmit(e),
                click: (e: Event) => this.handleClick(e)
            }
        });
        this.router = new Router('#app');
    }

    protected render(): DocumentFragment {
        const fragment = document.createDocumentFragment();
        const template = document.createElement('template');
        Handlebars.registerHelper('Button', buttonHelper);
        Handlebars.registerHelper('Input', inputHelper);
        Handlebars.registerHelper('Chat', chatHelper);
        Handlebars.registerHelper('Img', imgHelper);
        Handlebars.registerHelper('Modal', modalHelper);
        Handlebars.registerHelper('Spinner', spinnerHelper);
        Handlebars.registerHelper('isEmpty', function(array: any[]) {
            return Array.isArray(array) && array.length === 0;
        });
        const compiledTemplate = Handlebars.compile(chats);
        template.innerHTML = compiledTemplate({
            chats: this.chatsList,
            selected: this.selectedChat,
            modal: this.modal
        });
        fragment.appendChild(template.content.cloneNode(true));
        return fragment;

    }
    protected async componentDidMount() {
        this.http = new BaseAPI();
        await this.getChats();
        this.initializeValidator();
    }
    private async getChats() {
        const res = await this.http.get('chats')
        if(res && res.status === 200) {
            this.chatsList = JSON.parse(res.response);
        }
        else {
            this.chatsList = []
        }
        this.setProps({ chats: this.chatsList })
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

    public changeModal(): void {
        this.modal = !this.modal;
        this.setProps({ modal: this.modal });
    }
    private handleClick(e: Event): void {
        const target = e.target as HTMLElement;
        if (target.type === 'submit') {
            this.handleSubmit(e);
            return;
        }

        if(target.id === 'add-chat' || target.id === 'modal-close') {
            this.changeModal();
            return;
        }
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
                const findElem = this.chatsList.find(item => item.id === +chatId)
                if(findElem) {
                    this.selectedChat = findElem
                    this.setProps({ selected: this.selectedChat });
                }
            }
        }
    }

    private async handleSubmit(e: Event) {
        e.preventDefault();
        const target = e.target
        if(target.id === 'login' && this.handleBlur(e)) {
            const res = await this.http.post('chats',{
                title: 'Новый чат'
            })
            if(res && res.status === 200) {

            }
            return;
        }
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

    private handleBlur(e: Event): boolean {
        if(e.target.id === 'login'){
            const validLogin = new FormValidator('login-form')
            if (validLogin) {
                return validLogin.isValidOneElement(e);
            }
        }
        return false;
    }
}
