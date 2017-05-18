import { modelManager } from '../../index';

import { Tree, TREE_SCHEMA } from './tree';
export { Tree } from './tree';
import { UserList, USERLIST_SCHEMA } from './user-list';
export { UserList } from './user-list';
import { User, USER_SCHEMA } from './user';
export { User } from './user';
modelManager().registerClass(Tree, TREE_SCHEMA);
modelManager().registerClass(UserList, USERLIST_SCHEMA);
modelManager().registerClass(User, USER_SCHEMA);