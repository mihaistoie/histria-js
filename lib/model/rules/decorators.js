"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const util = require("util");
const path = require("path");
const model_manager_1 = require("../model-manager");
const interfaces_1 = require("../interfaces");
// Title decorator
// Allow title add a title && an description
function title(targetClass, titleOfClass, description) {
    return (target, propertyKey, descriptor) => {
        const mm = model_manager_1.modelManager();
        mm.setTitle(targetClass, target[propertyKey], titleOfClass, description);
    };
}
exports.title = title;
// Decorator  for propChanged
function propChanged(targetClass, ...properties) {
    return (target, propertyKey, descriptor) => {
        const mm = model_manager_1.modelManager();
        mm.addRule(targetClass, interfaces_1.EventType.propChanged, target[propertyKey], properties);
    };
}
exports.propChanged = propChanged;
// Decorators for composition list
function addItem(targetClass, propertyName) {
    return (target, propertyKey, descriptor) => {
        const mm = model_manager_1.modelManager();
        mm.addRule(targetClass, interfaces_1.EventType.addItem, target[propertyKey], [propertyName]);
    };
}
exports.addItem = addItem;
function rmvItem(targetClass, propertyName) {
    return (target, propertyKey, descriptor) => {
        const mm = model_manager_1.modelManager();
        mm.addRule(targetClass, interfaces_1.EventType.removeItem, target[propertyKey], [propertyName]);
    };
}
exports.rmvItem = rmvItem;
function setItems(targetClass, propertyName) {
    return (target, propertyKey, descriptor) => {
        const mm = model_manager_1.modelManager();
        mm.addRule(targetClass, interfaces_1.EventType.setItems, target[propertyKey], [propertyName]);
    };
}
exports.setItems = setItems;
// Decorator for validate
function validate(targetClass, ...properties) {
    return (target, propertyKey, descriptor) => {
        const mm = model_manager_1.modelManager();
        mm.addValidateRule(targetClass, target[propertyKey], properties);
    };
}
exports.validate = validate;
// Decorator for init
function init(targetClass) {
    return (target, propertyKey, descriptor) => {
        const mm = model_manager_1.modelManager();
        mm.addRule(targetClass, interfaces_1.EventType.init, target[propertyKey]);
    };
}
exports.init = init;
// Decorator for saving
function saving(targetClass) {
    return (target, propertyKey, descriptor) => {
        const mm = model_manager_1.modelManager();
        mm.addRule(targetClass, interfaces_1.EventType.saving, target[propertyKey]);
    };
}
exports.saving = saving;
// Decorator for saved
function saved(targetClass) {
    return (target, propertyKey, descriptor) => {
        const mm = model_manager_1.modelManager();
        mm.addRule(targetClass, interfaces_1.EventType.saved, target[propertyKey]);
    };
}
exports.saved = saved;
// Decorator for editing
function editing(targetClass) {
    return (target, propertyKey, descriptor) => {
        const mm = model_manager_1.modelManager();
        mm.addRule(targetClass, interfaces_1.EventType.editing, target[propertyKey]);
    };
}
exports.editing = editing;
// Decorator for edited
function edited(targetClass) {
    return (target, propertyKey, descriptor) => {
        const mm = model_manager_1.modelManager();
        mm.addRule(targetClass, interfaces_1.EventType.edited, target[propertyKey]);
    };
}
exports.edited = edited;
// Decorator for removing
function removing(targetClass) {
    return (target, propertyKey, descriptor) => {
        const mm = model_manager_1.modelManager();
        mm.addRule(targetClass, interfaces_1.EventType.removing, target[propertyKey]);
    };
}
exports.removing = removing;
// Decorator for removed
function removed(targetClass) {
    return (target, propertyKey, descriptor) => {
        const mm = model_manager_1.modelManager();
        mm.addRule(targetClass, interfaces_1.EventType.removed, target[propertyKey]);
    };
}
exports.removed = removed;
// Load rules from folder
async function loadRules(folder) {
    const files = await util.promisify(fs.readdir)(folder);
    const folders = [];
    const stats = await Promise.all(files.map((fileName) => {
        return util.promisify(fs.lstat)(path.join(folder, fileName));
    }));
    stats.forEach((stat, index) => {
        const fn = path.join(folder, files[index]);
        if (stat.isDirectory()) {
            folders.push(loadRules(fn));
        }
        else if (path.extname(fn) === '.js') {
            require(fn);
        }
    });
    if (folders.length)
        await Promise.all(folders);
}
exports.loadRules = loadRules;

//# sourceMappingURL=decorators.js.map
