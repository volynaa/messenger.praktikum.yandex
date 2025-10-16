import { expect } from 'chai';
import sinon from 'sinon';
import Router from './router';
import Block, { Props } from './block';

class TestBlock extends Block {
    constructor(props: Props = {}) {
        super('div', props);
    }

    render(): DocumentFragment {
        const fragment = document.createDocumentFragment();
        const div = document.createElement('div');
        div.className = 'test-block';
        div.textContent = this.props.text as string || 'Default content';
        fragment.appendChild(div);
        return fragment;
    }
}

describe('Router', () => {
    let router: Router;

    beforeEach(() => {
        const mockLocalStorage = {
            getItem: sinon.stub().returns(null),
            setItem: sinon.stub(),
            removeItem: sinon.stub(),
            clear: sinon.stub(),
        };
        (global as any).localStorage = mockLocalStorage;

        (Router as any).__instance = undefined;

        router = new Router('#app');
    });

    afterEach(() => {
        sinon.restore();
        delete (global as any).localStorage;
    });

    describe('Constructor', () => {
        it('should create singleton instance', () => {
            const router1 = new Router('#app1');
            const router2 = new Router('#app2');

            expect(router1).to.equal(router2);
        });

        it('should initialize with empty routes', () => {
            expect((router as any).routes).to.be.an('array').that.is.empty;
        });

        it('should initialize with window history', () => {
            expect((router as any).history).to.equal(window.history);
        });
    });

    describe('use()', () => {
        it('should add route to routes array', () => {
            router.use('/test', TestBlock);

            expect((router as any).routes).to.have.lengthOf(1);
            expect((router as any).routes[0].pathname).to.equal('/test');
        });

        it('should return router instance for chaining', () => {
            const result = router.use('/test', TestBlock);

            expect(result).to.equal(router);
        });

        it('should create Route with correct parameters', () => {
            router.use('/test', TestBlock);
            const route = (router as any).routes[0];

            expect(route.pathname).to.equal('/test');
            expect(route._blockClass).to.equal(TestBlock);
            expect(route._props.rootQuery).to.equal('#app');
        });
    });
});