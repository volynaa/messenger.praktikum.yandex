import {HTTPTransport} from "../ui/fetch";

const chatAPIInstance = new HTTPTransport('https://ya-praktikum.tech/api/v2/');

export default class BaseAPI {
    post(url: string, options: object = {}) {
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

    put(url: string, options: object = {}) {
        try {
            return chatAPIInstance.put(url, {data: options});
        }
        catch {
            throw new Error('Bad request');
        }
    }

    delete(url: string, options: object = {}) {
        try {
            return chatAPIInstance.delete(url, {data: options});
        }
        catch {
            throw new Error('Bad request');
        }
    }
}

