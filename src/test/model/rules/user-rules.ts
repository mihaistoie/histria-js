import { User } from '../model-model';
import { propChanged, init, title, validate } from '../../../index';


export class UserRules {
    @propChanged(User, 'firstName', 'lastName')
    @title(User, 'Calculate:  FullName = FirstName + LastName')
    static async updateFullName(user: User, eventInfo: any): Promise<void> {
        let fn = user.firstName;
        let ln = user.lastName;
        let fullName = [];
        if (fn) fullName.push(fn);
        if (ln) fullName.push(ln.toUpperCase());
        await user.setFullName(fullName.join(' '));
    }
    @init(User)
    static async init(user: User, eventInfo: any): Promise<void> {
        if (!user.isNew) {
            await UserRules.updateFullName(user, eventInfo);
        }
    }

    @validate(User)
    static async check(user: User, eventInfo: any): Promise<void> {
        let fn = user.firstName;
        let ln = user.lastName;
        if (fn === ln) {
            throw new Error('FirstName === LastName')
        }
    }
    @validate(User, 'lastName')
    static async checkLastName(user: User, eventInfo: any): Promise<void> {
        let ln = user.lastName;
        if (ln && ln.charAt(0) === '$')
            user.$errors.lastName.error = 'Last Name starts with $.';
    }
}




