import './profile.pcss'
import Block from "../../ui/block";
import Handlebars from "handlebars";
import { inputHelper } from '../../components/Input';
import { buttonHelper } from '../../components/Button';
import { imgHelper } from '../../components/Img';
import profileIndex from './profileIndex.hbs?raw';
import profileEditData from './profileEditData.hbs?raw';
import profileEditPassword from './profileEditPassword.hbs?raw';
import FormValidator from "../../ui/validation";
import Router from '../../ui/router';
import BaseAPI from '../../api/base-api';
import UserStore from '../../stores/user';
import Confirmation from "../../components/confirmation/Confirmation";
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
    private router: Router;
    private http: BaseAPI;
    private readonly userStore: UserStore;
    constructor() {
        super('div',{
            events: {
                focusout : (e: Event) => this.handleBlur(e),
                submit: (e: Event) => this.handleSubmit(e),
                click: (e: Event) => this.handleButtonClick(e),
                change: (e: Event) => this.handleFileChange(e)
            }
        });
        this.router = new Router('#app');
        this.http = new BaseAPI();
        this.userStore = new UserStore();
        console.log(this.userStore.getUser())
        this.setProps({profile: this.userStore?.getUser()})
    }

    protected render(): DocumentFragment {
        const templates = {
            '/settings/data':profileEditData,
            '/settings/password':profileEditPassword
        };
        const fragment = document.createDocumentFragment();
        const template = document.createElement('template');
        Handlebars.registerHelper('Input', inputHelper);
        Handlebars.registerHelper('Button', buttonHelper);
        Handlebars.registerHelper('Img', imgHelper);
        Handlebars.registerHelper('avatarUrl', (avatarPath: string) => {
            if (!avatarPath) return '/photo.svg';
            const baseURL = 'https://ya-praktikum.tech/api/v2/resources';
            return `${baseURL}${avatarPath}`;
        });
        const templateContent = templates[window.location.pathname] || profileIndex;
        const compiledTemplate = Handlebars.compile(templateContent);

        template.innerHTML = compiledTemplate({profile: this.userStore?.getUser() || {}});
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
            const registerForm = this.element?.querySelector('#input-container') as HTMLFormElement;
            if (registerForm) {
                this.validator = new FormValidator('input-container');
            }
        } catch (error) {
            console.error('Form validation initialization error:', error);
        }
    }
    private handleFileChange(e: Event): void {
        const target = e.target as HTMLInputElement;
        if (target.id === 'avatar' && target.type === 'file') {
            this.handleAvatarChange(e);
        }
    }
    private handleAvatarChange(e: Event): void {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;
        this.showAvatarPreview(file);
    }

    private showAvatarPreview(file: File): void {
        const reader = new FileReader();

        reader.onload = (e) => {
            const preview = this.element?.querySelector('.avatar-preview') as HTMLImageElement;
            if (preview && e.target?.result) {
                preview.src = e.target.result as string;
            }
        };
        reader.readAsDataURL(file);
    }
    private handleBlur(e: Event): void {
        if (this.validator) {
            this.validator.isValidOneElement(e)
        }
    }
    private async editPassword(data) {
        const res = await this.http.put('user/password',{
            oldPassword: data.oldPassword,
            newPassword: data.newPassword
        })
        if(res && res.status === 200) {
            Confirmation.show('Пароль успешно изменен');
        }
        else {
            Confirmation.show({
                message: 'Ошибка при изменении пароля. Попробуйте позже',
                type: 'error'
            });
        }
    }
    private async uploadAvatar(file: File): Promise<void> {
        const formData = new FormData();
        formData.append('avatar', file);

        await this.http.put('user/profile/avatar', formData);
    }
    private async editData(data) {
        const res = await this.http.put('user/profile',{
            first_name: data.first_name,
            second_name: data.second_name,
            login: data.login,
            email: data.email,
            display_name: data.display_name,
            phone: data.phone,
        })
        if(res && res.status === 200) {
            const user = this.userStore.getUser()
            Object.assign(user, data);
            user.avatar = JSON.parse(res.response).avatar
            await this.userStore.setUser(user)
            this.setProps({profile: user}) // Не пойму почему не обновляются данные пользователя
            Confirmation.show('Данные успешно изменены');
        }
        else {
            Confirmation.show({
                message: 'Ошибка при изменении данных. Попробуйте позже',
                type: 'error'
            });
        }

    }
    private async handleButtonClick(e: Event) {
        const target = e.target as HTMLElement;
        if ((target as HTMLButtonElement).type !== 'submit') {
            if (target.closest('[data-page]')) {
                const targetPage = target.closest('[data-page]')?.getAttribute('data-page');
                if (targetPage) {
                    if(targetPage === '/'){
                        this.userStore.outUser()
                        await this.http.post('auth/logout',{})
                    }
                    this.router.go(targetPage);
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
                const path = this.router.getPath()
                const formData = new FormData(registerForm as HTMLFormElement);
                const avatarInput = this.element?.querySelector('#avatar') as HTMLInputElement;
                if(path === '/settings/data'){
                    const data: Partial<ProfileData> = {
                        email: this.getFormValue(formData, 'email'),
                        login: this.getFormValue(formData, 'login'),
                        first_name: this.getFormValue(formData, 'first_name'),
                        display_name: this.getFormValue(formData, 'display_name'),
                        second_name: this.getFormValue(formData, 'second_name'),
                        phone: this.getFormValue(formData, 'phone'),
                    }
                    if(avatarInput?.files[0]){
                        this.uploadAvatar(avatarInput.files[0])
                    }
                    this.editData(data)
                }
                if(path === '/settings/password'){
                    const data = {
                        oldPassword: formData.get('old_password'),
                        newPassword: formData.get('new_password')
                    }
                    this.editPassword(data)
                }
                const targetPage = submitter.dataset.page;
                if (targetPage) {
                   this.router.go(targetPage);
                }
            }
        }
    }
    private getFormValue(formData: FormData, fieldName: string): string {
        const value = formData.get(fieldName);
        return value ? value.toString() : '';
    }
}
