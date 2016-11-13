import { Instance, ModelManager} from '../../src/index';

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
            
        }
    };


export class User extends Instance {
    protected init() {
        super.init();
        let that = this;
        that._schema = USER_SCHEMA;
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

}
new ModelManager().registerClass(User, USER_SCHEMA.nameSpace);
