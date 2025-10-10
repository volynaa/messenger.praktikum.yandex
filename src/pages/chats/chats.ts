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
import {WebSocketTransport} from "../../ui/webSocket";
import {spinnerHelper} from "../../components/spinner/Spinner";
import Confirmation from "../../components/confirmation/Confirmation";
import UserStore from "../../stores/user";
import type {User} from "../../stores/user";
interface Chat {
    id: number;
    created_by: number;
    avatar: string | null;
    title: string;
    last_message: object | null;
    unread_count: number;
}
interface ApiResponse {
    status: number;
    response: string;
}
interface ModalUser {
    title: string | null;
    content: string | null;
    name: string | null;
}
interface Message {
    user_id: number;
    content: string | null;
    time: string | null;
}
export default class Chats extends Block {
    private router: Router;
    private http: BaseAPI;
    private modalAddUser: ModalUser | null = null;
    private chatsList: Chat[] | null = null;
    private selectedChat: Chat | null = null;
    private message: Message[] | null = null;
    private openMenu: boolean = false;
    private socket: WebSocketTransport | null = null;
    private readonly userStore: User | null = null;
    constructor() {
        super('div',{
            isLoading: true,
            events: {
                focusout : (e: Event) => this.handleBlur(e),
                submit: (e: Event) => this.handleSubmit(e),
                click: (e: Event) => this.handleClick(e),
                change: (e: Event) => this.handleFileChange(e)
            }
        });
        this.router = new Router('#app');
        this.http = new BaseAPI();
        this.userStore = new UserStore().getUser();
        this.getChats();
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
        Handlebars.registerHelper('isEmpty', function(array: unknown[]) {
            return Array.isArray(array) && array.length === 0;
        });

        const currentUserId = this.userStore?.id;
        Handlebars.registerHelper('getTypeMessage', function(userId: number) {
            return Boolean(userId && currentUserId && userId === currentUserId);
        });
        const compiledTemplate = Handlebars.compile(chats);
        template.innerHTML = compiledTemplate({
            chats: this.chatsList,
            selected: this.selectedChat,
            modal: this.modalAddUser,
            message: this.message,
            openMenu: this.openMenu
        });
        fragment.appendChild(template.content.cloneNode(true));
        return fragment;

    }
    private handleFileChange(e: Event): void {
        const target = e.target as HTMLInputElement;
        if (target.id === 'avatar' && target.type === 'file') {
            this.handleAvatarChange(e);
        }
    }
    private handleAvatarChange(e: Event): void {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;
    }

    private async getChats() {
        const res = await this.http.get('chats') as ApiResponse;
        if(res && res.status === 200) {
            this.chatsList = JSON.parse(res.response);
        }
        else {
            this.chatsList = []
        }
        this.setProps({ chats: this.chatsList })
    }
    public changeModal(title='', content = '',name=''): void {
        if(this.modalAddUser) {
            this.modalAddUser = null;
            this.openMenu = false;
        }
        else {
            this.modalAddUser = {title: title, content: content, name: name};
        }
        this.setProps({ modal: this.modalAddUser });
    }
    public changeMenu(): void {
        this.openMenu = !this.openMenu
        this.setProps({ openMenu: this.openMenu });
    }

    private handleClick(e: Event): void {
        const target = e.target as HTMLElement;
        if (target.getAttribute('type') === 'submit' || target.closest('#send-message')) {
            this.handleSubmit(e);
            return;
        }

        if(target.closest('#add-user') || target.closest('#modal-close')) {
            this.changeModal('Добавить пользователя');
            return;
        }
        if(target.closest('#delete-user')) {
            this.changeModal('Удалить пользователя');
            return;
        }
        if(target.closest('#delete-chat')) {
            const content = `Вы действительно хотите удалить чат "${this.selectedChat?.title}"?`
            this.changeModal('Удалить чат',content);
            return;
        }
        if(target.closest('#burger-menu')) {
            this.changeMenu();
            return;
        }
        if(target.closest('#add-chat')){
            this.changeModal('Добавить чат','','Имя');
            return;
        }
        if (target.closest('[data-page]')) {
            const targetPage = target.closest('[data-page]')?.getAttribute('data-page');
            if (targetPage) {
                this.router.go(targetPage);
            }
            return;
        }

        if(target.closest('#save-result') && this.modalAddUser?.title === 'Удалить чат'){
            this.deleteChat()
            return;
        }

        const chatElement = target.closest('.chat-item');
        if (!chatElement?.id) return;

        if (this.chatsList) {
            const findElem = this.chatsList.find(item => item.id === +chatElement.id);
            if (!findElem) return;
            this.selectedChat = findElem;
            this.message = null
            this.setProps({ selected: this.selectedChat, message: this.message });

            this.getTokenChats()
                .then(response => JSON.parse(response) as { token?: string })
                .then(data => {
                    this.soketConnect(data.token as string);
                });
        }
    }
    private async deleteChat() {
        const res = await this.http.delete('chats',{
            chatId: this.selectedChat?.id,
            title: this.selectedChat?.title
        }) as ApiResponse
        if(res && res.status === 200 && this.chatsList) {
            this.chatsList= this.chatsList.filter(item => item.id !== this.selectedChat?.id)
            this.changeModal();
            Confirmation.show('Чат успешно удален');
            this.setProps({ chats: this.chatsList })
        }
        else{
            Confirmation.show({
                message: 'Ошибка при удалении чата. Попробуйте позже',
                type: 'error'
            });
        }
    }
    private async createChat(name: string) {
        const res = await this.http.post('chats',{
            title: name || 'New chat'
        }) as ApiResponse
        if(res && res.status === 200) {
            this.chatsList?.unshift({
                avatar :null,
                created_by: this.userStore ? this.userStore.id : 0,
                id:JSON.parse(res.response).id,
                last_message: null,
                title: name || 'New chat',
                unread_count: 0
            })
            this.changeModal();
            Confirmation.show('Чат успешно добавлен');
            this.setProps({ chats: this.chatsList })
        }
        else{
            Confirmation.show({
                message: 'Ошибка при добавлении чата. Попробуйте позже',
                type: 'error'
            });
        }
    }
    private handleConnected(): void {
        this.socket?.send({
            content: '0',
            type: 'get old'
        });
    }

