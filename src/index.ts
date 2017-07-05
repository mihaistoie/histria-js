export { Instance } from './lib/model/base-object';
export { View } from './lib/model/base-view';
export { InstanceErrors } from './lib/model/states/instance-errors';
export { InstanceState } from './lib/model/states/instance-state';
export { ErrorState } from './lib/model/states/error-state';
export { modelManager } from './lib/model/model-manager';
export { Transaction } from './lib/factory/transaction';
export { HasManyComposition, HasManyAggregation, HasManyRefObject } from './lib/model/relations/role-has-many';
export { propChanged, addItem, rmvItem, setItems, init, title, loadRules, validate, editing, edited, removing, removed, saving, saved } from './lib/model/rules/decorators';
export { State, StringState, IdState, IntegerState, BooleanState, EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState } from './lib/model/states/state';
export { IntegerValue, NumberValue } from './lib/model/types/number';
export { IdValue } from './lib/model/types/id';
export { classGenerator } from './lib/generators/classgen';
export { serializeInstance } from './lib/serialization/serialization';


