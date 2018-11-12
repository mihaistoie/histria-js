import { UserDetail, User } from '../view-has-one-view-model';
import { propChanged, init, title } from '../../../index';

const
    VAT_TAX = 0.193;

export class UserDetailRules {
    @propChanged(UserDetail, 'user.firstName', 'user.lastName')
    public static async userNameChanged(ud: UserDetail, user: User, eventInfo: any): Promise<void> {
        await UserDetailRules.updateFullName(ud, user);
    }
    @propChanged(UserDetail, 'user')
    public static async userChanged(ud: UserDetail, eventInfo: any, newValue: User, oldValue: User): Promise<void> {
        await UserDetailRules.updateFullName(ud, newValue);
    }
    @title(UserDetail, 'Calculate:  FullName = FirstName + LastName')
    public static async updateFullName(ud: UserDetail, user: User): Promise<void> {
        if (user) {
            const fn = user.firstName;
            const ln = user.lastName;
            const fullName = [];
            if (fn) fullName.push(fn);
            if (ln) fullName.push(ln.toUpperCase());
            await ud.setFullName(fullName.join(' '));
        } else {
            await ud.setFullName('');
        }
    }
}
