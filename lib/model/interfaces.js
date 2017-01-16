"use strict";
var ObjectStatus;
(function (ObjectStatus) {
    ObjectStatus[ObjectStatus["idle"] = 0] = "idle";
    ObjectStatus[ObjectStatus["restoring"] = 1] = "restoring";
    ObjectStatus[ObjectStatus["creating"] = 2] = "creating";
})(ObjectStatus = exports.ObjectStatus || (exports.ObjectStatus = {}));
var EventType;
(function (EventType) {
    EventType[EventType["propChanged"] = 0] = "propChanged";
    EventType[EventType["propValidate"] = 1] = "propValidate";
    EventType[EventType["init"] = 2] = "init";
    EventType[EventType["objValidate"] = 3] = "objValidate";
    EventType[EventType["addItem"] = 4] = "addItem";
    EventType[EventType["removeItem"] = 5] = "removeItem";
    EventType[EventType["setItems"] = 6] = "setItems";
})(EventType = exports.EventType || (exports.EventType = {}));
var MessageServerity;
(function (MessageServerity) {
    MessageServerity[MessageServerity["error"] = 0] = "error";
    MessageServerity[MessageServerity["warning"] = 1] = "warning";
    MessageServerity[MessageServerity["success"] = 2] = "success";
})(MessageServerity = exports.MessageServerity || (exports.MessageServerity = {}));
