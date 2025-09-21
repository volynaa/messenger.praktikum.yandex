import Block from "../ui/block";

interface ImgProps {
    [key: string]: unknown;
    id?: string;
    dataPage?: string;
    className?: string;
    src?: string;
    alt?: string;
    events?: {
        click?: (event: Event) => void;
        submit?: (event: Event) => void;
    };
}

class Img extends Block<ImgProps> {
    constructor(props: ImgProps) {
        super('div', props);
    }

    protected render(): DocumentFragment {
        const fragment = document.createDocumentFragment();
        const container = document.createElement('div');

        container.innerHTML = `
      <img 
        id="${this.props.id || ''}" 
        class="${this.props.className || 'img'}"
        src="${this.props.src || ''}"
        alt="${this.props.alt || ''}"
        ${this.props.dataPage ? `data-page="${this.props.dataPage}"` : ''}
      >
    `;

        if (container.firstElementChild) {
            fragment.appendChild(container.firstElementChild);
        }

        return fragment;
    }
}

interface ImgHelperProps {
    hash: {
        id?: string;
        dataPage?: string;
        className?: string;
        src?: string;
        alt?: string;
    };
}

export function imgHelper(props: ImgHelperProps): string {
    const img = new Img({
        id: props.hash.id,
        dataPage: props.hash.dataPage,
        className: props.hash.className,
        src: props.hash.src,
        alt: props.hash.alt
    });

    const content = img.getContent();
    return content ? content.outerHTML : '';
}
