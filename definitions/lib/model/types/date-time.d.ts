import { ModelObject } from '../model-object';
export declare class DateTimeValue {
    protected _parent: ModelObject;
    protected _propertyName: string;
    constructor(parent: ModelObject, propertyName: string);
    protected init(): void;
    destroy(): void;
    readonly value: string;
    private _setValue(value);
}
