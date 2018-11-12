"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class Item extends index_1.Instance {
    get id() {
        return this._children.id.value;
    }
    get groupId() {
        return this._children.groupId.value;
    }
    get groups() {
        return this._children.groups;
    }
    group() {
        return this._children.group.getValue();
    }
    setGroup(value) {
        return this._children.group.setValue(value);
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
    init() {
        super.init();
        this._schema = exports.ITEM_SCHEMA;
    }
    createStates() {
        this._states = new ItemState(this, this._schema);
    }
    createErrors() {
        this._errors = new ItemErrors(this, this._schema);
    }
}
Item.isPersistent = true;
exports.Item = Item;
class ItemErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get id() {
        return this._messages.id;
    }
    get groupId() {
        return this._messages.groupId;
    }
    get groups() {
        return this._messages.groups;
    }
}
exports.ItemErrors = ItemErrors;
class ItemState extends index_1.InstanceState {
    get id() {
        return this._states.id;
    }
    get groupId() {
        return this._states.groupId;
    }
}
exports.ItemState = ItemState;
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
exports.ITEM_SCHEMA = {
    "type": "object",
    "name": "item",
    "nameSpace": "cyclicreferences",
    "properties": {
        "id": {
            "type": "integer",
            "generated": true,
            "format": "id",
            "transient": true
        },
        "groupId": {
            "type": "integer",
            "isReadOnly": true,
            "format": "id"
        }
    },
    "relations": {
        "groups": {
            "type": "hasMany",
            "model": "group",
            "aggregationKind": "composite",
            "invRel": "item",
            "nameSpace": "cyclicreferences",
            "title": "groups",
            "invType": "belongsTo",
            "localFields": [
                "id"
            ],
            "foreignFields": [
                "itemId"
            ]
        },
        "group": {
            "type": "belongsTo",
            "model": "group",
            "aggregationKind": "composite",
            "invRel": "items",
            "nameSpace": "cyclicreferences",
            "title": "group",
            "invType": "hasMany",
            "localFields": [
                "groupId"
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
        "parent": "group",
        "parentRelation": "group"
    }
};

//# sourceMappingURL=item.js.map
