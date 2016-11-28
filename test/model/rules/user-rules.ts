import { User } from '../user';
import { propChanged, init, title } from '../../../src/index';


export class UserRules {
    @propChanged(User, 'firstName', 'lastName')
    @title(User, 'Calculate:  FullName = FirstName + LastName')
    static async updateFullName(user: User, eventInfo: any): Promise<void> {
        let fn = await user.firstName();
        let ln = await user.lastName();
        let fullName = [];
        if (fn) fullName.push(fn);
        if (ln) fullName.push(ln.toUpperCase());
        await user.fullName(fullName.join(' '));
    }
    @init(User)
    static async init(user: User, eventInfo: any): Promise<void> {
        if (!user.isNew) {
            await UserRules.updateFullName(user, eventInfo);
        }
    }
}

export var test = 1;




