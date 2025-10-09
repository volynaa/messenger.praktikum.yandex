import './Modal.pcss'
import Block from "../../ui/block";
import {inputHelper} from "../Input";
import {buttonHelper} from "../Button";
import Handlebars from "handlebars";
export interface ModalConfig {
    data?: object;
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
        let content = this.props.data.content
        let buttonBlock = ''
        if(!this.props.data.content){
            Handlebars.registerHelper('Input', inputHelper);
            Handlebars.registerHelper('Button', buttonHelper);
            const contentTemplate = Handlebars.compile(`
                <form class="input-container" id="login-form">
                    <label for="add-login" class="grey-text">${this.props.data.name || 'Логин'}</label>
                    {{{ Input
                            id="save-result"
                            name="save-result"
                            type="text"
                            placeholder="${this.props.data.name || 'Логин'}"
                            minLen="${this.props.data.name ? 0:3}"
                            maxLen="20"
                            req="${this.props.data.name ? false:true}"
                            pat="${this.props.data.name ? '':'^[a-zA-Z0-9_-]+$'}"
                    }}}
                </form>`);
            content = contentTemplate({});
        }
        if(this.props.showFooterButton){
            const contentTemplate = Handlebars.compile(`
            {{{Button id="save-result" text="${!this.props.data.content? 'Сохранить':'Подтвердить'}" className="button" type="${!this.props.data.content? 'submit':'button'}"}}}
            {{{Button id="modal-close"  className="button button-close" text="Закрыть" type="button"}}}
            `);
            buttonBlock = contentTemplate({});
        }
        container.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                ${this.props.data.title ? `<div class="modal-header"><h3>${this.props.data.title}</h3></div>` : ''}
                <div class="modal-body mt-20">${content}</div>
                ${this.props.showCloseButton ? '<button id="modal-close" class="modal-close" type="button">&times;</button>' : ''}
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
        data?: object;
        showCloseButton?: boolean;
        showFooterButton?: boolean;
    };
}
export function modalHelper(props: modalHelperProps): string {
    const modal = new Modal({
        data: props.hash.data,
        showCloseButton:  props.hash.showCloseButton,
        showFooterButton:  props.hash.showFooterButton,
    });

    const content = modal.getContent();
    return content ? content.outerHTML : '';
}