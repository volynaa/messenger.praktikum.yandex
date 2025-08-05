import Handlebars from 'handlebars';
import * as Pages from './pages';

import Input from "./components/Input.js";
import Button from "./components/Button.js";

Handlebars.registerPartial('Input', Input)
Handlebars.registerPartial('Button', Button)

export default class App{
    constructor() {
        this.state = {
            currentPage: 'profileIndex',
            chats: [
                { id: "1", name: "Андрей", avatar: "", lastMessage:'Привет!',time:'10:49', countNewMessage: 2, message:[{text:'Привет!',type:0,time:'11:56'},{text:'Здравствуй!',type: 1,time:'11:58'}]  },
                { id: "2", name: "Никита", avatar: "", lastMessage:'',time:'11:24', countNewMessage: 0,message:[] }
            ],
            profile: {
                mail: 'rrr@mail.ru',
                login: 'rrr',
                first_name: 'Никита',
                second_name: 'В',
                display_name: 'Никита',
                phone: '88005553535'
            },
            selectedChat: undefined
        };
        this.appElement = document.getElementById('app');
    }


    render(){
        let template;
        console.log(this.state.currentPage)
        if (this.state.currentPage === 'loginPage'){
            template = Handlebars.compile(Pages.loginPage)
            this.appElement.innerHTML = template()
        }
        else if (this.state.currentPage === 'chatsPage'){
            template = Handlebars.compile(Pages.chatsPage)
            this.appElement.innerHTML = template({chats: this.state.chats, selected: this.state.selectedChat})
        }
        else if (this.state.currentPage === 'register'){
            template = Handlebars.compile(Pages.register)
            this.appElement.innerHTML = template()
        }
        else if (this.state.currentPage === 'profileIndex'){
            template = Handlebars.compile(Pages.profileIndex)
            this.appElement.innerHTML = template({profile: this.state.profile})
        }
        else if (this.state.currentPage === 'profileEditData'){
            template = Handlebars.compile(Pages.profileEditData)
            this.appElement.innerHTML = template({profile: this.state.profile})
        }

        else if (this.state.currentPage === 'profileEditPassword'){
            template = Handlebars.compile(Pages.profileEditPassword)
            this.appElement.innerHTML = template({profile: this.state.profile})
        }
        else{
            template = Handlebars.compile(Pages.error404)
            this.appElement.innerHTML = template()
        }
        this.attachEventListeners()
    }
    attachEventListeners() {
        const loginButton = document.getElementById('log-in');
        if (loginButton) {
            loginButton.addEventListener('click', (e) => {
                const targetPage = e.currentTarget.dataset.page;
                if (targetPage) {
                    this.changePage(targetPage);
                }
            });
        }
        const registerButton = document.getElementById('register');
        if (registerButton) {
            registerButton.addEventListener('click', (e) => {
                const targetPage = e.currentTarget.dataset.page;
                if (targetPage) {
                    this.changePage(targetPage);
                }
            });
        }
        const backButton = document.getElementById('back-profile');
        if (backButton) {
            backButton.addEventListener('click', (e) => {
                this.changePage('chatsPage');
            });
        }
        const backEditButton = document.getElementById('back-edit');
        if (backEditButton) {
            backEditButton.addEventListener('click', (e) => {
                this.changePage('profileIndex');
            });
        }
        const profileButton = document.getElementById('profile');
        if (profileButton) {
            profileButton.addEventListener('click', (e) => {
                this.changePage('profileIndex');
            });
        }
        const profileEditData = document.getElementById('editData');
        if (profileEditData) {
            profileEditData.addEventListener('click', (e) => {
                this.changePage('profileEditData');
            });
        }
        const profileEditPassword = document.getElementById('editPassword');
        if (profileEditPassword) {
            profileEditPassword.addEventListener('click', (e) => {
                this.changePage('profileEditPassword');
            });
        }
        const comebackButton = document.getElementById('comeback');
        if (comebackButton) {
            comebackButton.addEventListener('click', (e) => {
                const targetPage = e.currentTarget.dataset.page;
                if (targetPage) {
                    this.changePage(targetPage);
                }
            });
        }
        const chatItems = document.querySelectorAll('.chat-item');
        chatItems.forEach(chatItem => {
            chatItem.addEventListener('click', () => {
                const chatId = chatItem.id;
                const selectedChat = this.state.chats.find(chat => chat.id === chatId);

                this.state.selectedChat = selectedChat;

                this.render();
            });
        });
    }

    changePage(page){
        this.state.currentPage = page;
        this.render()
    }
}