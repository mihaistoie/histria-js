import { EnumState, IdState, IntegerState, NumberState, DateState, DateTimeState, RefObjectState, RefArrayState, StringState } from './state';
import { ObservableObject } from './interfaces';
import { JSONTYPES, schemaUtils, helper } from 'histria-utils';

export class InstanceState {
    protected _states: any;
    private _schema: any;
    private _parent: ObservableObject;

    constructor(parent: ObservableObject, schema: any) {
        let that = this;
        that._states = {};
        that._schema = schema;
        that._parent = parent;
        schema && schema.properties && Object.keys(schema.properties).forEach(propName => {
            let cs = schema.properties[propName];
            let propType = schemaUtils.typeOfProperty(cs);
            if (cs.enum) {
                that._states[propName] = new EnumState(that._parent, propName);
            } else {
                switch (propType) {
                    case JSONTYPES.integer:
                        that._states[propName] = new IntegerState(that._parent, propName);
                        break;
                    case JSONTYPES.id:
                        that._states[propName] = new IdState(that._parent, propName);
                        break;
                    case JSONTYPES.number:
                        that._states[propName] = new NumberState(that._parent, propName);
                        break;
                    case JSONTYPES.date:
                        that._states[propName] = new DateState(that._parent, propName);
                        break;
                    case JSONTYPES.datetime:
                        that._states[propName] = new DateTimeState(that._parent, propName);
                        break;
                    default:
                        that._states[propName] = new StringState(that._parent, propName);
                        break;
                }
            }

        });
        schema && schema.relations && Object.keys(schema.relations).forEach(propName => {
            /*
                                case JSONTYPES.array:
                                    break;
                                case JSONTYPES.object:
                                    break;
                                case JSONTYPES.refobject:
                                    that._states[propName] = new RefObjectState(that._parent, propName);
                                    break;
                                case JSONTYPES.refarray:
                                    that._states[propName] = new RefArrayState(that._parent, propName);
                                    break;
             */
        });

    }
    public destroy() {
        let that = this;
        if (that._states) {
            helper.destroy(that._states);
            that._states = null;
        }
        that._schema = null;
        that._parent = null;

    }
}
