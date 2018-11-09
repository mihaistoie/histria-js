import { IEventInfo } from '../../model/interfaces';
export declare class EventInfoStack implements IEventInfo {
    isLazyLoading: boolean;
    private _stack;
    constructor();
    push(info: any): void;
    pop(): void;
    isTriggeredBy(propertyName: string, target: any): boolean;
    destroy(): void;
}
//# sourceMappingURL=event-stack.d.ts.map