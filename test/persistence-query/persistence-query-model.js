"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const user_1 = require("./user");
var user_2 = require("./user");
exports.User = user_2.User;
index_1.modelManager().registerClass(user_1.User, user_1.USER_SCHEMA);
