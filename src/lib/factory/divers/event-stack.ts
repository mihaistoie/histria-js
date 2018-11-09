import { IEventInfo, EventType } from '../../model/interfaces';

export class EventInfoStack implements IEventInfo {
    public isLazyLoading: boolean;
    private _stack: any[];
    constructor() {
        this._stack = [];
    }
    public push(info: any): void {
        this._stack.push(info);
    }
    public pop(): void {
        this._stack.pop();
    }
    public isTriggeredBy(propertyName: string, target: any): boolean {
        const path = target.getPath();
        const fp = path ? path + '.' + propertyName : propertyName;
        for (let i = 0, len = this._stack.length; i < len; i++) {
            const info = this._stack[i];
            if (info && info.eventType === EventType.propChanged) {
                if (fp === info.path) return true;
            }
        }
        return false;
    }
    public destroy() {
        this._stack = null;
    }
}
