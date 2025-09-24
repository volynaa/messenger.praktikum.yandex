import './profile.pcss'
import Block from "../../ui/block";
import Handlebars from "handlebars";
import { inputHelper } from '../../components/Input';
import { buttonHelper } from '../../components/Button';
import { imgHelper } from '../../components/Img';
import App from "../../App";
import profileIndex from './profileIndex.hbs?raw';
import profileEditData from './profileEditData.hbs?raw';
import profileEditPassword from './profileEditPassword.hbs?raw';
import FormValidator from "../../ui/validation";
const templates = {
    profileIndex,
    profileEditData,
    profileEditPassword
};
export interface ProfileData {
    email: string;
    login: string;
    first_name: string;
    second_name: string;
    display_name: string;
    avatar: string;
    phone: string;
}
export default class Profile extends Block {
    private validator: FormValidator | null = null;
    constructor() {
        super('div',{
            events: {
                focusout : (e: Event) => this.handleBlur(e),
                submit: (e: Event) => this.handleSubmit(e),
                click: (e: Event) => this.handleButtonClick(e)
            }
        });
    }

    protected render(): DocumentFragment {
        const app = App.getInstance();
        const state = app.getState();
        const fragment = document.createDocumentFragment();
        const template = document.createElement('template');
        Handlebars.registerHelper('Input', inputHelper);
        Handlebars.registerHelper('Button', buttonHelper);
        Handlebars.registerHelper('Img', imgHelper);
        const templateContent = templates[state.currentPage as keyof typeof templates] || profileIndex;
        const compiledTemplate = Handlebars.compile(templateContent);
        template.innerHTML = compiledTemplate({profile: state.profile});
        fragment.appendChild(template.content.cloneNode(true));
        return fragment;

    }
    protected componentDidMount(): void {
        setTimeout(() => {
            this.initializeValidator();
        }, 100);
    }

    private initializeValidator(): void {
        try {
            const registerForm = this.element?.querySelector('#input-container') as HTMLFormElement;
            if (registerForm) {
                this.validator = new FormValidator('input-container');
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
    private handleButtonClick(e: Event): void {
        const target = e.target as HTMLElement;
        if ((target as HTMLButtonElement).type !== 'submit') {
            if (target.closest('[data-page]')) {
                const targetPage = target.closest('[data-page]')?.getAttribute('data-page');

                if (targetPage) {
                    const app = App.getInstance();
                    app.changePage(targetPage);
                }
                return;
            }
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
            const registerForm = this.element?.querySelector('#input-container') as HTMLFormElement;
            if (registerForm) {
                const app = App.getInstance();

                const formData = new FormData(registerForm as HTMLFormElement);
                if(app.getState().currentPage === 'profileEditData'){
                    const data: Partial<ProfileData> = {
                        email: this.getFormValue(formData, 'email'),
                        login: this.getFormValue(formData, 'login'),
                        first_name: this.getFormValue(formData, 'first_name'),
                        display_name: this.getFormValue(formData, 'display_name'),
                        second_name: this.getFormValue(formData, 'second_name'),
                        phone: this.getFormValue(formData, 'phone'),
                    }
                    console.log('Почта:', data.email);
                    console.log('Логин:', data.login);
                    console.log('Имя:', data.first_name);
                    console.log('Имя в чате:', data.display_name);
                    console.log('Фамилия:', data.second_name);
                    console.log('Телефон:', data.phone);
                    app.setProfile(data)
                }
                else{
                    console.log('Старый пароль:', formData.get('old_password'));
                    console.log('Новый пароль:', formData.get('new_password'));
                    console.log('Новый пароль еще раз:', formData.get('doublePassword'));
                }
                const targetPage = submitter.dataset.page;
                if (targetPage) {
                    app.changePage(targetPage);
                }
            }
        }
    }
    private getFormValue(formData: FormData, fieldName: string): string {
        const value = formData.get(fieldName);
        return value ? value.toString() : '';
    }
}
