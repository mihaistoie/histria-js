import { modelManager } from '../../index';

import { AddressView, ADDRESSVIEW_SCHEMA } from './address-view';
export { AddressView } from './address-view';
import { UserDetail, USERDETAIL_SCHEMA } from './user-detail';
export { UserDetail } from './user-detail';
import { User, USER_SCHEMA } from './user';
export { User } from './user';
modelManager().registerClass(AddressView, ADDRESSVIEW_SCHEMA);
modelManager().registerClass(UserDetail, USERDETAIL_SCHEMA);
modelManager().registerClass(User, USER_SCHEMA);