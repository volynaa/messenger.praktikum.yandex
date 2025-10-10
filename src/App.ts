import * as Pages from './pages';
import Router from './ui/router'
import Block from "./ui/block";
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
export default class App {
  private static instance: App;
  private router: Router;

  constructor() {
    this.router = new Router('#app');
  }
  private configureRoutes() {
    this.router
        .use('/', Pages.Login as Block)
        .use('/messenger', Pages.Chats as Block)
        .use('/settings', Pages.Profile as Block)
        .use('/settings/data', Pages.Profile as Block)
        .use('/settings/password', Pages.Profile as Block)
        .use('/sign-up', Pages.Register as Block)
        .use('/404', Pages.Error404 as Block)
        .use('/500', Pages.Error500 as Block)
        .start();
  }
  render(): void {
    this.configureRoutes()

  }

  public static getInstance(): App {
    if (!App.instance) {
      App.instance = new App();
    }
    return App.instance;
  }
}
