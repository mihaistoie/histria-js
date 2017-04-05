import { UserDetail, User } from '../view-one-model';
import { propChanged, init, title } from '../../../index';


const
    VAT_TAX = 0.193;


export class UserDetailRules {
    @propChanged(UserDetailRules, 'user.firstName', 'user.lastName')
    @title(UserDetailRules, 'Calculate:  FullName = FirstName + LastName')
    static async updateFullName(ud: UserDetail, user: User, eventInfo: any): Promise<void> {
        let fn = user.firstName;
        let ln = user.lastName;
        let fullName = [];
        if (fn) fullName.push(fn);
        if (ln) fullName.push(ln.toUpperCase());
        await ud.setFullName(fullName.join(' '));
    }
}




