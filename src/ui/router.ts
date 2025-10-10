import UserStore from '../stores/user';
import Block from "./block";
function isEqual(lhs:string, rhs:string) {
    return lhs === rhs;
}
function render(query: string, block: Block): Element | null {
    const root = document.querySelector(query);
    const content = block?.getContent();

    if (root && content) {
        root.innerHTML = '';
        root.appendChild(content);
    }
    return root;
}

class Route {
    public pathname: string
    private readonly _blockClass: new () => Block
    private _block: Block | null
    private _props: { rootQuery: string }
    constructor(pathname: string, view: new () => Block, props: { rootQuery: string }) {
        this.pathname = pathname;
        this._blockClass = view;
        this._block = null;
        this._props = props;
    }

    navigate(pathname: string) {
        if (this.match(pathname)) {
            this.pathname = pathname;
            this.render();
        }
    }

    leave() {
        if (this._block) {
            this._block.hide();
        }
    }

    match(pathname: string) {
        return isEqual(pathname, this.pathname);
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

export default class Router {
    private static __instance: Router;
    protected routes: Route[] = [];
    protected history: History| null = null;
    private _currentRoute: Route | null = null;
    private readonly _rootQuery: string = '';
    private userStore: UserStore | null = null;

    private readonly UNAUTHORIZED_ONLY_PATHS = ['/', '/sign-up'];

    private readonly DEFAULT_AUTH_PATH = '/messenger';

    constructor(rootQuery: string) {
        if (Router.__instance) {
            return Router.__instance;
        }

        this.routes = [];
        this.history = window.history;
        this._currentRoute = null;
        this._rootQuery = rootQuery;

        Router.__instance = this;
        this.userStore = new UserStore();
    }

    use(pathname: string, block: new () => Block) {
        const route = new Route(pathname, block, {rootQuery: this._rootQuery});
        this.routes.push(route);
        return this;
    }

    start() {
        window.onpopstate = ((event: PopStateEvent) => {
            if (event.currentTarget instanceof Window) {
                this._onRoute(event.currentTarget.location.pathname);
            }
        }).bind(this);

        this._onRoute(window.location.pathname);
    }

    _onRoute(pathname: string) {
        const isAuthorized = this.userStore?.getUser() !== null;

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

        const route = this.getRoute(pathname);

        if (!route) {
            return;
        }

        if (this._currentRoute && this._currentRoute !== route) {
            this._currentRoute.leave();
        }

        this._currentRoute = route;
        route.render();
    }

    replace(pathname: string) {
        if(this.history){
            this.history.replaceState({}, '', pathname);
            this._onRoute(pathname);
        }
    }

    private isProtectedRoute(pathname: string): boolean {
        const publicRoutes = ['/', '/sign-up', '/404', '/500'];
        return !publicRoutes.includes(pathname);
    }

    go(pathname: string) {
        if(this.history){
            this.history.pushState({}, '', pathname);
            this._onRoute(pathname);
        }
    }

    back() {
        if(this.history) {
            this.history.back();
        }
    }

    forward() {
        if(this.history) {
            this.history.forward();
        }
    }
    getPath(){
        if(this._currentRoute){
            return this._currentRoute.pathname
        }
        return ''
    }
    getRoute(pathname: string) {
        return this.routes.find(route => route.match(pathname));
    }
}
