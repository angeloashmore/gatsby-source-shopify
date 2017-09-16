'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProductNode = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _crypto = require('crypto');

var _lodash = require('lodash.camelcase');

var _lodash2 = _interopRequireDefault(_lodash);

var _jsonStringifySafe = require('json-stringify-safe');

var _jsonStringifySafe2 = _interopRequireDefault(_jsonStringifySafe);

var _lodash3 = require('lodash.upperfirst');

var _lodash4 = _interopRequireDefault(_lodash3);

var _package = require('../package');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const sourceId = '__SOURCE__';
const typePrefix = 'Shopify';

const digest = str => (0, _crypto.createHash)(`md5`).update(str).digest(`hex`);
const withDigest = obj => {
  obj.internal.contentDigest = digest((0, _jsonStringifySafe2.default)(obj));
  return obj;
};
const makeTypeName = type => (0, _lodash4.default)((0, _lodash2.default)(`${typePrefix} ${type}`));

const ProductNode = exports.ProductNode = obj => withDigest((0, _extends3.default)({}, obj, {
  parent: sourceId,
  children: [],
  fields: {},
  internal: {
    type: makeTypeName('Product'),
    owner: _package2.default.name,
    fieldOwners: (0, _keys2.default)(obj).reduce((acc, curr) => {
      acc[curr] = _package2.default.name;
      return acc;
    }, {})
  }
}));