import Block from "../../ui/block";
import Handlebars from "handlebars";
import {buttonHelper} from "../../components/Button";
import { inputHelper } from '../../components/Input';
import { chatHelper } from '../../components/Chat';
import { imgHelper } from '../../components/Img';
import {modalHelper} from '../../components/modal/Modal';
import chats from './chats.hbs?raw';
import chatsUserList from './chatsUserList.hbs?raw';
import './chats.pcss'
import FormValidator from "../../ui/validation";
import {productionConfig} from "../../config/production";
import Router from '../../ui/router';
import {HttpStatus} from "../../api/base-api";
import {WebSocketTransport} from "../../ui/webSocket";
import {spinnerHelper} from "../../components/spinner/Spinner";
import Confirmation from "../../components/confirmation/Confirmation";
import UserStore, {User} from "../../stores/user";
import {ChatService} from "../../services/chat-service";
export interface Chat {
    id: number;
    created_by: number;
    avatar: string | null;
    title: string;
    last_message: object | null;
    unread_count: number;
}
interface ModalUser {
    title: string | null;
    content: string | null;
    name: string | null;
}
interface Message {
    user_id: number;
    content: string | null;
    time: string;
}
export default class Chats extends Block {
    private modalAddUser: ModalUser | null = null;
    private chatsList: Chat[] | null = null;
    private selectedChat: Chat | null = null;
    private message: Message[] | null = null;
    private openMenu: boolean = false;
    private userList: User[] = [];
    private deleteUserId: number | null = null;
    private socket: WebSocketTransport | null = null;
    private readonly router = new Router('#app');
    private readonly userStore = new UserStore().getUser();
    private readonly chatService = new ChatService();
    constructor() {
        super('div',{
            isLoading: true,
            events: {
                submit: (e: Event) => this.handleSubmit(e),
                click: (e: Event) => this.handleClick(e),
                change: (e: Event) => this.handleFileChange(e)
            }
        });
        this.chatService.getChats().then(r => {
            if(r) {
                this.chatsList = JSON.parse(r);
            }
            else {
                this.chatsList = []
            }
            this.setProps({ chats: this.chatsList })
        })
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
        Handlebars.registerHelper('avatarUrl', (avatarPath: string) => {
            const baseURL = `${productionConfig.baseURL}resources`;
            return `${baseURL}${avatarPath}`;
        });
        const currentUserId = this.userStore?.id;
        Handlebars.registerHelper('getTypeMessage', function(userId: number) {
            return Boolean(userId && currentUserId && userId === currentUserId);
        });
        Handlebars.registerHelper('eq', function(id) {
            return id === currentUserId;
        });
        Handlebars.registerPartial('chatsUserList', chatsUserList);
        const compiledTemplate = Handlebars.compile(chats);
        template.innerHTML = compiledTemplate({
            chats: this.chatsList,
            selected: this.selectedChat,
            modal: this.modalAddUser,
            message: this.message,
            openMenu: this.openMenu,
            userList: this.userList
        });
        fragment.appendChild(template.content.cloneNode(true));
        return fragment;

    }
    private handleFileChange(e: Event): void {
        const target = e.target as HTMLInputElement;
        if (target.id === 'avatar' && target.type === 'file') {
            const file = target.files?.[0];
            if (!file) return;
            this.chatService.loadAvatar(file,this.selectedChat?.id).then(r => {
                if (r) {
                    const newAvatar = encodeURIComponent(JSON.parse(r).avatar)
                    if (this.selectedChat && "avatar" in this.selectedChat) {
                        this.selectedChat.avatar = newAvatar
                    }
                    if (this.chatsList && this.selectedChat) {
                        const index = this.chatsList.findIndex(item => item.id === this.selectedChat?.id)
                        if(index >= 0){
                            this.chatsList[index].avatar = newAvatar
                        }
                        this.setProps({chats: this.chatsList, selected: this.selectedChat})
                    }
                } else {
                    Confirmation.show({
                        message: 'Ошибка при загрузки аватара. Попробуйте позже',
                        type: 'error'
                    });
                }
            });
            this.changeMenu()
        }
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
    private getUserList(){
        if(this.selectedChat){
            this.chatService.getUserList(this.selectedChat.id).then(r => {
                if(r){
                    this.userList = JSON.parse(r);
                    this.setProps({userList: this.userList});
                }
                else{
                    Confirmation.show({
                        message: 'Не удалось получить список пользователей. Попробуйте позже',
                        type: 'error'
                    });
                }
            })
        }
    }
    private handleClick(e: Event): void {
        const target = e.target as HTMLElement;
        if (target.getAttribute('type') === 'submit' || target.closest('#send-message')) {
            this.handleSubmit(e);
            return;
        }

        if(target.closest('#user-list')) {
            this.getUserList()
            return;
        }
        if(target.closest('#close-user-list')) {
            this.userList = [];
            this.setProps({userList: this.userList});
        }
        if(target.closest('#add-user') || target.closest('#modal-close')) {
            this.changeModal('Добавить пользователя');
            return;
        }
        if(target.closest('#delete-user')) {
            this.deleteUserId = (+target?.dataset?.userId||0)
            const userId = this.userList.findIndex(item => item.id === this.deleteUserId);
            if(userId >= 0){
                const deleteUser: User = this.userList[userId];
                const content = `Вы действительно хотите удалить пользователя 
                <strong>${deleteUser.first_name + ' ' + deleteUser.second_name}</strong>?`
                this.changeModal('Удалить пользователя',content);
            }

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
        if(target.closest('#save-result') && this.modalAddUser?.title === 'Удалить пользователя'){
            this.chatService.deleteUser(this.deleteUserId, this.selectedChat?.id).then(r => {
                if (r) {
                    Confirmation.show('Пользователь успешно удален');
                    this.changeModal();
                    if(this.userList.length){
                        this.userList = this.userList.filter(item => item?.id !== this.deleteUserId);
                        this.setProps({userList: this.userList})
                    }
                } else {
                    Confirmation.show({
                        message: 'Ошибка при удалении пользователя. Попробуйте позже',
                        type: 'error'
                    });
                }
            })
            return;
        }
        if(target.closest('#save-result') && this.modalAddUser?.title === 'Удалить чат'){
            this.chatService.deleteChat(this.selectedChat).then(r => {
                if(r && this.chatsList){
                    this.chatsList= this.chatsList.filter(item => item.id !== this.selectedChat?.id)
                    this.changeModal();
                    Confirmation.show('Чат успешно удален');
                    this.selectedChat = null;
                    this.setProps({ chats: this.chatsList, selected: this.selectedChat })
                }
                else{
                    Confirmation.show({
                        message: 'Ошибка при удалении чата. Попробуйте позже',
                        type: 'error'
                    })
                }
            })
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

            this.chatService.getTokenChats(this.selectedChat.id).then(r => {
                if(r){
                    this.soketConnect(r);
                }
            })
        }
    }
    private handleConnected(): void {
        this.socket?.send({
            content: '0',
            type: 'get old'
        });
    }

    private handleMessage(data: Message): void {
        if (Array.isArray(data)) {
            this.message = this.filterMessage(data).map(message => ({
                ...message,
                time: message.time ? message.time.slice(11, 16) : ''
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
                if(this.selectedChat){
                    this.selectedChat.last_message = newMessage;
                }
            }
            if(this.message){
                const time = data.time ? data.time.slice(11, 16) : ''
                this.message.push({
                    ...data,
                    time: time
                });
                this.setProps({ message: this.message, selected: this.selectedChat });
            }
        }
    }

    private filterMessage(data: Message[]): Message[]{
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
    private async soketConnect(token: string) {
        if(this.socket) {
            this.socket.close();
        }
        this.socket = new WebSocketTransport(`wss://${productionConfig.domain}/ws/chats/${this.userStore?.id}/${this.selectedChat?.id}/${token}`)
        this.socket.on(WebSocketTransport.Connected, this.handleConnected.bind(this));
        this.socket.on(WebSocketTransport.Message, (data: unknown) => {
            this.handleMessage(data as Message);
        });
        await this.socket.connect();

    }
    private async handleSubmit(e: Event) {
        e.preventDefault();
        const target = e.target as HTMLElement;

        if(target.closest('#save-result')) {
            if (this.handleBlur(e)) {
                const loginForm = this.element?.querySelector('#login-form') as HTMLFormElement;
                if (loginForm) {
                    const formData = new FormData(loginForm);
                    const resUserSearch = await this.chatService.searchUser(formData.get('save-result') as string)
                    const getUser = JSON.parse(resUserSearch.response)

                    if(!getUser.length){
                        Confirmation.show({
                            message: 'Пользователь не найден',
                            type: 'warning'
                        });
                        return;
                    }
                    const getUserBool = resUserSearch && resUserSearch.status === HttpStatus.Ok;
                    if (this.modalAddUser?.title === 'Добавить пользователя') {
                        if (getUserBool) {
                            this.chatService.addUser(+getUser[0].id, this.selectedChat?.id).then(r => {
                                if (r) {
                                    Confirmation.show('Пользователь успешно добавлен');
                                    this.changeModal();
                                    this.getUserList()

                                } else {
                                    Confirmation.show({
                                        message: 'Ошибка при добавлении пользователя. Попробуйте позже',
                                        type: 'error'
                                    });
                                }
                            })
                            return;
                        }
                    }

                    if (this.modalAddUser?.title === 'Добавить чат') {
                        const message = this.element?.querySelector('#save-result') as HTMLFormElement;
                        this.chatService.createChat(message.value).then(r => {
                            if (r) {
                                this.chatsList?.unshift({
                                    avatar: null,
                                    created_by: this.userStore ? this.userStore.id : 0,
                                    id: JSON.parse(r).id,
                                    last_message: null,
                                    title: message.value || 'New chat',
                                    unread_count: 0
                                })
                                this.changeModal();
                                Confirmation.show('Чат успешно добавлен');
                                this.setProps({chats: this.chatsList})
                            } else {
                                Confirmation.show({
                                    message: 'Ошибка при добавлении чата. Попробуйте позже',
                                    type: 'error'
                                });
                            }
                        });
                        return;
                    }
                }
            }
            return;
        }


        if(target.closest('#send-message')) {
            if(this.handleBlur(e,'message-form')){
                const message = this.element?.querySelector('#message') as HTMLFormElement;
                if(this.socket&&message?.value) {
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
        if(target.id === 'save-result' || target.closest('#send-message')) {
            const validLogin = new FormValidator(form)
            if (validLogin) {
                return validLogin.isValidOneElement(e);
            }
        }
        return false;
    }
}
