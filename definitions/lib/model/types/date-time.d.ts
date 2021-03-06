import { ModelObject } from '../model-object';
export declare class DateTimeValue {
    protected _parent: ModelObject;
    protected _propertyName: string;
    constructor(parent: ModelObject, propertyName: string);
    destroy(): void;
    readonly value: string;
    protected init(): void;
    private _setValue;
}
//# sourceMappingURL=date-time.d.ts.map