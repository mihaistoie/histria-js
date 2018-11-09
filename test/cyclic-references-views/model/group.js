"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class Group extends index_1.View {
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
        let that = this;
        that._schema = exports.GROUP_SCHEMA;
    }
    createStates() {
        let that = this;
        that._states = new GroupState(that, that._schema);
    }
    createErrors() {
        let that = this;
        that._errors = new GroupErrors(that, that._schema);
    }
}
Group.isPersistent = false;
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
/* tslint:disable:quotemark */
exports.GROUP_SCHEMA = {
    "type": "object",
    "name": "group",
    "view": true,
    "nameSpace": "cyclicreferencesviews",
    "properties": {
        "id": {
            "type": "integer",
            "generated": true,
            "format": "id"
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
            "nameSpace": "cyclicreferencesviews",
            "title": "items",
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
            "nameSpace": "cyclicreferencesviews",
            "title": "item",
            "localFields": [
                "itemId"
            ],
            "foreignFields": [
                "id"
            ]
        }
    },
    "meta": {
        "parent": "item",
        "parentRelation": "item"
    }
};

//# sourceMappingURL=group.js.map
