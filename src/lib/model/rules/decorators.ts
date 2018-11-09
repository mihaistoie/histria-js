
import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import { modelManager } from '../model-manager';
import { EventType } from '../interfaces';

// Title decorator
// Allow title add a title && an description
export function title(targetClass: any, titleOfClass: string, description?: string) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const mm = modelManager();
        mm.setTitle(targetClass, target[propertyKey], titleOfClass, description);
    };
}

// Decorator  for propChanged
export function propChanged(targetClass: any, ...properties: string[]) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const mm = modelManager();
        mm.addRule(targetClass, EventType.propChanged, target[propertyKey], properties);
    };
}

// Decorators for composition list
export function addItem(targetClass: any, propertyName: string) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const mm = modelManager();
        mm.addRule(targetClass, EventType.addItem, target[propertyKey], [propertyName]);
    };
}

export function rmvItem(targetClass: any, propertyName: string) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const mm = modelManager();
        mm.addRule(targetClass, EventType.removeItem, target[propertyKey], [propertyName]);
    };
}

export function setItems(targetClass: any, propertyName: string) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const mm = modelManager();
        mm.addRule(targetClass, EventType.setItems, target[propertyKey], [propertyName]);
    };
}

// Decorator for validate
export function validate(targetClass: any, ...properties: string[]) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const mm = modelManager();
        mm.addValidateRule(targetClass, target[propertyKey], properties);
    };
}

// Decorator for init
export function init(targetClass: any) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const mm = modelManager();
        mm.addRule(targetClass, EventType.init, target[propertyKey]);
    };
}

// Decorator for saving
export function saving(targetClass: any) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const mm = modelManager();
        mm.addRule(targetClass, EventType.saving, target[propertyKey]);
    };
}

// Decorator for saved
export function saved(targetClass: any) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const mm = modelManager();
        mm.addRule(targetClass, EventType.saved, target[propertyKey]);
    };
}

// Decorator for editing
export function editing(targetClass: any) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const mm = modelManager();
        mm.addRule(targetClass, EventType.editing, target[propertyKey]);
    };
}

// Decorator for edited
export function edited(targetClass: any) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const mm = modelManager();
        mm.addRule(targetClass, EventType.edited, target[propertyKey]);
    };
}

// Decorator for removing
export function removing(targetClass: any) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const mm = modelManager();
        mm.addRule(targetClass, EventType.removing, target[propertyKey]);
    };
}

// Decorator for removed
export function removed(targetClass: any) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const mm = modelManager();
        mm.addRule(targetClass, EventType.removed, target[propertyKey]);
    };
}

// Load rules from folder
export async function loadRules(folder: string): Promise<void> {
    const files = await util.promisify(fs.readdir)(folder);
    const folders: any[] = [];
    const stats: fs.Stats[] = await Promise.all<fs.Stats>(files.map((fileName) => {
        return util.promisify(fs.lstat)(path.join(folder, fileName));
    }));

    stats.forEach((stat, index) => {
        const fn = path.join(folder, files[index]);
        if (stat.isDirectory()) {
            folders.push(loadRules(fn));
        } else if (path.extname(fn) === '.js') {
            require(fn);
        }

    });
    if (folders.length)
        await Promise.all(folders);
}
