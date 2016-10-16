export class AnyState {
    protected _parent: any;
    protected _schema: any;
    protected _propertyName: string;
    protected _stateModel: any;
    protected init() {
        let that = this;
        let ps = that._schema.states ? that._schema.state[that._propertyName] : null;
        that._stateModel.isDisabled = ps ? ps.isDisabled || false : false;
        that._stateModel.isHidden = ps ? ps.isHidden || false : false;
        that._stateModel.isMandatory = ps ? ps.isMandatory || false : false;
    }

    constructor(parent: any, schema: any, propertyName: string) {
        let that = this;
        that._propertyName = propertyName;
        that._schema = schema;
        that.init();
        that._stateModel = that._parent.modelState(propertyName);
    }
    public destroy() {
        let that = this;
        that._parent = null;
        that._schema = null;
        that._stateModel = null;

    }
    get isDisabled() {
        return this._stateModel.isDisabled;
    }
    set isDisabled(value: boolean) {
        let that = this;
        if (value !== that._stateModel.isDisabled) {
            that._parent.stateChanged('isDisabled', value, that._stateModel.isDisabled)
            that._stateModel.isDisabled = value;
        }
    }
    get isHidden() {
        return this._stateModel.isHidden;
    }
    set isHidden(value: boolean) {
        let that = this;
        if (value !== that._stateModel.isHidden) {
            that._parent.stateChanged('isHidden', value, that._stateModel.isHidden)
            that._stateModel.isHidden = value;
        }
    }
    get isMandatory() {
        return this._stateModel.isMandatory;
    }
    set isMandatory(value: boolean) {
        let that = this;
        if (value !== that._stateModel.isMandatory) {
            that._parent.stateChanged('isMandatory', value, that._stateModel.isMandatory)
            that._stateModel.isMandatory = value;
        }
    }
}

export class StringState extends AnyState {
}

export class NumericState extends AnyState {
}

export class EnumState extends AnyState {
}