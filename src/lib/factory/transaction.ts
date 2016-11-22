import * as util from 'util';
import * as uuid from 'node-uuid';
import { ModelManager } from '../model/model-manager';

export class Transaction {
    private _id: any;
    constructor() {
        let that = this;
        that._id = uuid.v1();
    }

    public create<T>(classOfInstance: any): T {
        let mm = new ModelManager();
        let instance = mm.createInstance<T>(classOfInstance, this, {}, { isCreate: true, isRestore: true });
        return instance;
    }
    public restore<T>(classOfInstance: any, data: any): T {
        let mm = new ModelManager();
        let instance = mm.createInstance<T>(classOfInstance, this, data, { isCreate: true, isRestore: true });
        return instance;
    }
    public load<T>(classOfInstance: any, data: any): T {
        let mm = new ModelManager();
        let instance = mm.createInstance<T>(classOfInstance, this, data, { isCreate: false, isRestore: false });
        return instance;
    }

}
