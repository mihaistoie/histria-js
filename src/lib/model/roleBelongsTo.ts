import { ObservableObject } from './interfaces';
import { Role } from './role';
import { AGGREGATION_KIND } from '../schema/schema-consts';



export class BaseBelongsTo<T extends ObservableObject> extends Role<T> {
    protected _value: T;

    constructor(parent: ObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation);

    }
    public destroy() {
        let that = this;
        that._value = null;
        super.destroy();
    }
}

export class CompositionBelongsTo<T extends ObservableObject> extends BaseBelongsTo<T> {
    constructor(parent: ObservableObject, propertyName: string, relation: any) {
        super(parent, propertyName, relation);

    }
    protected _getValue(): Promise<T> {
        let that = this;
        let res: any = that._parent.parent;
        return Promise.resolve(res);
    }
    protected async _setValue(value: T): Promise<T> {
        let that = this;
        let oldParent: any = that._parent.parent;
        let newParent: any = value;
        if (oldParent && oldParent.removeChild) {
            await oldParent.removeChild(that._relation.invRel, that._parent);
        } else if (newParent && newParent.addChild) {
            await newParent.addChild(that._relation.invRel, that._parent);
        } else if (!value) {
            let p : any =  that._parent;
            await p.changeParent(null, that._propertyName, false);
        }
        let res: any = that._parent.parent;
        return res;
    }

    public destroy() {
        let that = this;
        that._value = null;
        super.destroy();
    }
}

