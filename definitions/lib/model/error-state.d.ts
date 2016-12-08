import { ObservableObject } from './interfaces';
export declare class ErrorState {
    private _errorModel;
    private _parent;
    private _propertyName;
    constructor(parent: ObservableObject, propertyName: string);
    private _getLastMessage(severity);
    private _hasMessages(severity);
    private _setMessage(severity, value);
    error: string;
    hasErrors(): boolean;
    addException(e: Error): void;
    destroy(): void;
}
