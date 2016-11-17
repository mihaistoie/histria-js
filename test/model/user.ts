import { Instance, InstanceState, ModelManager, State, StringState, IntegerState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState } from '../../src/index';

const
    USER_SCHEMA = {
        "type": "object",
        "nameSpace": "users",
        "properties": {
            "firstName": {
                "title": "First Name",
                "type": "string"
            },
            "lastName": {
                "title": "Last Name",
                "type": "string"
            },
            "fullName": {
                "title": "Full Name",
                "type": "string"
            }

        },
        "states": {
            "firstName": {
                "isMandatory": true
            },
            "fullName" : {
                "isReadOnly": true
            }
        }
    };


export class UserState extends InstanceState {
    public get firstName(): StringState {
        return this._states.firstName;
    }
    public get lastName(): StringState {
        return this._states.lastName;
    }
    public get fullName(): StringState {
        return this._states.fullName;
    }
}


export class User extends Instance {
    protected init() {
        super.init();
        let that = this;
        that._schema = USER_SCHEMA;
    }
    protected createStates() {
        let that = this;
        that._states = new UserState(that, that._schema); 
    }
    public firstName(value?: string): Promise<string> {
        return this.getOrSetProperty('firstName', value);
    }
    public lastName(value?: string): Promise<string> {
        return this.getOrSetProperty('lastName', value);
    }
    public fullName(value?: string): Promise<string> {
        return this.getOrSetProperty('fullName', value);
    }
    public get states(): UserState {
        return <UserState>this._states;
    }

}
new ModelManager().registerClass(User, USER_SCHEMA.nameSpace);
