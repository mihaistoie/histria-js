"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
class CustomerView extends index_1.View {
    get fullName() {
        return this.getPropertyByName('fullName');
    }
    setFullName(value) {
        return this.setPropertyByName('fullName', value);
    }
    get id() {
        return this._children.id.value;
    }
    get customerId() {
        return this._children.customerId.value;
    }
    customer() {
        return this._children.customer.getValue();
    }
    setCustomer(value) {
        return this._children.customer.setValue(value);
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
    init() {
        super.init();
        this._schema = exports.CUSTOMERVIEW_SCHEMA;
    }
    createStates() {
        this._states = new CustomerViewState(this, this._schema);
    }
    createErrors() {
        this._errors = new CustomerViewErrors(this, this._schema);
    }
}
CustomerView.isPersistent = false;
exports.CustomerView = CustomerView;
class CustomerViewErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get fullName() {
        return this._messages.fullName;
    }
    get id() {
        return this._messages.id;
    }
    get customerId() {
        return this._messages.customerId;
    }
}
exports.CustomerViewErrors = CustomerViewErrors;
class CustomerViewState extends index_1.InstanceState {
    get fullName() {
        return this._states.fullName;
    }
    get id() {
        return this._states.id;
    }
    get customerId() {
        return this._states.customerId;
    }
}
exports.CustomerViewState = CustomerViewState;
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
exports.CUSTOMERVIEW_SCHEMA = {
    "name": "customerView",
    "type": "object",
    "view": true,
    "nameSpace": "customer-view-sample",
    "properties": {
        "fullName": {
            "title": "FullName Name",
            "type": "string"
        },
        "id": {
            "type": "integer",
            "generated": true,
            "format": "id",
            "transient": false
        },
        "customerId": {
            "type": "integer",
            "isReadOnly": true,
            "format": "id",
            "transient": false
        }
    },
    "relations": {
        "customer": {
            "type": "hasOne",
            "model": "customer",
            "aggregationKind": "composite",
            "nameSpace": "customer-view-sample",
            "title": "customer",
            "localFields": [
                "customerId"
            ],
            "foreignFields": [
                "id"
            ]
        }
    },
    "states": {
        "fullName": {
            "isReadOnly": true
        }
    },
    "primaryKey": [
        "id"
    ],
    "meta": {}
};

//# sourceMappingURL=customer-view.js.map
