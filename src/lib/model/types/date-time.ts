import { ModelObject } from '../model-object';

export class DateTimeValue {
    protected _parent: ModelObject;
    protected _propertyName: string;
    constructor(parent: ModelObject, propertyName: string) {
        this._parent = parent;
        this._propertyName = propertyName;
        this.init();
    }
    public destroy() {
        this._parent = null;
    }
    public get value(): string {
        return this._parent.getPropertyByName(this._propertyName);
    }
    // tslint:disable-next-line:no-empty
    protected init() {
    }

    private _setValue(value: string): Promise<number> {
        return this._parent.setPropertyByName(this._propertyName, value);
    }

}