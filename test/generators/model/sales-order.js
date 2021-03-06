"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
class SalesOrder extends index_1.Instance {
    get ruleCount() {
        return this._children.ruleCount.value;
    }
    setRuleCount(value) {
        return this._children.ruleCount.setValue(value);
    }
    get netAmount() {
        return this._children.netAmount;
    }
    get vat() {
        return this._children.vat;
    }
    get grossAmount() {
        return this._children.grossAmount;
    }
    get id() {
        return this._children.id.value;
    }
    get $states() {
        return this._states;
    }
    get $errors() {
        return this._errors;
    }
    init() {
        super.init();
        this._schema = exports.SALESORDER_SCHEMA;
    }
    createStates() {
        this._states = new SalesOrderState(this, this._schema);
    }
    createErrors() {
        this._errors = new SalesOrderErrors(this, this._schema);
    }
}
SalesOrder.isPersistent = true;
exports.SalesOrder = SalesOrder;
class SalesOrderErrors extends index_1.InstanceErrors {
    get $() {
        return this._messages.$;
    }
    get ruleCount() {
        return this._messages.ruleCount;
    }
    get netAmount() {
        return this._messages.netAmount;
    }
    get vat() {
        return this._messages.vat;
    }
    get grossAmount() {
        return this._messages.grossAmount;
    }
    get id() {
        return this._messages.id;
    }
}
exports.SalesOrderErrors = SalesOrderErrors;
class SalesOrderState extends index_1.InstanceState {
    get ruleCount() {
        return this._states.ruleCount;
    }
    get netAmount() {
        return this._states.netAmount;
    }
    get vat() {
        return this._states.vat;
    }
    get grossAmount() {
        return this._states.grossAmount;
    }
    get id() {
        return this._states.id;
    }
}
exports.SalesOrderState = SalesOrderState;
/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:quotemark */
exports.SALESORDER_SCHEMA = {
    "name": "salesOrder",
    "type": "object",
    "nameSpace": "salesorder",
    "properties": {
        "ruleCount": {
            "title": "Rule call count",
            "type": "integer"
        },
        "netAmount": {
            "title": "Net Amount (excluding VAT)",
            "type": "number"
        },
        "vat": {
            "title": "VAT",
            "type": "number"
        },
        "grossAmount": {
            "title": "Gross Amount (including VAT)",
            "type": "number"
        },
        "id": {
            "type": "integer",
            "generated": true,
            "format": "id",
            "transient": true
        }
    },
    "states": {
        "netAmount": {
            "decimals": 2
        },
        "vat": {
            "decimals": 2
        },
        "grossAmount": {
            "decimals": 2
        }
    },
    "meta": {},
    "primaryKey": [
        "id"
    ]
};

//# sourceMappingURL=sales-order.js.map