    private handleMessage(data: object): void {
        if (Array.isArray(data)) {
            this.message = this.filterMessage(data).map(message => ({
                ...message,
                time: message.time.slice(11, 16)
            }));
            this.setProps({ message: this.message });

        } else {
            const currentUser = this.userStore;
            const isCurrentUser = currentUser?.id === data.user_id;

            const newMessage = {
                content: data.content,
                time: data.time,
                user: {
                    login: isCurrentUser ? currentUser?.login : undefined
                }
            };

            if (this.selectedChat?.last_message) {
                Object.assign(this.selectedChat.last_message, newMessage);
            } else {
                this.selectedChat.last_message = newMessage;
            }
            if(this.message){
                this.message.push({
                    ...data,
                    time: data.time.slice(11, 16)
                });
                this.setProps({ message: this.message, selected: this.selectedChat });
            }
        }
    }

    private filterMessage(data){
        if (!data || data.length === 0) return [];
        const result = [...data];
        const n = result.length;

        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                const timeA = new Date(result[j].time);
                const timeB = new Date(result[j + 1].time);

                if (timeA > timeB) {
                    [result[j], result[j + 1]] = [result[j + 1], result[j]];
                }
            }
        }
        return result;
    }
    private async soketConnect(token) {
        if(this.socket) {
            this.socket.close();
        }
        this.socket = new WebSocketTransport(`wss://ya-praktikum.tech/ws/chats/${this.userStore.id}/${this.selectedChat.id}/${token}`)
        this.socket.on(WebSocketTransport.Connected, this.handleConnected.bind(this));
        this.socket.on(WebSocketTransport.Message, this.handleMessage.bind(this));
        await this.socket.connect();

    }
    private async getTokenChats() {
        const res = await this.http.post(`chats/token/${this.selectedChat?.id}`) as ApiResponse
        if(res && res.status === 200) {
            return res.response
        }
    }
    private async handleSubmit(e: Event) {
        e.preventDefault();
        const target = e.target as HTMLElement;

        if(target.closest('#save-result')) {
            if(this.handleBlur(e)){
                const loginForm = this.element?.querySelector('#login-form') as HTMLFormElement;
                if (loginForm) {
                    const formData = new FormData(loginForm);
                    const getUser = await this.http.post('user/search',{
                        login: formData.get('save-result')
                    }) as ApiResponse
                    const getUserBool = getUser && getUser.status === 200;
                    if(this.modalAddUser?.title === 'Добавить пользователя'){

                        if(getUserBool) {
                            const res = await this.http.put('chats/users',{
                                users: [+JSON.parse(getUser.response)[0].id],
                                chatId: this.selectedChat?.id,
                            }) as ApiResponse
                            if(res && res.status === 200) {
                                Confirmation.show('Пользователь успешно добавлен');
                                this.changeModal();
                                return;
                            }
                        }
                        Confirmation.show({
                            message: 'Ошибка при добавлении пользователя. Попробуйте позже',
                            type: 'error'
                        });
                    }
                    if(this.modalAddUser?.title === 'Удалить пользователя'){
                        if(getUserBool) {
                            const res = await this.http.delete('chats/users',{
                                users: [+JSON.parse(getUser.response)[0].id],
                                chatId: this.selectedChat?.id,
                            }) as ApiResponse
                            if(res && res.status === 200) {
                                Confirmation.show('Пользователь успешно удален');
                                this.changeModal();
                                return;
                            }
                        }
                        Confirmation.show({
                            message: 'Ошибка при удалении пользователя. Попробуйте позже',
                            type: 'error'
                        });

                    }
                    if(this.modalAddUser?.title === 'Добавить чат'){
                        const message = this.element?.querySelector('#save-result') as HTMLFormElement;
                        await this.createChat(message.value)
                        return;
                    }

            }

        }
            return;
        }


        if(target.closest('#send-message')) {
            if(this.handleBlur(e,'message-form')){
                const message = this.element?.querySelector('#message') as HTMLFormElement;
                if(this.socket&&message) {
                    this.socket.send({
                        content: message.value,
                        type: 'message'
                    });
                }
                return;
            }
        }
    }
    private handleBlur(e: Event,form: string = 'login-form'): boolean {
        const target = e.target as HTMLElement;
        if(target.id === 'save-result' || target.id === 'send-message') {
            const validLogin = new FormValidator(form)
            if (validLogin) {
                return validLogin.isValidOneElement(e);
            }
        }
        return false;
    }
}
