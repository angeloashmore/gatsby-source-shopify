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

export const CollectionNode = obj_ => {
  const obj = cloneDeep(obj_)

  delete obj.products

  return withDigest({
    ...obj,
    parent: sourceId,
    children: obj_.products.edges.map(edge => edge.node.id),
    // fields: {},
    internal: {
      type: makeTypeName('Collection'),
      // fieldOwners: mapValues(constant(pkg.name), obj),
    },
  })
}

export const ProductNode = obj_ => {
  const obj = cloneDeep(obj_)

  if (obj.variants) {
    const variants = obj.variants.edges.map(edge => edge.node)
    const variantPrices = variants.map(variant => Number.parseFloat(variant.price)).filter(Boolean)
    const minPrice = Math.min(...variantPrices) || 0
    const maxPrice = Math.max(...variantPrices) || 0

    // minPrice and maxPrice are wrapped in a string to comply with Shopify's
    // string-wrapped Money values.
    obj.minPrice = `${minPrice}`
    obj.maxPrice = `${maxPrice}`
  }

  delete obj.variants

  return withDigest({
    ...obj,
    parent: sourceId,
    children: [],
    // fields: {},
    internal: {
      type: makeTypeName('Product'),
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
      // fieldOwners: mapValues(constant(pkg.name), obj),
    },
  })
