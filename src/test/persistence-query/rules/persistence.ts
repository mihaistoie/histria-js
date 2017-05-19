import { User } from '../persistence-query-model';
import { removing } from '../../../index';



export class UserRules {
    @removing(User)
    static async canRemoveUser(user: User, eventInfo: any): Promise<boolean> {
        if (user.firstName === 'Jack')
            return false;
        return true;
    }

}




