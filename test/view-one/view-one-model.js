"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const user_detail_1 = require("./user-detail");
var user_detail_2 = require("./user-detail");
exports.UserDetail = user_detail_2.UserDetail;
index_1.modelManager().registerClass(user_detail_1.UserDetail, user_detail_1.USERDETAIL_SCHEMA);
