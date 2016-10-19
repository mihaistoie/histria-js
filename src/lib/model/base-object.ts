import { ObservableObject, ObservableArray } from './instance';

export class Instance implements ObservableObject {
    protected _parent: ObservableObject;
    protected _parentArray: ObservableObject;
    protected _schema: any;
    protected _propertyName: string;
    protected propertyChanged(propName: string, value: any, oldValue: any, callStackInfo?: any) {
    }
    protected stateChanged(propName: string, value: any, oldValue: any, callStackInfo?: any) {
    }

    constructor(schema: any, propertyName: string,  parent: ObservableObject, parentArray: ObservableArray) {
        let that = this;
        that._schema = schema;
        
    }
}
