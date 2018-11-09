"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const tree_1 = require("./tree");
var tree_2 = require("./tree");
exports.Tree = tree_2.Tree;
const user_list_1 = require("./user-list");
var user_list_2 = require("./user-list");
exports.UserList = user_list_2.UserList;
const user_1 = require("./user");
var user_2 = require("./user");
exports.User = user_2.User;
index_1.modelManager().registerClass(tree_1.Tree, tree_1.TREE_SCHEMA);
index_1.modelManager().registerClass(user_list_1.UserList, user_list_1.USERLIST_SCHEMA);
index_1.modelManager().registerClass(user_1.User, user_1.USER_SCHEMA);

//# sourceMappingURL=view-many-view-model.js.map
