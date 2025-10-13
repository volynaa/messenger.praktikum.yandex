import Block from "../../ui/block";
import Handlebars from "handlebars";
import {buttonHelper} from "../../components/Button";
import error500 from './500.hbs?raw';
import Router from '../../ui/router';
export default class Error500 extends Block {
    private readonly router = new Router('#app');
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
        const compiledTemplate = Handlebars.compile(error500);
        template.innerHTML = compiledTemplate({});
        fragment.appendChild(template.content.cloneNode(true));
        return fragment;

    }
    private handleButtonClick(e: Event): void {
        if (!e.target) return;

        const target = e.target as HTMLElement;
        const targetPage = target.dataset.page;
        if (targetPage) {
            this.router.go(targetPage);
        }
    }
}
