import BaseAPI, {HttpStatus} from '../../src/api/base-api';
import UserStore from '../../src/stores/user';
import {Chat} from "../pages/chats/chats";

export class ChatService {
    private readonly http = new BaseAPI();
    private readonly userStore = new UserStore();
    async getChats(): Promise<string>  {
        const res = await this.http.get('chats');
        if(res && res.status === HttpStatus.Ok) {
            return res.response;
        }
        return '';
    }
    async getTokenChats(id: number): Promise<string> {
        const res = await this.http.post(`chats/token/${id}`)
        if(res && res.status === HttpStatus.Ok) {
            return JSON.parse(res.response).token;
        }
        return '';
    }
    async deleteChat(selectedChat: Chat | null): Promise<boolean> {
        const res = await this.http.delete('chats',{
            chatId: selectedChat?.id,
            title: selectedChat?.title
        })
        return res && res.status === HttpStatus.Ok;
    }

    async createChat(name: string): Promise<string> {
        const res = await this.http.post('chats',{
            title: name || 'New chat'
        })
        if(res && res.status === HttpStatus.Ok) {
            return res.response;
        }
        return '';
    }

    async createUser(userId: number, chatId: number | undefined): Promise<boolean> {
        const res = await this.http.put('chats/users',{
            users: [userId],
            chatId: chatId,
        })
        return res && res.status === HttpStatus.Ok;
    }
    async searchUser(login: string) {
        return await this.http.post('user/search', {
            login: login
        });
    }
    async deleteUser(userId: number, chatId: number | undefined): Promise<boolean> {
        const res = await this.http.delete('chats/users',{
            users: [userId],
            chatId: chatId,
        })
        return res && res.status === HttpStatus.Ok;
    }
}
