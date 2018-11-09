import { ModelObject } from '../model-object';

export class DateValue {
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
    public async today(): Promise<void> {
        const today = new Date();
        await this._setValue(today.toISOString().substr(0, 10));
    }
    // tslint:disable-next-line:no-empty
    protected init() {
    }
    private _setValue(dateAsString: string): Promise<string> {
        return this._parent.setPropertyByName(this._propertyName, dateAsString);
    }
}
