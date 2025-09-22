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
  avatar: string;
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
      currentPage: 'profileEditData',
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
        second_name: 'Вол',
        display_name: 'Никита',
        avatar: '/photo.svg',
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

  changePage(page: string): void {
    this.state.currentPage = page;
    this.render();
  }

  public getState(): AppState {
    return this.state;
  }
  public setSelectedChat(id): void{
    this.state.selectedChat = this.state.chats.find((chat) => chat.id === id);
    this.render()
  }

  public setProfile(data): void{
    this.state.profile = {
      mail: data.email,
      login: data.login,
      first_name: data.first_name,
      second_name: data.second_name,
      display_name: data.display_name,
      phone: data.phone,
      avatar: data.avatar,
    }
  }
  public static getInstance(): App {
    if (!App.instance) {
      App.instance = new App();
    }
    return App.instance;
  }
}
