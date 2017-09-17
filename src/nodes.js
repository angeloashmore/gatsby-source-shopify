import { createHash } from 'crypto'
import { assoc, camelCase, constant, mapValues, upperFirst } from 'lodash/fp'
import stringify from 'json-stringify-safe'
import pkg from '../package'

const sourceId = '__SOURCE__'
const typePrefix = 'Shopify'

const digest = str =>
  createHash(`md5`)
    .update(str)
    .digest(`hex`)
const withDigest = obj =>
  assoc(['internal', 'contentDigest'], digest(stringify(obj)), obj)
const makeTypeName = type => upperFirst(camelCase(`${typePrefix} ${type}`))

export const ProductNode = obj =>
  withDigest({
    ...obj,
    parent: sourceId,
    children: [],
    fields: {},
    internal: {
      type: makeTypeName('Product'),
      owner: pkg.name,
      fieldOwners: mapValues(constant(pkg.name), obj),
    },
  })
