import { ModelObject } from '../model-object';
export declare class DateValue {
    protected _parent: ModelObject;
    protected _propertyName: string;
    constructor(parent: ModelObject, propertyName: string);
    protected init(): void;
    destroy(): void;
    readonly value: string;
    private _setValue;
    today(): Promise<void>;
}
//# sourceMappingURL=date.d.ts.map