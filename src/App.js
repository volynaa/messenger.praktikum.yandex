import Handlebars from 'handlebars';
import * as Pages from './pages';

import Input from "./components/Input.js";
import Button from "./components/Button.js";

Handlebars.registerPartial('Input', Input)
Handlebars.registerPartial('Button', Button)
Handlebars.registerHelper('eq', function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
});
export default class App{
    constructor() {
        this.state = {
            currentPage: 'loginPage',
            questions: [],
            answers: [],
            chats: [
                { id: "1", name: "Андрей", avatar: "", lastMessage:'Привет!',time:'10:49', countNewMessage: 2, message:[{text:'Привет!',type:0,time:'11:56'},{text:'Здравствуй!',type: 1,time:'11:58'}]  },
                { id: "2", name: "Никита", avatar: "", lastMessage:'',time:'11:24', countNewMessage: 0,message:[] }
            ],
            selectedChat: undefined
        };
        this.appElement = document.getElementById('app');
    }

    render(){
        let template;
        console.log(this.state.currentPage)
        if (this.state.currentPage === 'chatsPage'){
            template = Handlebars.compile(Pages.loginPage)
            this.appElement.innerHTML = template({questions: this.state.questions})
        }
        else{
            template = Handlebars.compile(Pages.chatsPage)
            this.appElement.innerHTML = template({chats: this.state.chats, selected: this.state.selectedChat})
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