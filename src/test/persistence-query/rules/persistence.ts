import { User } from '../persistence-query-model';
import { removing } from '../../../index';



export class UserRules {
    @removing(User)
    static async canRemoveUser(user: User, eventInfo: any): Promise<boolean> {
        return false;

    }

}




