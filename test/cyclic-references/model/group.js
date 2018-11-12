"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class Group extends index_1.Instance {
    get id() {
        return this._children.id.value;
    }
    get itemId() {
        return this._children.itemId.value;
    }
    get items() {
        return this._children.items;
    }
    item() {
        return this._children.item.getValue();
    }
    setItem(value) {
        return this._children.item.setValue(value);
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
    init() {
        super.init();
        this._schema = exports.GROUP_SCHEMA;
    }
    createStates() {
        this._states = new GroupState(this, this._schema);
    }
    createErrors() {
        this._errors = new GroupErrors(this, this._schema);
    }
}
Group.isPersistent = true;
exports.Group = Group;
class GroupErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get id() {
        return this._messages.id;
    }
    get itemId() {
        return this._messages.itemId;
    }
    get items() {
        return this._messages.items;
    }
}
exports.GroupErrors = GroupErrors;
class GroupState extends index_1.InstanceState {
    get id() {
        return this._states.id;
    }
    get itemId() {
        return this._states.itemId;
    }
}
exports.GroupState = GroupState;
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
exports.GROUP_SCHEMA = {
    "type": "object",
    "name": "group",
    "nameSpace": "cyclicreferences",
    "properties": {
        "id": {
            "type": "integer",
            "generated": true,
            "format": "id",
            "transient": true
        },
        "itemId": {
            "type": "integer",
            "isReadOnly": true,
            "format": "id"
        }
    },
    "relations": {
        "items": {
            "type": "hasMany",
            "model": "item",
            "aggregationKind": "composite",
            "invRel": "group",
            "nameSpace": "cyclicreferences",
            "title": "items",
            "invType": "belongsTo",
            "localFields": [
                "id"
            ],
            "foreignFields": [
                "groupId"
            ]
        },
        "item": {
            "type": "belongsTo",
            "model": "item",
            "aggregationKind": "composite",
            "invRel": "groups",
            "nameSpace": "cyclicreferences",
            "title": "item",
            "invType": "hasMany",
            "localFields": [
                "itemId"
            ],
            "foreignFields": [
                "id"
            ]
        }
    },
    "primaryKey": [
        "id"
    ],
    "meta": {
        "parent": "item",
        "parentRelation": "item"
    }
};

//# sourceMappingURL=group.js.map
