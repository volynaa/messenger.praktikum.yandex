import FormValidator from '../../ui/validation';
import Block from "../../ui/block";
import loginTemplate from './login.hbs?raw';
import Handlebars from 'handlebars';
import { inputHelper } from '../../components/Input';
import { buttonHelper } from '../../components/Button';
import Router from '../../ui/router';
import BaseAPI from '../../api/base-api';
import UserStore from '../../stores/user';
import Confirmation from "../../components/confirmation/Confirmation";

export default class Login extends Block {
  private validator: FormValidator | null = null;
  private router: Router;
  private http: BaseAPI;
  private userStore: UserStore;
  constructor() {
    super('div', {
      events: {
        focusout : (e: Event) => this.handleBlur(e),
        submit: (e: Event) => this.handleSubmit(e),
        click: (e: Event) => this.handleButtonClick(e)
      }
    })
    this.router = new Router('#app');
    this.http = new BaseAPI();
    this.userStore = new UserStore();
  }

  protected render(): DocumentFragment {
    const fragment = document.createDocumentFragment();
    const template = document.createElement('template');
    Handlebars.registerHelper('Input', inputHelper);
    Handlebars.registerHelper('Button', buttonHelper);
    const compiledTemplate = Handlebars.compile(loginTemplate);
    template.innerHTML = compiledTemplate({});
    fragment.appendChild(template.content.cloneNode(true));
    return fragment;
  }

  protected componentDidMount(): void {
    setTimeout(() => {
      this.initializeValidator();
    }, 0);
  }

  private initializeValidator(): void {
    try {
      const loginForm = this.element?.querySelector('#login-form') as HTMLFormElement;
      if (loginForm) {
        this.validator = new FormValidator('login-form');
      }
    } catch (error) {
      console.error('Form validation initialization error:', error);
    }
  }
  private handleBlur(e: Event): void {
    if (this.validator) {
      this.validator.isValidOneElement(e)
    }
  }
  private async handleSubmit(e: Event) {
    e.preventDefault();

    if (!this.validator) {
      console.error('Validator not initialized');
      return;
    }

    const submitter = (e as SubmitEvent).submitter;
    if (!submitter) {
      return;
    }

    if (this.validator.isValid()) {
      const loginForm = this.element?.querySelector('#login-form') as HTMLFormElement;
      if (loginForm) {
        const formData = new FormData(loginForm);

        const targetPage = submitter.dataset.page;
        if (targetPage) {
          const settings = {
            login: formData.get('login'),
            password: formData.get('password')
          }

          const resSignin = await this.http.post('auth/signin',settings)
          if(resSignin && resSignin.status === 200) {
            const resUser = await this.http.get('auth/user');

            if(resUser && resUser.status === 200) {
              this.userStore.setUser(JSON.parse(resUser.response));
              this.router.go(targetPage);
            }
            else{
              Confirmation.show({
                message: 'Ошибка авторизации. Попробуйте позже',
                type: 'error'
              });
            }
          }
          else{
            Confirmation.show({
              message: `${resSignin.status===401 ? 'Неверный логин или пароль':'Ошибка авторизации. Попробуйте позже'}`,
              type: 'error'
            });
          }
        }
      }
    }
  }

  private handleButtonClick(e: Event): void {
    const target = e.target as HTMLElement;

    if (target.tagName === 'BUTTON' || target.closest('button')) {
      const button = target.tagName === 'BUTTON' ? target : target.closest('button');
      if (!button) return;
      if (target.id === 'register') {
        const targetPage = target.dataset.page;
        if (targetPage) {
          this.router.go(targetPage);
        }
      }
    }
  }
}
