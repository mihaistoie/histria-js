"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("../../model/interfaces");
class EventInfoStack {
    constructor() {
        this._stack = [];
    }
    push(info) {
        this._stack.push(info);
    }
    pop() {
        this._stack.pop();
    }
    isTriggeredBy(propertyName, target) {
        const path = target.getPath();
        const fp = path ? path + '.' + propertyName : propertyName;
        for (let i = 0, len = this._stack.length; i < len; i++) {
            const info = this._stack[i];
            if (info && info.eventType === interfaces_1.EventType.propChanged) {
                if (fp === info.path)
                    return true;
            }
        }
        return false;
    }
    destroy() {
        this._stack = null;
    }
}
exports.EventInfoStack = EventInfoStack;

//# sourceMappingURL=event-stack.js.map
