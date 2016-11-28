"use strict";
(function (ObjectStatus) {
    ObjectStatus[ObjectStatus["idle"] = 0] = "idle";
    ObjectStatus[ObjectStatus["restoring"] = 1] = "restoring";
    ObjectStatus[ObjectStatus["creating"] = 2] = "creating";
})(exports.ObjectStatus || (exports.ObjectStatus = {}));
var ObjectStatus = exports.ObjectStatus;
(function (EventType) {
    EventType[EventType["propChanged"] = 0] = "propChanged";
    EventType[EventType["propValidate"] = 1] = "propValidate";
    EventType[EventType["init"] = 2] = "init";
})(exports.EventType || (exports.EventType = {}));
var EventType = exports.EventType;
(function (MessageServerity) {
    MessageServerity[MessageServerity["error"] = 0] = "error";
    MessageServerity[MessageServerity["warning"] = 1] = "warning";
    MessageServerity[MessageServerity["success"] = 2] = "success";
})(exports.MessageServerity || (exports.MessageServerity = {}));
var MessageServerity = exports.MessageServerity;