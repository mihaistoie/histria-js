import { modelManager } from '../../index';

import { User, USER_SCHEMA } from './user';
export { User } from './user';
modelManager().registerClass(User, USER_SCHEMA);