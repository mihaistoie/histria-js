import { ObservableObject } from '../interfaces';
export declare class InstanceState {
    protected _states: any;
    private _schema;
    private _parent;
    constructor(parent: ObservableObject, schema: any);
    destroy(): void;
}
