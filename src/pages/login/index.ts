import FormValidator from '../../ui/validation';
import App from '../../App';
import Block from "../../ui/block";
import loginTemplate from './login.hbs?raw';
import Handlebars from 'handlebars';
import { inputHelper } from '../../components/Input';
import { buttonHelper } from '../../components/Button';

export default class Login extends Block {
  private validator: FormValidator | null = null;

  constructor() {
    super('div', {
      events: {
        submit: (e: Event) => this.handleSubmit(e),
        click: (e: Event) => this.handleButtonClick(e)
      }
    })
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
  private handleSubmit(e: Event): void {
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
        const loginValue = formData.get('login');
        const password = formData.get('password');

        console.log('Логин:', loginValue);
        console.log('Пароль:', password);

        const targetPage = submitter.dataset.page;
        if (targetPage) {
          const app = App.getInstance();
          app.changePage(targetPage);
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
        const targetPage = e.target.dataset.page;
        if (targetPage) {
          const app = App.getInstance();
          app.changePage(targetPage);
        }
      }
    }
  }
}
