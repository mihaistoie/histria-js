import { ObservableObject } from './interfaces';
export declare class InstanceErrors {
    protected _messages: any;
    private _schema;
    private _parent;
    constructor(parent: ObservableObject, schema: any);
    destroy(): void;
}
