import './profile.css'
import Block from "../../ui/block";
import Handlebars from "handlebars";
import { inputHelper } from '../../components/Input';
import { buttonHelper } from '../../components/Button';
import { imgHelper } from '../../components/Img';
import App from "../../App";
import profileIndex from './profileIndex.hbs?raw';
import profileEditData from './profileEditData.hbs?raw';
import profileEditPassword from './profileEditPassword.hbs?raw';
const templates = {
    profileIndex,
    profileEditData,
    profileEditPassword
};
export default class Profile extends Block {
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
        Handlebars.registerHelper('Input', inputHelper);
        Handlebars.registerHelper('Button', buttonHelper);
        Handlebars.registerHelper('Img', imgHelper);
        const compiledTemplate = Handlebars.compile(templates[state.currentPage]);
        template.innerHTML = compiledTemplate({profile: state.profile});
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