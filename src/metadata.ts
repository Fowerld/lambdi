import { Type } from './interfaces';

/**
 * Helper to extract Metadata
 * from a decorator
 *
 * @todo Filter with the right type
 * @param  {any} type
 * @returns any
 */
export function extractMetadata(type: any): any {
    return extractMetadataList(type).pop();
}

/**
 * Helper to extract Metadata
 * with the decorator name provided
 *
 * @param  {any} type
 * @param  {string} name
 */
export function extractMetadataByDecorator<T>(type: Type<any>, name: string): T {
    return extractMetadataList(type)
        .filter((x) => x.toString().slice(1) === name)
        .map((x) => <T>x)
        .pop();
}

/**
 * Helper to extract Metadata
 * from a decorator
 *
 * @todo Filter with the right type
 * @param  {any} decorator
 * @returns []
 */
export function extractMetadataList(decorator: any, key?: string): any[] {
    return (
        Reflect.getOwnMetadataKeys(decorator)
            .filter((x) => x === (!!key ? 'propMetadata' : 'annotations'))
            .map((x) => Reflect.getOwnMetadata(x, decorator))
            .map((x) => [].concat(!!key && x.hasOwnProperty(key) ? x[key] : x))
            .pop() || []
    ).filter(
        (item) =>
            item.constructor.name === 'DecoratorFactory' ||
            item.constructor.name === 'PropDecoratorFactory'
    );
}
