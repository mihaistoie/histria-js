import { User } from '../persistence-query-model';
import { removing, editing } from '../../../index';



export class UserRules {
    @removing(User)
    static async canRemoveUser(user: User, eventInfo: any): Promise<boolean> {
        if (user.firstName === 'Jack')
            return false;
        return true;
    }

    @editing(User)
    static async canModifyUser(user: User, eventInfo: any): Promise<boolean> {
        if (user.firstName === 'Albert')
            return false;
        return true;
    }


}




