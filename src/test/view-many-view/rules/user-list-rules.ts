import { UserList, User } from '../view-many-view-model';
import { propChanged, setItems, addItem, init, rmvItem, title } from '../../../index';

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
