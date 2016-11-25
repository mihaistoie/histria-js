import { EventInfo } from './interfaces';
export declare class EventInfoStack implements EventInfo {
    private _stack;
    constructor();
    push(info: any): void;
    pop(): void;
    isTriggeredBy(propertyName: string, target: any): boolean;
    destroy(): void;
}
