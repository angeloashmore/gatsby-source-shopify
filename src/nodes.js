import { createHash } from 'crypto'
import {
  assoc,
  camelCase,
  cloneDeep,
  constant,
  identity,
  isPlainObject,
  mapValues,
  upperFirst,
} from 'lodash/fp'
import stringify from 'json-stringify-safe'

const sourceId = '__SOURCE__'
const typePrefix = 'Shopify'
const conflictFieldPrefix = `shopify`
const restrictedNodeFields = [`id`, `children`, `parent`, `fields`, `internal`]

const digest = str =>
  createHash(`md5`)
    .update(str)
    .digest(`hex`)
const withDigest = obj =>
  assoc(['internal', 'contentDigest'], digest(stringify(obj)), obj)
const prefixConflictingKeys = obj => {
  Object.keys(obj).forEach(key => {
    if (restrictedNodeFields.includes(key)) {
      obj[conflictFieldPrefix + upperFirst(key)] = obj[key]
      delete obj[key]
    }
  })

  return obj
}

const makeId = (type, id) => `${typePrefix}__${upperFirst(type)}__${id}`
const makeTypeName = type => upperFirst(camelCase(`${typePrefix} ${type}`))

const createNodeFactory = (type, middleware = identity) => (
  obj,
  overrides = {},
) => {
  // if (!isPlainObject(obj))
  //   throw new Error(
  //     `The source object must be a plain object. An argument of type "${typeof obj}" was provided.`,
  //   )

  // if (!isPlainObject(overrides))
  //   throw new Error(
  //     `Node overrides must be a plain object. An argument of type "${typeof overrides}" was provided.`,
  //   )

  const clonedObj = cloneDeep(obj)
  const safeObj = prefixConflictingKeys(clonedObj)

  let node = {
    ...safeObj,
    id: makeId(type, obj.id),
    parent: sourceId,
    children: [],
    internal: {
      type: makeTypeName(type),
    },
  }

  node = middleware(node)

  return withDigest({
    ...node,
    ...overrides,
  })
}

export const CollectionNode = createNodeFactory('Collection', node => {
  if (node.products) {
    node.children = node.products.edges.map(edge =>
      makeId('Product', edge.node.id),
    )
    delete node.products
  }

  return node
})

export const ProductNode = createNodeFactory('Product', node => {
  if (node.variants) {
    const variants = node.variants.edges.map(edge => edge.node)
    const variantPrices = variants
      .map(variant => Number.parseFloat(variant.price))
      .filter(Boolean)
    const minPrice = Math.min(...variantPrices) || 0
    const maxPrice = Math.max(...variantPrices) || 0

    // minPrice and maxPrice are wrapped in a string to comply with Shopify's
    // string-wrapped Money values.
    node.minPrice = `${minPrice}`
    node.maxPrice = `${maxPrice}`

    node.children = variants.map(variant =>
      makeId('ProductVariant', variant.id),
    )

    delete node.variants
  }

  return node
})

export const ProductVariantNode = createNodeFactory('ProductVariant')
