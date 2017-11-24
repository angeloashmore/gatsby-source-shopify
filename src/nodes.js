import { createHash } from 'crypto'
import {
  assoc,
  camelCase,
  cloneDeep,
  constant,
  identity,
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

export const createNodeFactory = (type, overrides = () => ({}), middleware = identity) => (
  obj,
  providedNodeOptions = {},
) => {
  const nodeOptions = Object.assign(
    {
      parent: sourceId,
    },
    providedNodeOptions,
  )

  const clonedObj = cloneDeep(obj)

  const middlewareModifiedObj = middleware(clonedObj)
  const safeObj = prefixConflictingKeys(middlewareModifiedObj)

  return withDigest({
    ...safeObj,
    id: makeId(type, obj.id),
    children: [],
    internal: {
      type: makeTypeName(type),
    },
    ...overrides(clonedObj),
    parent: nodeOptions.parent,
  })
}

export const CollectionNode = createNodeFactory(
  'Collection',
  obj => {
    if (!obj.products) return {}

    return {
      children: obj.products.edges.map(edge => makeId('Product', edge.node.id)),
    }
  },
  obj => {
    delete obj.products
    return obj
  }
)

export const ProductNode = createNodeFactory(
  'Product',
  obj => {
    if (!obj.variants) return {}

    return {
      children: obj.variants.edges.map(edge => makeId('ProductVariant', edge.node.id))
    }
  },
  obj => {
    if (obj.variants) {
      const variants = obj.variants.edges.map(edge => edge.node)
      const variantPrices = variants
        .map(variant => Number.parseFloat(variant.price))
        .filter(Boolean)
      const minPrice = Math.min(...variantPrices) || 0
      const maxPrice = Math.max(...variantPrices) || 0

      // minPrice and maxPrice are wrapped in a string to comply with Shopify's
      // string-wrapped Money values.
      obj.minPrice = `${minPrice}`
      obj.maxPrice = `${maxPrice}`
    }

    delete obj.variants
    return obj
  }
)

export const ProductVariantNode = createNodeFactory('ProductVariant')
