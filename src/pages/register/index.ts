import FormValidator from '../../ui/validation';
import App from '../../App';
import './register.pcss';
import Block from "../../ui/block";
import Handlebars from "handlebars";
import {inputHelper} from "../../components/Input";
import {buttonHelper} from "../../components/Button";
import registerTemplate from './register.hbs?raw';
export default class Register extends Block {
  private validator: FormValidator | null = null;

  constructor() {
    super('div', {
      events: {
        focusout : (e: Event) => this.handleBlur(e),
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
    const compiledTemplate = Handlebars.compile(registerTemplate);
    template.innerHTML = compiledTemplate({});
    fragment.appendChild(template.content.cloneNode(true));
    return fragment;
  }

  protected componentDidMount(): void {
    setTimeout(() => {
      this.initializeValidator();
    }, 0);
  }
  private handleBlur(e: Event): void {
    if (this.validator) {
      this.validator.isValidOneElement(e)
    }
  }
  private initializeValidator(): void {
    try {
      const registerForm = this.element?.querySelector('#register-form') as HTMLFormElement;
      if (registerForm) {
        this.validator = new FormValidator('register-form');
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
      const registerForm = this.element?.querySelector('#register-form') as HTMLFormElement;
      if (registerForm) {
        const formData = new FormData(registerForm);

        console.log('Почта:', formData.get('email'));
        console.log('Логин:', formData.get('login'));
        console.log('Имя:', formData.get('first_name'));
        console.log('Фамилия:', formData.get('second_name'));
        console.log('Телефон:', formData.get('phone'));
        console.log('Пароль:', formData.get('password'));
        console.log('Пароль еще раз:', formData.get('doublePassword'));

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
      if (target.id === 'log-in') {
        if (!e.target) return;

        const target = e.target as HTMLElement;
        const targetPage = target.dataset.page;
        if (targetPage) {
          const app = App.getInstance();
          app.changePage(targetPage);
        }
      }
    }
  }
}
