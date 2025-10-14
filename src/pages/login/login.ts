import FormValidator from '../../ui/validation';
import Block from "../../ui/block";
import loginTemplate from './login.hbs?raw';
import Handlebars from 'handlebars';
import { inputHelper } from '../../components/Input';
import { buttonHelper } from '../../components/Button';
import Router from '../../ui/router';
import { AuthService } from '../../services/auth-service';
import Confirmation from "../../components/confirmation/Confirmation";
export default class Login extends Block {
  private validator: FormValidator | null = null;
  private readonly router = new Router('#app');
  private readonly authService = new AuthService();

  constructor() {
    super('div', {
      events: {
        focusout: (e: Event) => this.handleBlur(e),
        submit: (e: Event) => this.handleSubmit(e),
        click: (e: Event) => this.handleButtonClick(e)
      }
    });
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
      this.validator.isValidOneElement(e);
    }
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();

    if (!this.validator) {
      console.error('Validator not initialized');
      return;
    }

    const submitter = (e as SubmitEvent).submitter;
    if (!submitter) {
      return;
    }

    if (!this.validator.isValid()) {
      return;
    }

    const loginForm = this.element?.querySelector('#login-form') as HTMLFormElement;
    if (!loginForm) {
      return;
    }

    const formData = new FormData(loginForm);
    const targetPage = submitter.dataset.page;

    if (!targetPage) {
      return;
    }

    await this.processLogin(formData, targetPage);
  }

  private async processLogin(formData: FormData, targetPage: string): Promise<void> {
    const loginData = {
      login: formData.get('login') as string,
      password: formData.get('password') as string
    };

    const isSuccess = await this.authService.login(loginData);

    if (isSuccess) {
      this.router.go(targetPage);
    } else {
      Confirmation.show({
        message: 'Неверный логин или пароль',
        type: 'error'
      });
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
