"use strict";
exports.JSONTYPES = {
    string: 'string',
    integer: 'integer',
    boolean: 'boolean',
    number: 'number',
    object: 'object',
    array: 'array',
    // extended
    date: 'date',
    datetime: 'date-time',
    id: 'id'
};
exports.DEFAULT_PARENT_NAME = 'owner';
exports.RELATION_TYPE = {
    hasOne: 'hasOne',
    hasMany: 'hasMany',
    belongsTo: 'belongsTo'
};
exports.AGGREGATION_KIND = {
    none: 'none',
    shared: 'shared',
    composite: 'composite'
};
exports.JSONFORMATS = {
    email: 'email',
    json: 'json'
};
