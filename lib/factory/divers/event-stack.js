"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("../../model/interfaces");
class EventInfoStack {
    constructor() {
        let that = this;
        that._stack = [];
    }
    push(info) {
        let that = this;
        that._stack.push(info);
    }
    pop() {
        let that = this;
        that._stack.pop();
    }
    isTriggeredBy(propertyName, target) {
        let that = this;
        let path = target.getPath();
        let fp = path ? path + '.' + propertyName : propertyName;
        for (let i = 0, len = that._stack.length; i < len; i++) {
            let info = that._stack[i];
            if (info && info.eventType === interfaces_1.EventType.propChanged) {
                if (fp === info.path)
                    return true;
            }
        }
        return false;
    }
    destroy() {
        let that = this;
        that._stack = null;
    }
}
exports.EventInfoStack = EventInfoStack;
