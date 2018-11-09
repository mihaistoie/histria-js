import { IObservableObject, MessageServerity } from '../interfaces';

export class ErrorState {
    public get error(): string {
        return this._getLastMessage(MessageServerity.error);
    }
    public set error(value: string) {
        this._setMessage(MessageServerity.error, value);
    }
    private _errorModel: Array<{ message: string, severity: MessageServerity }>;
    private _parent: IObservableObject;
    private _propertyName: string;

    constructor(parent: IObservableObject, propertyName: string) {
        this._propertyName = propertyName;
        this._parent = parent;
        this._errorModel = this._parent.modelErrors(propertyName);

    }
    public hasErrors(): boolean {
        return this._hasMessages(MessageServerity.error);
    }
    public addException(e: Error): void {
        this.error = e.message;
    }

    public destroy() {
        this._parent = null;
        this._errorModel = null;
    }
    private _getLastMessage(severity: MessageServerity): string {
        // return last error
        for (let i = this._errorModel.length - 1; i >= 0; i--) {
            const item = this._errorModel[i];
            if (item.severity === severity) {
                return item.message;
            }
        }
        return '';
    }
    private _hasMessages(severity: MessageServerity): boolean {
        for (let i = this._errorModel.length - 1; i >= 0; i--) {
            if (this._errorModel[i].severity === severity) {
                return true;
            }
        }
        return false;
    }
    private _setMessage(severity: MessageServerity, value: string): void {
        if (value)
            // add
            this._errorModel.push({ message: value, severity: severity });
        else
            // clear
            this._errorModel = this._errorModel.filter(item => item.severity !== severity);
    }
}
