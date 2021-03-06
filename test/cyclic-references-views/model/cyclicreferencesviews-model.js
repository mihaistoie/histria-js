"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const group_1 = require("./group");
var group_2 = require("./group");
exports.Group = group_2.Group;
const item_1 = require("./item");
var item_2 = require("./item");
exports.Item = item_2.Item;
index_1.modelManager().registerClass(group_1.Group, group_1.GROUP_SCHEMA);
index_1.modelManager().registerClass(item_1.Item, item_1.ITEM_SCHEMA);

//# sourceMappingURL=cyclicreferencesviews-model.js.map
