
import * as fs from 'fs';
import * as path from 'path';
import * as promises from '../utils/promises';
import { ModelManager } from './model-manager';
import { RULE_TRIGGERS } from '../consts/consts';


//Title decorator
// Allow title add a title && an description 
export function title(targetClass: any, title: string, description?: string) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        let mm = new ModelManager();
        mm.setTitle(targetClass, target[propertyKey], title, description);
    }
}


//decorator for propChanged
export function propChanged(targetClass: any, ...properties: string[]) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        let mm = new ModelManager();
        mm.addRule(targetClass, RULE_TRIGGERS.PROP_CHANGED, target[propertyKey], properties);
    }
}

//decorator for init
export function init(targetClass: any) {
    let mm = new ModelManager();
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        let mm = new ModelManager();
        mm.addRule(targetClass, RULE_TRIGGERS.INIT, target[propertyKey]);
    }
}






var module_holder = {};
// load rules from folder
export async function loadRules(folder: string): Promise<void> {
    let files = await promises.fs.readdir(folder);
    let stats: fs.Stats[];
    let folders = [];
    stats = await Promise.all(files.map((fileName) => {
        let fn = path.join(folder, fileName);
        return promises.fs.lstat(fn);
    }));

    stats.forEach((stat, index) => {
        let fn = path.join(folder, files[index]);
        if (stat.isDirectory())
            folders.push(loadRules(fn));
        else if (path.extname(fn) === '.js') {
            require(folder)(module_holder);
        }

    });
    if (folders.length)
        await Promise.all(folders);
}
