import {HTTPTransport} from "../ui/fetch";

const chatAPIInstance = new HTTPTransport('https://ya-praktikum.tech/api/v2/');

export default class BaseAPI {
    post<T>(url: string, options: T = undefined as T) {
        try {
            return chatAPIInstance.post(url, {data: options});
        }
        catch {
            throw new Error('Bad request');
        }
    }

    get(url: string) {
        try {
            return chatAPIInstance.get(url);
        }
        catch {
            throw new Error('Bad request');
        }
    }

    put<T>(url: string, options: T = undefined) {
        try {
            return chatAPIInstance.put(url, {data: options});
        }
        catch {
            throw new Error('Bad request');
        }
    }

    delete<T>(url: string, options: T = undefined) {
        try {
            return chatAPIInstance.delete(url, {data: options});
        }
        catch {
            throw new Error('Bad request');
        }
    }
}

