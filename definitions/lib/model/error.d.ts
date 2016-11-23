import { ObservableObject } from './instance';
export declare class Error {
    private _errorModel;
    private _parent;
    private _propertyName;
    constructor(parent: ObservableObject, propertyName: string);
    private _getLastMessage(severity);
    private _setMessage(severity, value);
    error: string;
    destroy(): void;
}
