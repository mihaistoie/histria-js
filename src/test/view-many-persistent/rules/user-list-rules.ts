import { UserList, User } from '../view-many-model';
import { propChanged, setItems, addItem, init, rmvItem, title } from '../../../index';

const
    VAT_TAX = 0.193;

export class UserListRules {
    @addItem(UserList, 'users')
    public static async afterAddIUser(users: UserList, eventInfo: any, user: User): Promise<void> {
        await users.setUserCount(users.userCount + 1);
    }
    @rmvItem(UserList, 'users')
    public static async afterRmvUser(users: UserList, eventInfo: any, user: User): Promise<void> {
        await users.setUserCount(users.userCount - 1);
    }
    @setItems(UserList, 'users')
    public static async afterSetUsers(users: UserList, eventInfo: any, user: User): Promise<void> {
        await users.setUserCount(await users.users.length());
    }

}
