import {HTTPTransport} from "../ui/fetch";
import {productionConfig} from "../config/production"

const chatAPIInstance = new HTTPTransport(`${productionConfig.baseURL}`);
export enum HttpStatus {
    Ok = 200,
    Created = 201,
    NoContent = 204,
    MultipleChoices = 300,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    Conflict = 409,
    InternalServerError = 500,
}
interface ApiResponse<T> {
    status: number;
    response: string;
    data: T;
}
export default class BaseAPI {
    post<T>(url: string, options: Record<string, unknown> | undefined = undefined): Promise<ApiResponse<T>> {
        return chatAPIInstance.post(url, { data: options});
    }

    get<T>(url: string): Promise<ApiResponse<T>> {
        return chatAPIInstance.get(url);
    }

    put<T>(url: string, options: Record<string, unknown> | undefined | FormData = undefined) : Promise<ApiResponse<T>> {
        return chatAPIInstance.put(url,  { data: options});

    }

    delete<T>(url: string, options: Record<string, unknown> | undefined = undefined): Promise<ApiResponse<T>> {
        return chatAPIInstance.delete(url, { data: options});

    }
}

