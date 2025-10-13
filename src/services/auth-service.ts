import BaseAPI, { HttpStatus } from '../../src/api/base-api';
import UserStore from '../../src/stores/user';

export interface LoginData {
    login: string;
    password: string;
}

export class AuthService {
    private readonly http = new BaseAPI();
    private readonly userStore = new UserStore();

    async login(loginData: LoginData): Promise<boolean> {
        if (!this.userStore.getUser()) {
            await this.http.post('auth/logout', {});
        }

        const signinResponse = await this.http.post('auth/signin', loginData);

        if (signinResponse && signinResponse.status === HttpStatus.Ok) {
            const userResponse = await this.http.get('auth/user');

            if (userResponse && userResponse.status === HttpStatus.Ok) {
                this.userStore.setUser(JSON.parse(userResponse.response));
                return true;
            }
        }
        return false;
    }

    async logout(): Promise<void> {
        await this.http.post('auth/logout', {});
        await this.userStore.outUser();
    }
}
