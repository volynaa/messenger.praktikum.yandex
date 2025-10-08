export default class UserStore {
    private static __user: object | null = null;

    constructor() {
        this.loadFromStorage();
    }

    setUser(data: object) {
        UserStore.__user = data;
        localStorage.setItem('user', JSON.stringify(data));
        console.log('User saved:', UserStore.__user);
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