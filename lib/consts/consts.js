"use strict";
exports.RULE_TRIGGERS = {
    PROP_CHANGED: 'propchanged',
    INIT: 'init'
};
(function (ObjectStatus) {
    ObjectStatus[ObjectStatus["idle"] = 0] = "idle";
    ObjectStatus[ObjectStatus["restoring"] = 1] = "restoring";
    ObjectStatus[ObjectStatus["loading"] = 2] = "loading";
})(exports.ObjectStatus || (exports.ObjectStatus = {}));
var ObjectStatus = exports.ObjectStatus;
