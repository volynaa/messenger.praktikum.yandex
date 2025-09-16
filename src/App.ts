import Handlebars from 'handlebars';
import * as Pages from './pages';

import Input from './components/Input';
import { buttonHelper } from './components/Button';

Handlebars.registerPartial('Input', Input);
Handlebars.registerHelper('Button', buttonHelper);

export interface Message {
  text: string;
  type: number;
  time: string;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  countNewMessage: number;
  message: Message[];
}

export interface Profile {
  mail: string;
  login: string;
  first_name: string;
  second_name: string;
  display_name: string;
  phone: string;
}

export interface AppState {
  currentPage: string;
  chats: Chat[];
  profile: Profile;
  selectedChat?: Chat;
}

export default class App {
  private static instance: App;

  private state: AppState;

  private appElement: HTMLElement | null;

  constructor() {
    this.state = {
      currentPage: 'login',
      chats: [
        {
          id: '1', name: 'Андрей', avatar: '', lastMessage: 'Привет!', time: '10:49', countNewMessage: 2,
          message: [{ text: 'Привет!', type: 0, time: '11:56' }, { text: 'Здравствуй!', type: 1, time: '11:58' }],
        },
        {
          id: '2', name: 'Никита', avatar: '', lastMessage: '', time: '11:24', countNewMessage: 0, message: [],
        },
      ],
      profile: {
        mail: 'rrr@mail.ru',
        login: 'rrr',
        first_name: 'Никита',
        second_name: 'В',
        display_name: 'Никита',
        phone: '88005553535',
      },
      selectedChat: undefined,
    };
    this.appElement = document.getElementById('app');
  }

  render(): void {
    if (!this.appElement) return;

    let template: Handlebars.TemplateDelegate<unknown>;
    if (this.state.currentPage === 'login') {
      template = Handlebars.compile(Pages.login);
      this.appElement.innerHTML = template({});
    } else if (this.state.currentPage === 'chats') {
      template = Handlebars.compile(Pages.chats);
      this.appElement.innerHTML = template({
        chats: this.state.chats,
        selected: this.state.selectedChat
      });
    } else if (this.state.currentPage === 'register') {
      template = Handlebars.compile(Pages.register);
      this.appElement.innerHTML = template({});
    } else if (this.state.currentPage === 'profileIndex') {
      template = Handlebars.compile(Pages.profileIndex);
      this.appElement.innerHTML = template({ profile: this.state.profile });
    } else if (this.state.currentPage === 'profileEditData') {
      template = Handlebars.compile(Pages.profileEditData);
      this.appElement.innerHTML = template({ profile: this.state.profile });
    } else if (this.state.currentPage === 'profileEditPassword') {
      template = Handlebars.compile(Pages.profileEditPassword);
      this.appElement.innerHTML = template({ profile: this.state.profile });
    } else {
      template = Handlebars.compile(Pages.error404);
      this.appElement.innerHTML = template({});
    }
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const backButton = document.getElementById('back-profile');
    if (backButton) {
      backButton.addEventListener('click', () => {
        this.changePage('chats');
      });
    }
    const backEditButton = document.getElementById('back-edit');
    if (backEditButton) {
      backEditButton.addEventListener('click', () => {
        this.changePage('profileIndex');
      });
    }
    const profileButton = document.getElementById('profile');
    if (profileButton) {
      profileButton.addEventListener('click', () => {
        this.changePage('profileIndex');
      });
    }
    const profileEditData = document.getElementById('editData');
    if (profileEditData) {
      profileEditData.addEventListener('click', () => {
        this.changePage('profileEditData');
      });
    }
    const profileEditPassword = document.getElementById('editPassword');
    if (profileEditPassword) {
      profileEditPassword.addEventListener('click', () => {
        this.changePage('profileEditPassword');
      });
    }
    const comebackButton = document.getElementById('comeback');
    if (comebackButton) {
      comebackButton.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const targetPage = target.dataset.page;
        if (targetPage) {
          this.changePage(targetPage);
        }
      });
    }
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach((chatItem) => {
      chatItem.addEventListener('click', () => {
        const chatId = chatItem.id;
        const selectedChat = this.state.chats.find((chat) => chat.id === chatId);

        this.state.selectedChat = selectedChat;
        this.render();
      });
    });
  }

  changePage(page: string): void {
    this.state.currentPage = page;
    this.render();
  }

  public getState(): AppState {
    return this.state;
  }

  public static getInstance(): App {
    if (!App.instance) {
      App.instance = new App();
    }
    return App.instance;
  }
}
