export declare function title(targetClass: any, title: string, description?: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function propChanged(targetClass: any, ...properties: string[]): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function addItem(targetClass: any, propertyName: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function rmvItem(targetClass: any, propertyName: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function setItems(targetClass: any, propertyName: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function validate(targetClass: any, ...properties: string[]): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function init(targetClass: any): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function loadRules(folder: string): Promise<void>;
