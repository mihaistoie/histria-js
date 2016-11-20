
export interface EventInfo {
    push(info: any): void
    pop(): void;
    isTriggeredBy(peopertyName: string, target: any): boolean;
}

export interface ObservableObject {
    propertyChanged(propName: string, value: any, oldValue: any, eventInfo: EventInfo): void;
    stateChanged(stateName: string, value: any, oldValue: any, eventInfo?: EventInfo): void;
    modelState(propName: string): any;
    getPath(propName?: string): string;
    getRoot(): ObservableObject
}

export interface ObservableArray {
    propertyChanged(propName: string, value: any, oldValue: any, eventInfo: EventInfo): void;
    stateChanged(stateName: string, value: any, oldValue: any, eventInfo?: EventInfo): void;
    getPath(item?: ObservableObject): string;
    getRoot(): ObservableObject
}


export interface ObservableArray {
    parent: ObservableObject;
    propertyName: string;
}
