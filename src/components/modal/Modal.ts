import './Modal.pcss'
import Block from "../../ui/block";
import {inputHelper} from "../Input";
import {buttonHelper} from "../Button";
import Handlebars from "handlebars";
export interface ModalConfig {
    title?: string;
    content: string;
    showCloseButton?: boolean;
    showFooterButton?: boolean;
}

export class Modal extends Block {
    constructor(props: ModalConfig) {
        super('div', props);
        this.element.classList.add('modal');
    }

    protected render(): DocumentFragment {
        const fragment = document.createDocumentFragment();
        const container = document.createElement('div');
        let content = this.props.content
        let buttonBlock = ''
        if(!this.props.content){
            Handlebars.registerHelper('Input', inputHelper);
            Handlebars.registerHelper('Button', buttonHelper);
            const contentTemplate = Handlebars.compile(`
                <form class="input-container" id="login-form">
                    <label for="login" class="grey-text">Логин</label>
                    {{{ Input
                            id="login"
                            name="login"
                            type="text"
                            placeholder="Логин"
                            minLen="3"
                            maxLen="20"
                            req=true
                            pat="^[a-zA-Z0-9_-]+$"
                    }}}
                </form>`);
            content = contentTemplate({});
        }
        if(this.props.showFooterButton){
            const contentTemplate = Handlebars.compile(`
            {{{Button id="login" text="Добавить" className="button" type="submit"}}}
            {{{Button id="modal-close"  className="button button-close" text="Закрыть" type="button"}}}
            `);
            buttonBlock = contentTemplate({});
        }
        container.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                ${this.props.title ? `<div class="modal-header"><h3>${this.props.title}</h3></div>` : ''}
                <div class="modal-body mt-20">${content}</div>
                ${this.props.showCloseButton ? '<button id="modal-close" class="modal-close">&times;</button>' : ''}
                ${this.props.showFooterButton ? 
                `<div class="flex gap-10 mt-30">
                    ${buttonBlock}
                </div>` : ''}
            </div>
        `;

        fragment.appendChild(container);
        return fragment;
    }
}
interface modalHelperProps {
    hash: {
        title?: string;
        content: string;
        showCloseButton?: boolean;
        showFooterButton?: boolean;
    };
}
export function modalHelper(props: modalHelperProps): string {
    const modal = new Modal({
        title: props.hash.title,
        content:  props.hash.content,
        showCloseButton:  props.hash.showCloseButton,
        showFooterButton:  props.hash.showFooterButton,
    });

    const content = modal.getContent();
    return content ? content.outerHTML : '';
}