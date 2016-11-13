import { User } from '../user';
import { propChanged, init, title } from '../../../src/index';


export class UserRules {
    @propChanged(User, 'firstName', 'lastName')
    @init(User)
    @title(User, 'Update FullName = FirstName + LastName')
    static async updateFullName(user: User, callStackInfo: any): Promise<void> {
        let fn = await user.firstName();
        let ln = await user.lastName();
        let fullName = [];
        if (fn) fullName.push(fn);
        if (ln) fullName.push(ln.toUpperCase());
        await user.fullName(fullName.join(' '));
    }
}

export var test = 1;




