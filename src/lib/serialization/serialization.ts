import * as util from 'util';
import { ModelObject } from '../model/model-object';
import { State } from '../model/states/state';
import { serialization, schemaManager } from 'histria-utils';

export async function serializeInstance(instance: ModelObject, pattern: any): Promise<any> {
    const output = {};
    await _serialize(instance, pattern, pattern, output, { states: true });
    return output;
}

async function _serialize(instance: ModelObject, pattern: any, root: any, output: any, options: { states: boolean }): Promise<void> {
    const sm = schemaManager();
    const instanceSchema = instance.getSchema();
    if (options.states)
        output.$states = output.$states || {};

    for (const item of pattern.properties) {
        const segments = item.value.split('.');
        let cs = instanceSchema;
        let currentInstance: any = instance;
        let value: any;
        let state: State;
        let isRelation = false;

        for (const segment of segments) {
            if (!currentInstance) {
                isRelation = false;
                break;
            }
            const pi = sm.propertyInfo(segment, cs);
            if (!pi)
                throw util.format('Invalid serialization path "%s.%s.%s"', instanceSchema.nameSpace, instanceSchema.name, item.value);
            if (pi.isRelation) {
                isRelation = true;
                cs = pi.schema;
                if (pi.isArray) {
                    currentInstance = await currentInstance[segment].toArray();
                    value = undefined;
                    break;
                } else {
                    currentInstance = await currentInstance[segment]();
                    value = undefined;
                }
            } else {
                isRelation = false;
                value = currentInstance[segment];
                state = currentInstance.$states[segment];
                break;
            }

        }
        if (isRelation) {
            if (!currentInstance) continue;
            if (Array.isArray(currentInstance)) {
                output[item.key] = output[item.key] || [];
                for (const ci of currentInstance) {
                    const oi = {};
                    output[item.key].push(oi);
                    await _serialize(ci, item, root, oi, options);
                }
                if (state) {
                    const propState = state.serialize();
                    if (propState) output.$states[item.key] = propState;
                }
            } else {
                output[item.key] = output[item.key] || {};
                await _serialize(currentInstance, item, root, output[item.key], options);
            }
        } else {
            if (value && typeof value === 'object')
                value = value.value;
            if (value !== undefined || value !== null)
                output[item.key] = value;
            if (state) {
                const propState = state.serialize();
                if (propState) output.$states[item.key] = propState;
            }
        }

    }
    if (output.$states && !Object.keys(output.$states).length)
        delete output.$states;

}
