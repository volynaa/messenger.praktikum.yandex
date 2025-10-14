import BaseAPI, { HttpStatus } from '../../src/api/base-api';
import {ProfileData} from "../pages/profile/profile";
export interface Password {
    oldPassword: string,
    newPassword: string
}
export class ProfileService {
    private readonly http = new BaseAPI();
    async editPassword(data: Password): Promise<boolean> {
        const res = await this.http.put('user/password',{
            oldPassword: data.oldPassword,
            newPassword: data.newPassword
        })
        return res && res.status === HttpStatus.Ok;
    }

    async editData(data: ProfileData) {
        const res = await this.http.put('user/profile',{
            first_name: data.first_name,
            second_name: data.second_name,
            login: data.login,
            email: data.email,
            display_name: data.display_name,
            phone: data.phone,
        })
        if(res && res.status === HttpStatus.Ok) {
            return res.response

        }
        return null;
    }

    async uploadAvatar(file: File): Promise<boolean> {
        const formData = new FormData();
        formData.append('avatar', file);

        const res = await this.http.put('user/profile/avatar', formData);
        return res && res.status === HttpStatus.Ok;
    }
}
