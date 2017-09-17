import { createHash } from 'crypto'
import camelCase from 'lodash.camelcase'
import stringify from 'json-stringify-safe'
import upperFirst from 'lodash.upperfirst'
import pkg from '../package'

const sourceId = '__SOURCE__'
const typePrefix = 'Shopify'

const digest = str =>
  createHash(`md5`)
    .update(str)
    .digest(`hex`)
const withDigest = obj => {
  obj.internal.contentDigest = digest(stringify(obj))
  return obj
}
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
      fieldOwners: Object.keys(obj).reduce((acc, curr) => {
        acc[curr] = pkg.name
        return acc
      }, {}),
    },
  })
