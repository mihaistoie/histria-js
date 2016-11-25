import * as util from 'util';
import * as uuid from 'node-uuid';
import { ModelManager } from '../model/model-manager';
import { TranContext } from './user-context';
import { UserContext, TransactionContainer } from '../model/interfaces';

export class Transaction implements TransactionContainer {
    private _id: any;
    private _ctx: UserContext;
    constructor(ctx?: UserContext) {
        let that = this;
        that._id = uuid.v1();
        that._ctx = ctx || new TranContext();
    }

    public get context(): UserContext {
        return this._ctx;
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
    public destroy() {
        let that = this;
        that._ctx = null;
    }

}
