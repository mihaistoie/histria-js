import { User } from './user';
import { ModelManager, RULE_TRIGGERS } from '../../src/index';


export class UserRules {
    static async updateFullName(user: User, callStackInfo: any): Promise<void> {
        let fn = await user.firstName();
        let ln = await user.firstName();
        let fullName = [];
        if (fn) fullName.push(fn);
        if (ln) fullName.push(ln.toUpperCase());
        await user.fullName(fullName.join(' '));
    }
}

let mm = new ModelManager();
mm.rule(User, RULE_TRIGGERS.PROP_CHANGED, UserRules.updateFullName, ['firstName', 'lastName']);
mm.rule(User, RULE_TRIGGERS.LOADED, UserRules.updateFullName);




