import { ObservableObject, MessageServerity } from './interfaces';

export class ErrorState {
    private _errorModel: { message: string, severity: MessageServerity }[];
    private _parent: ObservableObject;
    private _propertyName: string;

    constructor(parent: ObservableObject, propertyName: string) {
        let that = this;
        that._propertyName = propertyName;
        that._parent = parent;
        that._errorModel = that._parent.modelErrors(propertyName);

    }
    private _getLastMessage(severity: MessageServerity): string {
        // return last error
        let that = this;
        for (let i = that._errorModel.length - 1; i >= 0; i--) {
            let item = that._errorModel[i]
            if (item.severity === severity) {
                return item.message;
            }
        }
        return '';
    }
    private _hasMessages(severity: MessageServerity): boolean {
        // return last error
        let that = this;
        for (let i = that._errorModel.length - 1; i >= 0; i--) {
            if (that._errorModel[i].severity === severity) {
                return true;
            }
        }
        return false;
    }
    private _setMessage(severity: MessageServerity, value: string): void {
        let that = this;
        if (value)
            // add
            that._errorModel.push({ message: value, severity: severity });
        else
            // clear
            that._errorModel = that._errorModel.filter(item => item.severity !== severity);
    }
    public get error(): string {
        return this._getLastMessage(MessageServerity.error);
    }
    public set error(value: string) {
        this._setMessage(MessageServerity.error, value);
    }
    public hasErrors(): boolean {
        return this._hasMessages(MessageServerity.error);
    }
    public addException(e: Error): void {
        this.error = e.message;
    }

    public destroy() {
        let that = this;
        that._parent = null;
        that._errorModel = null;
    }
}

