import { modelManager } from '../../index';

import { AdressView, ADRESSVIEW_SCHEMA } from './adress-view';
export { AdressView } from './adress-view';
import { UserDetail, USERDETAIL_SCHEMA } from './user-detail';
export { UserDetail } from './user-detail';
import { User, USER_SCHEMA } from './user';
export { User } from './user';
modelManager().registerClass(AdressView, ADRESSVIEW_SCHEMA);
modelManager().registerClass(UserDetail, USERDETAIL_SCHEMA);
modelManager().registerClass(User, USER_SCHEMA);