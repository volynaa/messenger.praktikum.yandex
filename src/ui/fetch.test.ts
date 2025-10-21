import {expect, use} from 'chai';
import  sinonChai from 'sinon-chai';
import {createSandbox, SinonStub} from 'sinon';
import {HTTPTransport} from './fetch'

describe('HTTP Transport', () => {
    use(sinonChai);
    const sandbox = createSandbox();
    let http: HTTPTransport;
    let requestStub: SinonStub<any>;

    beforeEach(() => {
        http = new HTTPTransport('');
        requestStub = sandbox.stub(http as any, 'request').resolves({} as any);
    });

    afterEach(() => {
       sandbox.restore();
    });

    it('should call POST with correct data', () => {
        const testData = { title: '123' };
        http.post('/test', { data: testData });

        expect(requestStub).to.have.been.calledOnce;
        expect(requestStub).to.have.been.calledWith(
            '/test',
            {
                data: testData,
                method: 'POST'
            }
        );
    });

    it('should call GET with query params', () => {
        const queryParams = { search: 'test', page: 1 };
        http.get('/search', { data: queryParams });

        expect(requestStub).to.have.been.calledOnce;
        expect(requestStub).to.have.been.calledWith(
            '/search',
            {
                data: queryParams,
                method: 'GET'
            }
        );
    });

    it('should call PUT with correct data', () => {
        const updateData = { id: 1, name: 'test' };
        http.put('/update', { data: updateData });

        expect(requestStub).to.have.been.calledWith(
            '/update',
            {
                data: updateData,
                method: 'PUT'
            }
        );
    });

    it('should call DELETE', () => {
        http.delete('/item/1');

        expect(requestStub).to.have.been.calledWith(
            '/item/1',
            {
                method: 'DELETE'
            }
        );
    });
});
