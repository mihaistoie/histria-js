"use strict";
class State {
    constructor(parent, schema, propertyName) {
        let that = this;
        that._propertyName = propertyName;
        that._schema = schema;
        that.init();
        that._stateModel = that._parent.modelState(propertyName);
    }
    init() {
        let that = this;
        let ps = that._schema.states ? that._schema.state[that._propertyName] : null;
        that._stateModel.isDisabled = ps ? ps.isDisabled || false : false;
        that._stateModel.isHidden = ps ? ps.isHidden || false : false;
        that._stateModel.isMandatory = ps ? ps.isMandatory || false : false;
    }
    destroy() {
        let that = this;
        that._parent = null;
        that._schema = null;
        that._stateModel = null;
    }
    get isDisabled() {
        return this._stateModel.isDisabled;
    }
    set isDisabled(value) {
        let that = this;
        if (value !== that._stateModel.isDisabled) {
            that._parent.stateChanged('isDisabled', value, that._stateModel.isDisabled);
            that._stateModel.isDisabled = value;
        }
    }
    get isHidden() {
        return this._stateModel.isHidden;
    }
    set isHidden(value) {
        let that = this;
        if (value !== that._stateModel.isHidden) {
            that._parent.stateChanged('isHidden', value, that._stateModel.isHidden);
            that._stateModel.isHidden = value;
        }
    }
    get isMandatory() {
        return this._stateModel.isMandatory;
    }
    set isMandatory(value) {
        let that = this;
        if (value !== that._stateModel.isMandatory) {
            that._parent.stateChanged('isMandatory', value, that._stateModel.isMandatory);
            that._stateModel.isMandatory = value;
        }
    }
}
exports.State = State;
class StringState extends State {
}
exports.StringState = StringState;
class NumericState extends State {
}
exports.NumericState = NumericState;
class EnumState extends State {
}
exports.EnumState = EnumState;
