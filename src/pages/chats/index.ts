import Block from "../../ui/block";
import Handlebars from "handlebars";
import {buttonHelper} from "../../components/Button";
import { inputHelper } from '../../components/Input';
import App from "../../App";
import chats from './chats.hbs?raw';
import './chats.css'

export default class Chats extends Block {
    constructor() {
        super('div',{
            events: {
                click: (e: Event) => this.handleButtonClick(e)
            }
        });
    }

    protected render(): DocumentFragment {
        const app = App.getInstance();
        const state = app.getState();
        const fragment = document.createDocumentFragment();
        const template = document.createElement('template');
        Handlebars.registerHelper('Button', buttonHelper);
        Handlebars.registerHelper('Input', inputHelper);
        const compiledTemplate = Handlebars.compile(chats);
        template.innerHTML = compiledTemplate({chats: state.chats, selected: state.selectedChat});
        fragment.appendChild(template.content.cloneNode(true));
        return fragment;

    }
    private handleButtonClick(e: Event): void {
        const targetPage = e.target.dataset.page;
        if (targetPage) {
            const app = App.getInstance();
            app.changePage(targetPage);
        }
    }
}
