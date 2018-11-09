import { EnumState, IdState, IntegerState, NumberState, DateState, DateTimeState, RefObjectState, RefArrayState, StringState } from './state';
import { IObservableObject } from '../interfaces';
import { JSONTYPES, schemaUtils, helper } from 'histria-utils';

export class InstanceState {
    protected _states: any;
    private _schema: any;
    private _parent: IObservableObject;

    constructor(parent: IObservableObject, schema: any) {
        this._states = {};
        this._schema = schema;
        this._parent = parent;
        if (schema && schema.properties)
            Object.keys(schema.properties).forEach(propName => {
                const cs = schema.properties[propName];
                const propType = schemaUtils.typeOfProperty(cs);
                if (cs.enum) {
                    this._states[propName] = new EnumState(this._parent, propName);
                } else {
                    switch (propType) {
                        case JSONTYPES.integer:
                            this._states[propName] = new IntegerState(this._parent, propName);
                            break;
                        case JSONTYPES.id:
                            this._states[propName] = new IdState(this._parent, propName);
                            break;
                        case JSONTYPES.number:
                            this._states[propName] = new NumberState(this._parent, propName);
                            break;
                        case JSONTYPES.date:
                            this._states[propName] = new DateState(this._parent, propName);
                            break;
                        case JSONTYPES.datetime:
                            this._states[propName] = new DateTimeState(this._parent, propName);
                            break;
                        default:
                            this._states[propName] = new StringState(this._parent, propName);
                            break;
                    }
                }

            });
        if (schema && schema.relations)
            Object.keys(schema.relations).forEach(propName => {
                /*
                                    case JSONTYPES.array:
                                        break;
                                    case JSONTYPES.object:
                                        break;
                                    case JSONTYPES.refobject:
                                        this._states[propName] = new RefObjectState(this._parent, propName);
                                        break;
                                    case JSONTYPES.refarray:
                                        this._states[propName] = new RefArrayState(this._parent, propName);
                                        break;
                 */
            });

    }
    public destroy() {
        if (this._states) {
            helper.destroy(this._states);
            this._states = null;
        }
        this._schema = null;
        this._parent = null;
    }
}
