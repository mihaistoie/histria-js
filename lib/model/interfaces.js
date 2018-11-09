"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ObjectStatus;
(function (ObjectStatus) {
    ObjectStatus[ObjectStatus["idle"] = 0] = "idle";
    ObjectStatus[ObjectStatus["restoring"] = 1] = "restoring";
    ObjectStatus[ObjectStatus["creating"] = 2] = "creating";
})(ObjectStatus = exports.ObjectStatus || (exports.ObjectStatus = {}));
var LogModule;
(function (LogModule) {
    LogModule[LogModule["hooks"] = 0] = "hooks";
    LogModule[LogModule["views"] = 1] = "views";
})(LogModule = exports.LogModule || (exports.LogModule = {}));
var DebugLevel;
(function (DebugLevel) {
    DebugLevel[DebugLevel["message"] = 0] = "message";
    DebugLevel[DebugLevel["error"] = 1] = "error";
    DebugLevel[DebugLevel["debug"] = 2] = "debug";
})(DebugLevel = exports.DebugLevel || (exports.DebugLevel = {}));
var EventType;
(function (EventType) {
    EventType[EventType["propChanged"] = 0] = "propChanged";
    EventType[EventType["propValidate"] = 1] = "propValidate";
    EventType[EventType["init"] = 2] = "init";
    EventType[EventType["objValidate"] = 3] = "objValidate";
    EventType[EventType["addItem"] = 4] = "addItem";
    EventType[EventType["removeItem"] = 5] = "removeItem";
    EventType[EventType["setItems"] = 6] = "setItems";
    EventType[EventType["removing"] = 7] = "removing";
    EventType[EventType["removed"] = 8] = "removed";
    EventType[EventType["editing"] = 9] = "editing";
    EventType[EventType["edited"] = 10] = "edited";
    EventType[EventType["saving"] = 11] = "saving";
    EventType[EventType["saved"] = 12] = "saved";
})(EventType = exports.EventType || (exports.EventType = {}));
var MessageServerity;
(function (MessageServerity) {
    MessageServerity[MessageServerity["error"] = 0] = "error";
    MessageServerity[MessageServerity["warning"] = 1] = "warning";
    MessageServerity[MessageServerity["success"] = 2] = "success";
})(MessageServerity = exports.MessageServerity || (exports.MessageServerity = {}));

//# sourceMappingURL=interfaces.js.map
