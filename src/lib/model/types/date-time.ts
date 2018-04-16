import { ModelObject } from '../model-object';
import { NumberState } from '../states/state';


import { ApplicationError, messages } from 'histria-utils';

export class DateTimeValue {
    protected _parent: ModelObject;
    protected _propertyName: string;
    constructor(parent: ModelObject, propertyName: string) {
        let that = this;
        that._parent = parent;

        that._propertyName = propertyName;
        that.init();
    }
    protected init() {
        const that = this;
    }

    public destroy() {
        const that = this;
        that._parent = null;
    }
    public get value(): string {
        const that = this;
        return that._parent.getPropertyByName(that._propertyName);
    }
    private _setValue(value: string): Promise<number> {
        let that = this;
        return that._parent.setPropertyByName(that._propertyName, value);
    }

}

