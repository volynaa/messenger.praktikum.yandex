import * as Pages from './pages';
import Router from './ui/router'
export default class App {
  private static instance: App;
  private router: Router;

  constructor() {
    this.router = new Router('#app');
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

  public static getInstance(): App {
    if (!App.instance) {
      App.instance = new App();
    }
    return App.instance;
  }
}
