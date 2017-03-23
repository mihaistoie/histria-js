
import * as fs from 'fs';
import * as path from 'path';
import { fs as fsPromises } from 'histria-utils';
import { modelManager } from '../model-manager';
import { EventType } from '../interfaces';


// Title decorator
// Allow title add a title && an description
export function title(targetClass: any, title: string, description?: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let mm = modelManager();
        mm.setTitle(targetClass, target[propertyKey], title, description);
    }
}


// Decorator  for propChanged
export function propChanged(targetClass: any, ...properties: string[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let mm = modelManager();
        mm.addRule(targetClass, EventType.propChanged, target[propertyKey], properties);
    }
}


// Decorators for composition list
export function addItem(targetClass: any, propertyName: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let mm = modelManager();
        mm.addRule(targetClass, EventType.addItem, target[propertyKey], [propertyName]);
    }
}

export function rmvItem(targetClass: any, propertyName: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let mm = modelManager();
        mm.addRule(targetClass, EventType.removeItem, target[propertyKey], [propertyName]);
    }
}

export function setItems(targetClass: any, propertyName: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let mm = modelManager();
        mm.addRule(targetClass, EventType.setItems, target[propertyKey], [propertyName]);
    }
}



// Decorator for validate
export function validate(targetClass: any, ...properties: string[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let mm = modelManager();
        mm.addValidateRule(targetClass, target[propertyKey], properties);
    }
}

// Decorator for init
export function init(targetClass: any) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let mm = modelManager();
        mm.addRule(targetClass, EventType.init, target[propertyKey]);
    }
}

const module_holder = {};
// Load rules from folder
export async function loadRules(folder: string): Promise<void> {
    let files = await fsPromises.readdir(folder);
    let stats: fs.Stats[];
    let folders: any[] = [];
    stats = await Promise.all<fs.Stats>(files.map((fileName) => {
        let fn = path.join(folder, fileName);
        return fsPromises.lstat(fn);
    }));

    stats.forEach((stat, index) => {
        let fn = path.join(folder, files[index]);
        if (stat.isDirectory()) {
            folders.push(loadRules(fn));
        } else if (path.extname(fn) === '.js') {
            require(fn);
        }

    });
    if (folders.length)
        await Promise.all(folders);
}
