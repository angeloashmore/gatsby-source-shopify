'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createNodeFactory = exports.makeTypeName = exports.makeId = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _crypto = require('crypto');

var _fp = require('lodash/fp');

var _jsonStringifySafe = require('json-stringify-safe');

var _jsonStringifySafe2 = _interopRequireDefault(_jsonStringifySafe);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const sourceId = '__SOURCE__';
const typePrefix = 'Shopify';
const conflictFieldPrefix = `shopify`;
const restrictedNodeFields = [`id`, `children`, `parent`, `fields`, `internal`];

const digest = str => (0, _crypto.createHash)(`md5`).update(str).digest(`hex`);
const withDigest = obj => (0, _fp.assoc)(['internal', 'contentDigest'], digest((0, _jsonStringifySafe2.default)(obj)), obj);
const prefixConflictingKeys = obj => {
  (0, _keys2.default)(obj).forEach(key => {
    if (restrictedNodeFields.includes(key)) {
      obj[conflictFieldPrefix + (0, _fp.upperFirst)(key)] = obj[key];
      delete obj[key];
    }
  });

  return obj;
};

const makeId = exports.makeId = (type, id) => `${typePrefix}__${(0, _fp.upperFirst)(type)}__${id}`;
const makeTypeName = exports.makeTypeName = type => (0, _fp.upperFirst)((0, _fp.camelCase)(`${typePrefix} ${type}`));

const createNodeFactory = exports.createNodeFactory = (type, middleware = _fp.identity) => (obj, overrides = {}) => {
  // if (!isPlainObject(obj))
  //   throw new Error(
  //     `The source object must be a plain object. An argument of type "${typeof obj}" was provided.`,
  //   )

  // if (!isPlainObject(overrides))
  //   throw new Error(
  //     `Node overrides must be a plain object. An argument of type "${typeof overrides}" was provided.`,
  //   )

  const clonedObj = (0, _fp.cloneDeep)(obj);
  const safeObj = prefixConflictingKeys(clonedObj);

  let node = (0, _extends3.default)({}, safeObj, {
    id: makeId(type, obj.id),
    parent: sourceId,
    children: [],
    internal: {
      type: makeTypeName(type)
    }
  });

  node = middleware(node);

  return withDigest((0, _extends3.default)({}, node, overrides));
};