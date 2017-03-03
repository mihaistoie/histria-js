"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const histria_utils_1 = require("histria-utils");
const model_manager_1 = require("../model-manager");
const interfaces_1 = require("../interfaces");
//Title decorator
// Allow title add a title && an description 
function title(targetClass, title, description) {
    return function (target, propertyKey, descriptor) {
        let mm = model_manager_1.modelManager();
        mm.setTitle(targetClass, target[propertyKey], title, description);
    };
}
exports.title = title;
//decorator for propChanged
function propChanged(targetClass, ...properties) {
    return function (target, propertyKey, descriptor) {
        let mm = model_manager_1.modelManager();
        mm.addRule(targetClass, interfaces_1.EventType.propChanged, target[propertyKey], properties);
    };
}
exports.propChanged = propChanged;
//decorators for composition list
function addItem(targetClass, propertyName) {
    return function (target, propertyKey, descriptor) {
        let mm = model_manager_1.modelManager();
        mm.addRule(targetClass, interfaces_1.EventType.addItem, target[propertyKey], [propertyName]);
    };
}
exports.addItem = addItem;
function rmvItem(targetClass, propertyName) {
    return function (target, propertyKey, descriptor) {
        let mm = model_manager_1.modelManager();
        mm.addRule(targetClass, interfaces_1.EventType.removeItem, target[propertyKey], [propertyName]);
    };
}
exports.rmvItem = rmvItem;
function setItems(targetClass, propertyName) {
    return function (target, propertyKey, descriptor) {
        let mm = model_manager_1.modelManager();
        mm.addRule(targetClass, interfaces_1.EventType.setItems, target[propertyKey], [propertyName]);
    };
}
exports.setItems = setItems;
//decorator for validate
function validate(targetClass, ...properties) {
    return function (target, propertyKey, descriptor) {
        let mm = model_manager_1.modelManager();
        mm.addValidateRule(targetClass, target[propertyKey], properties);
    };
}
exports.validate = validate;
//decorator for init
function init(targetClass) {
    return function (target, propertyKey, descriptor) {
        let mm = model_manager_1.modelManager();
        mm.addRule(targetClass, interfaces_1.EventType.init, target[propertyKey]);
    };
}
exports.init = init;
var module_holder = {};
// load rules from folder
function loadRules(folder) {
    return __awaiter(this, void 0, void 0, function* () {
        let files = yield histria_utils_1.fs.readdir(folder);
        let stats;
        let folders = [];
        stats = yield Promise.all(files.map((fileName) => {
            let fn = path.join(folder, fileName);
            return histria_utils_1.fs.lstat(fn);
        }));
        stats.forEach((stat, index) => {
            let fn = path.join(folder, files[index]);
            if (stat.isDirectory()) {
                folders.push(loadRules(fn));
            }
            else if (path.extname(fn) === '.js') {
                require(fn);
            }
        });
        if (folders.length)
            yield Promise.all(folders);
    });
}
exports.loadRules = loadRules;
