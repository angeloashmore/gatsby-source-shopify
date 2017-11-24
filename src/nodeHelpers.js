import { createHash } from 'crypto'
import {
  assoc,
  camelCase,
  cloneDeep,
  identity,
  isPlainObject,
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

export const makeId = (type, id) => `${typePrefix}__${upperFirst(type)}__${id}`
export const makeTypeName = type => upperFirst(camelCase(`${typePrefix} ${type}`))

export const createNodeFactory = (type, middleware = identity) => (
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
