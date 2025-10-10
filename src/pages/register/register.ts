import FormValidator from '../../ui/validation';
import './register.pcss';
import Block from "../../ui/block";
import Handlebars from "handlebars";
import {inputHelper} from "../../components/Input";
import {buttonHelper} from "../../components/Button";
import registerTemplate from './register.hbs?raw';
import BaseAPI from '../../api/base-api';
import Router from '../../ui/router';
import UserStore from "../../stores/user";
interface ApiResponse {
  status: number;
  response: string;
}
export default class Register extends Block {
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
          const resSignup = await this.http.post('auth/signup', {
            first_name: formData.get('first_name'),
            second_name: formData.get('second_name'),
            login: formData.get('login'),
            email: formData.get('email'),
            password: formData.get('password'),
            phone: formData.get('phone')
          }) as ApiResponse
          if(resSignup && resSignup.status === 200) {
            const resUser = await this.http.get('auth/user') as ApiResponse;

            if(resUser && resUser.status === 200) {
              this.userStore.setUser(JSON.parse(resUser.response));
              this.router.go(targetPage);
            }
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
