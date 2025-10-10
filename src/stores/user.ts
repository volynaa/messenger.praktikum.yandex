interface User {
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
    private static __user: User | null = null;

    constructor() {
        this.loadFromStorage();
    }

    setUser(data: User) {
        UserStore.__user = data;
        localStorage.setItem('user', JSON.stringify(data));
    }

    outUser() {
        UserStore.__user = null;
        localStorage.removeItem('user');
    }

    getUser() {
        if (!UserStore.__user) {
            this.loadFromStorage();
        }
        return UserStore.__user;
    }

    private loadFromStorage() {
        try {
            const stored = localStorage.getItem('user');
            if (stored) {
                UserStore.__user = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading user from storage:', error);
        }
    }
}
