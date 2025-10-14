import BaseAPI, { HttpStatus } from '../../src/api/base-api';
import UserStore from '../../src/stores/user';

export class LogoutService {
    private readonly http = new BaseAPI();
    private readonly userStore = new UserStore();

    async signup(formData: FormData): Promise<boolean> {
        if (!this.userStore.getUser()) {
            await this.http.post('auth/logout', {});
        }

        const resSignup = await this.http.post('auth/signup', {
            first_name: formData.get('first_name'),
            second_name: formData.get('second_name'),
            login: formData.get('login'),
            email: formData.get('email'),
            password: formData.get('password'),
            phone: formData.get('phone')
        })
        if(resSignup && resSignup.status === HttpStatus.Ok) {
            const resUser = await this.http.get('auth/user');

            if(resUser && resUser.status === HttpStatus.Ok) {
                this.userStore.setUser(JSON.parse(resUser.response));
                return true;
            }
        }
        return false
    }
}
