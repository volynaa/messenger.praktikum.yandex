import { expect } from "chai";
import Block, {Props} from "./block";
import Sinon from "sinon";

describe('Smoke test for Components', () => {
    describe('Test block', () => {
        let blockClass: any;

        before(() =>  {
            interface TestComponentProps extends Props {
                text: string;
            }

            class TestComponent extends Block<TestComponentProps> {
                constructor(props: TestComponentProps) {
                    super('div', props);
                }

                protected render(): DocumentFragment {
                    const template = document.createElement('template');
                    template.innerHTML = `<div id="div">${this.props.text}</div>`;
                    return template.content;
                }
            }

            blockClass = TestComponent;
        })

        it('render props', () => {
            const textData = 'I am div!';
            const divComponent = new blockClass({text: textData})
            const componentElement = divComponent.element as HTMLElement;
            const text = componentElement.textContent;

            expect(text).to.be.eq(textData);
        })

        it('handle click', () => {
            const handler = Sinon.stub();
            const buttonComponent = new blockClass({text: 'I am button!', events:
                    {click: handler}
            });

            const event = new MouseEvent('click');
            (buttonComponent.element as unknown as HTMLDivElement)?.dispatchEvent(event);

            expect(handler.calledOnce).to.be.true;
        })

        it('Invoke _render', () => {
            const buttonComponent = new blockClass();

            const spyDCM = Sinon.spy(buttonComponent, '_render');
            buttonComponent.setProps({text: "bla"});

            expect(spyDCM.calledOnce).to.be.true;
        })
    })
})
