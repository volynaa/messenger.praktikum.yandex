export interface User {
    avatar: string | null,
    display_name: string | null,
    email: string | null,
    first_name: string | null,
    id: number,
    login: string | null,
    phone: string | null,
    second_name: string | null,
}
export interface IUserStore {
    getUser(): User | null;
    setUser(user: User): void;
}
export default class UserStore implements IUserStore {
    private __user: User | null = null;

    constructor() {
        this.loadFromStorage();
    }

    setUser(data: User) {
        this.__user = data;
        localStorage.setItem('user', JSON.stringify(data));
    }

    outUser() {
        this.__user = null;
        localStorage.removeItem('user');
    }

    getUser() {
        if (!this.__user) {
            this.loadFromStorage();
        }
        return this.__user;
    }

    private loadFromStorage() {
        try {
            const stored = localStorage.getItem('user');
            if (stored) {
                this.__user = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading user from storage:', error);
        }
    }
}
