import { IObservableObject } from '../interfaces';
import { helper } from 'histria-utils';

export class State {
    protected _parent: IObservableObject;
    protected _propertyName: string;
    protected _stateModel: any;
    constructor(parent: IObservableObject, propertyName: string) {
        this._propertyName = propertyName;
        this._parent = parent;
        this._stateModel = this._parent.modelState(propertyName);
        this.init();
    }

    // tslint:disable-next-line:no-empty
    public serialize(): any {
        if (!Object.keys(this._stateModel).length)
            return null;
        return helper.clone(this._stateModel);
    }

    public destroy() {
        this._parent = null;
        this._stateModel = null;

    }
    public get isDisabled(): boolean {
        return this._stateModel.isDisabled || false;
    }
    public set isDisabled(value: boolean) {
        const oldValue = this._stateModel.isDisabled || false;
        if (value !== oldValue) {
            this._parent.changeState(this._propertyName + '.isDisabled', value, this._stateModel.isDisabled);
            this._stateModel.isDisabled = value;
        }
    }
    public get isHidden(): boolean {
        return this._stateModel.isHidden || false;
    }
    public set isHidden(value: boolean) {
        const oldValue = this._stateModel.isHidden || false;
        if (value !== oldValue) {
            this._parent.changeState(this._propertyName + '.isHidden', value, this._stateModel.isHidden);
            this._stateModel.isHidden = value;
        }
    }
    public get isMandatory(): boolean {
        return this._stateModel.isMandatory || false;
    }
    public set isMandatory(value: boolean) {
        const oldValue = this._stateModel.isMandatory || false;
        if (value !== oldValue) {
            this._parent.changeState(this._propertyName + '.isMandatory', value, this._stateModel.isMandatory);
            this._stateModel.isMandatory = value;
        }
    }
    public get isReadOnly(): boolean {
        return this._stateModel.isReadOnly || false;
    }
    public set isReadOnly(value: boolean) {
        const oldValue = this._stateModel.isReadOnly || false;
        if (value !== oldValue) {
            this._parent.changeState(this._propertyName + '.isReadOnly', value, this._stateModel.isReadOnly);
            this._stateModel.isReadOnly = value;
        }
    }
    // tslint:disable-next-line:no-empty
    protected init() { }

}

export class BooleanState extends State {
}
export class IdState extends State {
}
export class StringState extends State {
    public get maxLength(): number {
        return this._stateModel.maxLength || 0;
    }
    public set maxLength(value: number) {
        const oldvalue = this._stateModel.maxLength || 0;
        if (value !== oldvalue) {
            this._parent.changeState(this._propertyName + '.maxLength', value, this._stateModel.maxLength);
            this._stateModel.maxLength = value;
        }
    }
    public get minLength(): number {
        return this._stateModel.minLength || 0;
    }
    public set minLength(value: number) {
        const oldvalue = this._stateModel.minLength || 0;
        if (value !== oldvalue) {
            this._parent.changeState(this._propertyName + '.minLength', value, this._stateModel.minLength);
            this._stateModel.minLength = value;
        }
    }

}
export class NumberBaseState extends State {
    public get exclusiveMaximum(): boolean {
        return this._stateModel.exclusiveMaximum || false;
    }
    public set exclusiveMaximum(value: boolean) {
        const oldValue = this._stateModel.exclusiveMaximum || false;
        if (value !== oldValue) {
            this._parent.changeState(this._propertyName + '.exclusiveMaximum', value, this._stateModel.exclusiveMaximum);
            this._stateModel.exclusiveMaximum = value;
        }
    }

    public get exclusiveMinimum(): boolean {
        return this._stateModel.exclusiveMinimum || false;
    }
    public set exclusiveMinimum(value: boolean) {
        const oldValue = this._stateModel.exclusiveMinimum || false;
        if (value !== oldValue) {
            this._parent.changeState(this._propertyName + '.exclusiveMinimum', value, this._stateModel.exclusiveMinimum);
            this._stateModel.exclusiveMinimum = value;
        }
    }

    public get minimum(): number {
        return this._stateModel.minimum;
    }
    public set minimum(value: number) {
        if (value !== this._stateModel.minimum) {
            this._parent.changeState(this._propertyName + '.minimum', value, this._stateModel.minimum);
            this._stateModel.minimum = value;
        }
    }

    public get maximum(): number {
        return this._stateModel.maximum;
    }
    public set maximum(value: number) {
        if (value !== this._stateModel.maximum) {
            this._parent.changeState(this._propertyName + '.maximum', value, this._stateModel.maximum);
            this._stateModel.maximum = value;
        }
    }
}

export class NumberState extends NumberBaseState {
    public get decimals(): number {
        return this._stateModel.decimals || 0;
    }
    public set decimals(value: number) {
        const oldValue = this._stateModel.decimals || 0;
        if (value !== oldValue) {
            this._parent.changeState(this._propertyName + '.decimals', value, this._stateModel.decimals);
            this._stateModel.decimals = value;
        }
    }
}
export class IntegerState extends NumberBaseState {
}
export class DateState extends State {
}
export class DateTimeState extends State {
}
export class EnumState extends State {
}
export class ArrayState extends State {
}
export class RefObjectState extends State {
}
export class RefArrayState extends State {
}