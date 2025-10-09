import UserStore from '../stores/user';
import BaseAPI from '../api/base-api';
function isEqual(lhs, rhs) {
    return lhs === rhs;
}

function render(query: string, block: { getContent: () => HTMLElement }) {
    const root = document.querySelector(query);
    if (root && block.getContent()) {
        root.innerHTML = '';
        root.appendChild(block.getContent());
    }
    return root;
}
class Route {
    private _pathname: string
    private _blockClass: unknown
    private _block: unknown
    private _props: object
    constructor(pathname, view, props) {
        this._pathname = pathname;
        this._blockClass = view;
        this._block = null;
        this._props = props;
    }

    navigate(pathname) {
        if (this.match(pathname)) {
            this._pathname = pathname;
            this.render();
        }
    }

    leave() {
        if (this._block) {
            this._block.hide();
        }
    }

    match(pathname) {
        return isEqual(pathname, this._pathname);
    }

    render() {
        if (!this._block) {
            this._block = new this._blockClass();
        }
        else {
            this._block.show();
        }
        render(this._props.rootQuery, this._block);
    }
}
interface Route {
    path: string;
    component: any;
    authRequired?: boolean;
}
export default class Router {
    private static __instance: Router;
    protected routes: Array<Route>;
    protected history: History;
    private _currentRoute: object | null;
    private readonly _rootQuery: string;
    private userStore: UserStore;
    private http: BaseAPI;

    private readonly UNAUTHORIZED_ONLY_PATHS = ['/', '/sign-up'];

    private readonly DEFAULT_AUTH_PATH = '/messenger';

    constructor(rootQuery) {
        if (Router.__instance) {
            return Router.__instance;
        }

        this.routes = [];
        this.history = window.history;
        this._currentRoute = null;
        this._rootQuery = rootQuery;

        Router.__instance = this;
        this.userStore = new UserStore();
        this.http = new BaseAPI();
    }

    use(pathname, block) {
        const route = new Route(pathname, block, {rootQuery: this._rootQuery});

        this.routes.push(route);

        return this;
    }

    start() {
        window.onpopstate = (event => {
            this._onRoute(event.currentTarget.location.pathname);
        }).bind(this);

        this._onRoute(window.location.pathname);
    }

    _onRoute(pathname) {
        const isAuthorized = this.userStore.getUser() !== null;

        if (isAuthorized && this.UNAUTHORIZED_ONLY_PATHS.includes(pathname)) {
            this.replace(this.DEFAULT_AUTH_PATH);
            return;
        }

        if(!this.getRoute(pathname)) {
            this.replace('/404');
            return;
        }

        if (!isAuthorized && this.isProtectedRoute(pathname)) {
            this.replace('/');
            return;
        }

        let route = this.getRoute(pathname);

        if (!route) {
            return;
        }

        if (this._currentRoute && this._currentRoute !== route) {
            this._currentRoute.leave();
        }

        this._currentRoute = route;
        route.render();
    }

    replace(pathname) {
        this.history.replaceState({}, '', pathname);
        this._onRoute(pathname);
    }

    private isProtectedRoute(pathname: string): boolean {
        const publicRoutes = ['/', '/sign-up', '/404', '/500'];
        return !publicRoutes.includes(pathname);
    }

    go(pathname) {
        this.history.pushState({}, '', pathname);
        this._onRoute(pathname);
    }

    back() {
        this.history.back();
    }

    forward() {
        this.history.forward();
    }
    getPath(){
        return this._currentRoute._pathname
    }
    getRoute(pathname) {
        return this.routes.find(route => route.match(pathname));
    }
}
