import error404 from './404.hbs?raw';
import Block from "../../ui/block";
import Handlebars from 'handlebars';
import { buttonHelper } from '../../components/Button';
import App from "../../App";
export default class Error404 extends Block {
    constructor() {
        super('div',{
            events: {
                click: (e: Event) => this.handleButtonClick(e)
            }
        });
    }

    protected render(): DocumentFragment {
        const fragment = document.createDocumentFragment();
        const template = document.createElement('template');
        Handlebars.registerHelper('Button', buttonHelper);
        const compiledTemplate = Handlebars.compile(error404);
        template.innerHTML = compiledTemplate({});
        fragment.appendChild(template.content.cloneNode(true));
        return fragment;

    }
    private handleButtonClick(e: Event): void {
        if (!e.target) return;

        const target = e.target as HTMLElement;
        const targetPage = target.dataset.page;
        if (targetPage) {
            const app = App.getInstance();
            app.changePage(targetPage);
        }
    }
}
