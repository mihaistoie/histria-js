import { ModelObject } from '../model-object';
export declare class DateValue {
    protected _parent: ModelObject;
    protected _propertyName: string;
    constructor(parent: ModelObject, propertyName: string);
    destroy(): void;
    readonly value: string;
    today(): Promise<void>;
    protected init(): void;
    private _setValue;
}
//# sourceMappingURL=date.d.ts.map