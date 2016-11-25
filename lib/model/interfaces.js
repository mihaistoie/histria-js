"use strict";
(function (ObjectStatus) {
    ObjectStatus[ObjectStatus["idle"] = 0] = "idle";
    ObjectStatus[ObjectStatus["restoring"] = 1] = "restoring";
    ObjectStatus[ObjectStatus["loading"] = 2] = "loading";
})(exports.ObjectStatus || (exports.ObjectStatus = {}));
var ObjectStatus = exports.ObjectStatus;
(function (MessageServerity) {
    MessageServerity[MessageServerity["error"] = 0] = "error";
    MessageServerity[MessageServerity["warning"] = 1] = "warning";
    MessageServerity[MessageServerity["success"] = 2] = "success";
})(exports.MessageServerity || (exports.MessageServerity = {}));
var MessageServerity = exports.MessageServerity;
