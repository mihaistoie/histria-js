"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
class Tree extends index_1.View {
    get title() {
        return this.getPropertyByName('title');
    }
    setTitle(value) {
        return this.setPropertyByName('title', value);
    }
    get id() {
        return this._children.id.value;
    }
    get parentId() {
        return this._children.parentId.value;
    }
    get leafs() {
        return this._children.leafs;
    }
    parent() {
        return this._children.parent.getValue();
    }
    setParent(value) {
        return this._children.parent.setValue(value);
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
    init() {
        super.init();
        this._schema = exports.TREE_SCHEMA;
    }
    createStates() {
        this._states = new TreeState(this, this._schema);
    }
    createErrors() {
        this._errors = new TreeErrors(this, this._schema);
    }
}
Tree.isPersistent = false;
exports.Tree = Tree;
class TreeErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get title() {
        return this._messages.title;
    }
    get id() {
        return this._messages.id;
    }
    get parentId() {
        return this._messages.parentId;
    }
    get leafs() {
        return this._messages.leafs;
    }
}
exports.TreeErrors = TreeErrors;
class TreeState extends index_1.InstanceState {
    get title() {
        return this._states.title;
    }
    get id() {
        return this._states.id;
    }
    get parentId() {
        return this._states.parentId;
    }
}
exports.TreeState = TreeState;
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
exports.TREE_SCHEMA = {
    "type": "object",
    "name": "tree",
    "view": true,
    "nameSpace": "view-many-view",
    "properties": {
        "title": {
            "type": "string"
        },
        "id": {
            "type": "integer",
            "generated": true,
            "format": "id",
            "transient": false
        },
        "parentId": {
            "type": "integer",
            "isReadOnly": true,
            "format": "id",
            "transient": false
        }
    },
    "relations": {
        "leafs": {
            "type": "hasMany",
            "model": "tree",
            "aggregationKind": "composite",
            "invRel": "parent",
            "nameSpace": "view-many-view",
            "title": "leafs",
            "localFields": [
                "id"
            ],
            "foreignFields": [
                "parentId"
            ]
        },
        "parent": {
            "type": "belongsTo",
            "model": "tree",
            "aggregationKind": "composite",
            "invRel": "leafs",
            "nameSpace": "view-many-view",
            "title": "parent",
            "localFields": [
                "parentId"
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
        "parent": "tree",
        "parentRelation": "parent"
    }
};

//# sourceMappingURL=tree.js.map
