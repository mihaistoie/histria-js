declare function or(predicate: (a: any, b: any) => boolean): (a: any, b: any) => boolean;
declare function and(predicate: (a: any, b: any) => boolean): (a: any, b: any) => boolean;
declare function validate(validator: any, b: any): any;
declare const OPERATORS: {
    $eq: (a: any, b: any) => boolean;
    $ne: (a: any, b: any) => boolean;
    $or(a: any, b: any): boolean;
    $gt: (a: any, b: any) => boolean;
    $gte: (a: any, b: any) => boolean;
    $lt: (a: any, b: any) => boolean;
    $lte: (a: any, b: any) => boolean;
    $mod: (a: any, b: any) => boolean;
    $in(a: any, b: any): boolean;
    $nin(a: any, b: any): boolean;
    $not(a: any, b: any): boolean;
    $type(a: any, b: any): boolean;
    $all(a: any, b: any): any;
    $size(a: any, b: any): boolean;
    $nor(a: any, b: any): boolean;
    $and(a: any, b: any): any;
    $regex: (a: any, b: any) => boolean;
    $where(a: any, b: any): any;
    $elemMatch(a: any, b: any): any;
    $exists(a: any, b: any): boolean;
};
declare const PREPARERS: {
    $eq(a: any): any;
    $ne(a: any): any;
    $and(a: any): any;
    $or(a: any): any;
    $nor(a: any): any;
    $not(a: any): any;
    $regex(a: any, query: any): RegExp;
    $where(a: any): any;
    $elemMatch(a: any): any;
    $exists(a: any): boolean;
};
declare function _isFunction(value: any): boolean;
declare function _search(arr: any, validator: any): number;
declare const search: (arr: any, validator: any) => any;
declare function _createValidator(a: any, validate: any): {
    a: any;
    v: any;
};
declare function nestedValidator(a: any, b: any): any;
declare function _compare(a: any, b: any): any;
declare function _findValues(current: any, path: any, index: any, values: any): void;
declare function _createNestedValidator(keypath: any, a: any): {
    a: {
        k: any;
        nv: any;
    };
    v: (a: any, b: any) => any;
};
/**
 * flatten the query
 */
declare function _parse(query: any): any;
declare function _createRootValidator(query: any, getter: any): any;
