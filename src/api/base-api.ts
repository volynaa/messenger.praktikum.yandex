import {HTTPTransport} from "../ui/fetch";

const chatAPIInstance = new HTTPTransport('https://ya-praktikum.tech/api/v2/');

export default class BaseAPI {
    post(url, options = {}) {
        try {
            return chatAPIInstance.post(url, {data: options});
        }
        catch (e){
            throw new Error('Bad request');
        }
    }

    get(url) {
        try {
            return chatAPIInstance.get(url);
        }
        catch (e){
            throw new Error('Bad request');
        }
    }

    put(url, options) {
        try {
            return chatAPIInstance.put(url, {data: options});
        }
        catch (e){
            throw new Error('Bad request');
        }
    }

    delete(url, options) {
        try {
            return chatAPIInstance.delete(url, {data: options});
        }
        catch (e){
            throw new Error('Bad request');
        }
    }
}

