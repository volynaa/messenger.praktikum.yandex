import * as Pages from './pages';
import Router from './ui/router'
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
  email: string;
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
interface PageComponent {
  getContent: () => HTMLElement | null;
}
export default class App {
  private static instance: App;
  private router: Router;
  private state: AppState;

  private appElement: HTMLElement | null;

  constructor() {
    this.router = new Router('#app');

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
        email: 'rrr@mail.ru',
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
  private configureRoutes() {
    this.router
        .use('/', Pages.Login)
        .use('/messenger', Pages.Chats)
        .use('/settings', Pages.Profile)
        .use('/settings/data', Pages.Profile)
        .use('/settings/password', Pages.Profile)
        .use('/sign-up', Pages.Register)
        .use('/404', Pages.Error404)
        .use('/500', Pages.Error500)
        .start();
  }
  render(): void {
    this.configureRoutes()

  }

  public getState(): AppState {
    return this.state;
  }
  public setSelectedChat(id: string): void{
    this.state.selectedChat = this.state.chats.find((chat) => chat.id === id);
    this.render()
  }

  public setProfile(data: Partial<Profile>): void{
    this.state.profile = <Profile>{
      email: data.email,
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
