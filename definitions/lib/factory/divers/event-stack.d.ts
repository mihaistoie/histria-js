import { EventInfo } from '../../model/interfaces';
export declare class EventInfoStack implements EventInfo {
    private _stack;
    constructor();
    isLazyLoading: boolean;
    push(info: any): void;
    pop(): void;
    isTriggeredBy(propertyName: string, target: any): boolean;
    destroy(): void;
}
