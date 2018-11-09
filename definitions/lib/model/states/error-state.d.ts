import { IObservableObject } from '../interfaces';
export declare class ErrorState {
    error: string;
    private _errorModel;
    private _parent;
    private _propertyName;
    constructor(parent: IObservableObject, propertyName: string);
    hasErrors(): boolean;
    addException(e: Error): void;
    destroy(): void;
    private _getLastMessage;
    private _hasMessages;
    private _setMessage;
}
//# sourceMappingURL=error-state.d.ts.map