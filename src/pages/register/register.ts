import FormValidator from '../../ui/validation';
import './register.pcss';
import Block from "../../ui/block";
import Handlebars from "handlebars";
import {inputHelper} from "../../components/Input";
import {buttonHelper} from "../../components/Button";
import registerTemplate from './register.hbs?raw';
import Router from '../../ui/router';
import { LogoutService} from '../../services/logout-service';
import Confirmation from "../../components/confirmation/Confirmation";
export default class Register extends Block {
  private validator: FormValidator | null = null;
  private readonly router = new Router('#app');
  private readonly logoutService = new LogoutService();
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
      const registerForm = this.element?.querySelector('#register-form') as HTMLFormElement;
      if (registerForm) {
        const formData = new FormData(registerForm);
        const targetPage = submitter.dataset.page;
        if (targetPage) {
          const res = await this.logoutService.signup(formData)
          if(res){
            this.router.go(targetPage);
          }
          else{
            Confirmation.show({
              message: 'Ошибка при регистрации пользователя. Попробуйте позже',
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
      if (target.id === 'log-in') {
        if (!e.target) return;

        const target = e.target as HTMLElement;
        const targetPage = target.dataset.page;
        if (targetPage) {
          this.router.go(targetPage);
        }
      }
    }
  }
}
