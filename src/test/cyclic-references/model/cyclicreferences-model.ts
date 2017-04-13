import { modelManager } from '../../../index';

import { Group, GROUP_SCHEMA } from './group';
export { Group } from './group';
import { Item, ITEM_SCHEMA } from './item';
export { Item } from './item';
modelManager().registerClass(Group, GROUP_SCHEMA);
modelManager().registerClass(Item, ITEM_SCHEMA);