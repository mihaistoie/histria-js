"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const user_detail_1 = require("./user-detail");
var user_detail_2 = require("./user-detail");
exports.UserDetail = user_detail_2.UserDetail;
const user_1 = require("./user");
var user_2 = require("./user");
exports.User = user_2.User;
index_1.modelManager().registerClass(user_detail_1.UserDetail, user_detail_1.USERDETAIL_SCHEMA);
index_1.modelManager().registerClass(user_1.User, user_1.USER_SCHEMA);

//# sourceMappingURL=view-one-model.js.map
