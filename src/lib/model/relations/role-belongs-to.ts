import { IObservableObject, IFindOptions } from '../interfaces';
import { Role } from './role';
import { schemaUtils, DEFAULT_PARENT_NAME } from 'histria-utils';

export class BaseBelongsTo<T extends IObservableObject> extends Role<T> {
    protected async _lazyLoad(): Promise<T> {
        const query = schemaUtils.roleToQueryInv(this._relation, this._parent.model());
        if (query) {
            const opts: IFindOptions = { onlyInCache: !this.refIsPersistent };
            return this._parent.transaction.findOne<T>(this._refClass, query, opts);
        }
        return null;
    }
}

export class AggregationBelongsTo<T extends IObservableObject> extends BaseBelongsTo<T> {
    public internalSetValue(value: any) {
        this._value = value;
    }

    public async internalSetValueAndNotify(newValue: any, oldValue: any): Promise<void> {
        await this._parent.changeProperty(this._propertyName, oldValue, newValue, () => {
            this.internalSetValue(newValue);
            schemaUtils.updateRoleRefs(this._relation, this._parent.model(), newValue ? newValue.model() : null, false);
        }, { isLazyLoading: false });
    }
    protected async _getValue(): Promise<T> {
        let res: any = this._value;
        if (res === undefined) {
            res = await this._lazyLoad() || null;
            this._value = res;
            // TODO: update side
            // this._updateInvSide()
        }
        return res;
    }

    protected async _setValue(value: T): Promise<void> {
        this._checkValueBeforeSet(value);
        const oldValue = this._value;
        const newValue = value;
        if (oldValue === newValue)
            return;
        let notified = false;
        if (oldValue) {
            notified = true;
            await oldValue.rmvObjectFromRole(this._relation.invRel, this._parent);
        }
        if (newValue) {
            notified = true;
            await newValue.addObjectToRole(this._relation.invRel, this._parent);
        }
        if (!notified) {
            await this.internalSetValueAndNotify(newValue, oldValue);
        }
    }

}

export class CompositionBelongsTo<T extends IObservableObject> extends BaseBelongsTo<T> {

    // tslint:disable-next-line:no-empty
    public internalSetValue(value: any) { }
    protected async _getValue(): Promise<T> {
        let res: any = this._parent.owner;
        if (res === undefined) {
            res = await this._lazyLoad() || null;
            const p: any = this._parent;
            // parent of p is res
            await p.changeParent(res, this._relation.invRel, this._propertyName || DEFAULT_PARENT_NAME, false);
        }
        return res;
    }

    protected async _setValue(value: T): Promise<void> {
        const oldParent = await this._getValue();
        const newParent = value;
        if (oldParent === newParent)
            return;
        let changeParentCalled = false;
        if (this._relation.invRel) {
            if (oldParent) {
                changeParentCalled = true;
                await oldParent.rmvObjectFromRole(this._relation.invRel, this._parent);
            }
            if (newParent) {
                changeParentCalled = true;
                await newParent.addObjectToRole(this._relation.invRel, this._parent);
            }
        }
        if (!changeParentCalled) {
            const p: any = this._parent;
            schemaUtils.updateRoleRefs(this._relation, this._parent.model(), newParent ? newParent.model() : null, false);
            // parent of p is newParent
            await p.changeParent(newParent, this._relation.invRel, this._propertyName || DEFAULT_PARENT_NAME, true);
        }
    }

}
