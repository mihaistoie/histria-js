export interface ObservableObject {
    propertyChanged(propName: string, value: any, oldValue: any, callStackInfo?: any): void;
    stateChanged(stateName: string, value: any, oldValue: any, callStackInfo?: any): void;
    modelState(propName: string): any;
}


export interface ObservableArray {
    parent: ObservableObject;
    propertyName: String
}
