import { createHash } from 'crypto'
import {
  assoc,
  camelCase,
  cloneDeep,
  constant,
  mapValues,
  upperFirst,
} from 'lodash/fp'
import stringify from 'json-stringify-safe'
import readPkgUp from 'read-pkg-up'

const { pkg } = readPkgUp.sync(__dirname)

const sourceId = '__SOURCE__'
const typePrefix = 'Shopify'

const digest = str =>
  createHash(`md5`)
    .update(str)
    .digest(`hex`)
const withDigest = obj =>
  assoc(['internal', 'contentDigest'], digest(stringify(obj)), obj)
const makeTypeName = type => upperFirst(camelCase(`${typePrefix} ${type}`))

export const ProductNode = obj_ => {
  const obj = cloneDeep(obj_)

  delete obj.variants

  return withDigest({
    ...obj,
    parent: sourceId,
    children: [],
    // fields: {},
    internal: {
      type: makeTypeName('Product'),
      owner: pkg.name,
      // fieldOwners: mapValues(constant(pkg.name), obj),
    },
  })
}

export const ProductVariantNode = (parent, obj) =>
  withDigest({
    ...obj,
    parent: parent.id,
    children: [],
    // fields: {},
    internal: {
      type: makeTypeName('ProductVariant'),
      owner: pkg.name,
      // fieldOwners: mapValues(constant(pkg.name), obj),
    },
  })
