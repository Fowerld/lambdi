import { Lambda, generateHandler, Service } from '../src';
import { OnHandler } from '../src/interfaces';
import { extractMetadataByDecorator } from '../src/metadata';

describe('Unit tests', () => {
    test('Lambda without options', () => {
        @Lambda()
        class MyLambda implements OnHandler<any, any, any> {
            onHandler(event: any, context: any) {
                throw new Error('Method not implemented.');
            }
        }

        const metadata = extractMetadataByDecorator<Lambda>(MyLambda, 'Lambda');

        expect(metadata).toMatchObject({ localstack: undefined });
    });

    test('Lambda with options', () => {
        @Lambda({ localstack: true })
        class MyLambda implements OnHandler<any, any, any> {
            onHandler(event: any, context: any) {
                throw new Error('Method not implemented.');
            }
        }

        const metadata = extractMetadataByDecorator<Lambda>(MyLambda, 'Lambda');

        expect(metadata).toMatchObject({ localstack: true });
    });

    test('Lambda Handler call', () => {
        @Lambda()
        class MyLambda implements OnHandler<string, any, any> {
            onHandler(event: any, context: any) {
                return 'ok';
            }
        }

        expect(generateHandler(MyLambda)(null, null)).toBe('ok');
    });

    test('DI with 1 dep', () => {
        @Service()
        class MyService {
            hello() {
                return 'hello';
            }
        }

        @Lambda({
            providers: [MyService]
        })
        class MyLambda implements OnHandler<string, any, any> {
            constructor(private srv: MyService) {}
            onHandler(event: any, context: any) {
                return this.srv.hello();
            }
        }

        expect(generateHandler(MyLambda)(null, null)).toBe('hello');
    });

    test('DI with 2 deps', () => {
        @Service()
        class MyService1 {
            hello() {
                return 'hello';
            }
        }

        @Service()
        class MyService2 {
            world() {
                return 'world';
            }
        }

        @Lambda({
            providers: [MyService1, MyService2]
        })
        class MyLambda implements OnHandler<string, any, any> {
            constructor(private srv1: MyService1, private srv2: MyService2) {}
            onHandler(event: any, context: any) {
                return `${this.srv1.hello()} ${this.srv2.world()}`;
            }
        }

        expect(generateHandler(MyLambda)(null, null)).toBe('hello world');
    });

    test('DI with 2 deps nested', () => {
        @Service()
        class MyService2 {
            world() {
                return 'world';
            }
        }

        @Service()
        class MyService1 {
            constructor(private srv: MyService2) {}
            hello() {
                return `hello ${this.srv.world()}`;
            }
        }

        @Lambda({
            providers: [MyService1, MyService2]
        })
        class MyLambda implements OnHandler<string, any, any> {
            constructor(private srv1: MyService1) {}
            onHandler(event: any, context: any) {
                return this.srv1.hello();
            }
        }

        expect(generateHandler(MyLambda)(null, null)).toBe('hello world');
    });
});