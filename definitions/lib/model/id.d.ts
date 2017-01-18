import { Instance } from './base-object';
export declare class IdValue {
    protected _parent: Instance;
    protected _propertyName: string;
    constructor(parent: Instance, propertyName: string);
    destroy(): void;
    readonly value: any;
}
