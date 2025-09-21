import * as Pages from './pages';
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
      currentPage: 'chats',
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
    this.appElement.innerHTML = '';
    let pageComponent: unknown;

    if (this.state.currentPage === 'login') {
      pageComponent = new Pages.Login();
    } else if (this.state.currentPage === 'chats') {
      pageComponent = new Pages.Chats();
    } else if (this.state.currentPage === 'register') {
      pageComponent = new Pages.Register();
    } else if (this.state.currentPage === 'profileIndex' || this.state.currentPage === 'profileEditData'
        || this.state.currentPage === 'profileEditPassword') {
      pageComponent = new Pages.Profile();
    } else {
      pageComponent = new Pages.Error404();
    }

    if (pageComponent && pageComponent.getContent) {
      const content = pageComponent.getContent();
      if (content) {
        this.appElement.appendChild(content);
      }
    }
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
