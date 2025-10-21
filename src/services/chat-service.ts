import BaseAPI, {HttpStatus} from '../../src/api/base-api';
import {Chat} from "../pages/chats/chats";

export class ChatService {
    private readonly http = new BaseAPI();
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
    async loadAvatar(file: File, id: number | undefined): Promise<string> {
        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('chatId', id);

        const res = await this.http.put('chats/avatar', formData);
        if(res && res.status === HttpStatus.Ok){
            return res.response
        }
        return '';
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
    async getUserList(id: number): Promise<string>{
        const res = await this.http.get(`chats/${id}/users`)
        if(res && res.status === HttpStatus.Ok) {
            return res.response;
        }
        return '';
    }
    async addUser(userId: number, chatId: number | undefined): Promise<boolean> {
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
    async deleteUser(userId: number | null, chatId: number | undefined): Promise<boolean> {
        const res = await this.http.delete('chats/users',{
            users: [userId],
            chatId: chatId,
        })
        return res && res.status === HttpStatus.Ok;
    }
}
