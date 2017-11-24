import Joi from 'joi'
import { nodeSchema } from 'gatsby/dist/joi-schemas/joi'
import { isPlainObject } from 'lodash/fp'
import {
  CollectionNode,
  ProductNode,
  ProductVariantNode,
  __RewireAPI__ as RewireAPI,
} from '../nodes'
import server from './fixtures/server'
import { collectionsQuery, productsQuery } from '../queries'

const makeTypeName = RewireAPI.__GetDependency__('makeTypeName')

describe('CollectionNode', () => {
  let node

  beforeAll(async () => {
    const result = await server(collectionsQuery, { first: 1 })
    node = ProductNode(result.data.shop.collections.edges[0].node)
  })

  test('creates an object', () => {
    expect(isPlainObject(node)).toBe(true)
  })

  test.skip('is a valid node', () => {
    expect(Joi.validate(node, nodeSchema).error).toBe(null)
  })

  test('contains Shopify Collection fields when called with Collection', () => {
    expect(node).toMatchObject({
      description: expect.any(String),
      descriptionHtml: expect.any(String),
      handle: expect.any(String),
      id: expect.any(String),
      image: expect.objectContaining({
        altText: expect.any(String),
        id: expect.any(String),
        src: expect.any(String),
      }),
      title: expect.any(String),
      updatedAt: expect.any(String),
    })
  })
})

describe('ProductNode', () => {
  let node

  beforeAll(async () => {
    const result = await server(productsQuery, { first: 1 })
    node = ProductNode(result.data.shop.products.edges[0].node)
  })

  test('creates an object', () => {
    expect(isPlainObject(node)).toBe(true)
  })

  test.skip('is a valid node', () => {
    expect(Joi.validate(node, nodeSchema).error).toBe(null)
  })

  test('contains Shopify Product fields when called with Product', () => {
    expect(node).toMatchObject({
      createdAt: expect.any(String),
      description: expect.any(String),
      descriptionHtml: expect.any(String),
      handle: expect.any(String),
      onlineStoreUrl: expect.any(String),
      options: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          values: expect.arrayContaining([expect.any(String)]),
        }),
      ]),
      productType: expect.any(String),
      publishedAt: expect.any(String),
      tags: expect.arrayContaining([expect.any(String)]),
      title: expect.any(String),
      updatedAt: expect.any(String),
      vendor: expect.any(String),
    })
  })

  test('contains convenience fields when called with Product', () => {
    expect(node).toMatchObject({
      maxPrice: expect.any(String),
      minPrice: expect.any(String),
    })
  })
})

describe('ProductVariantNode', () => {
  let node

  beforeAll(async () => {
    const result = await server(productsQuery, { first: 1 })
    node = ProductVariantNode(
      result.data.shop.products.edges[0].node,
      result.data.shop.products.edges[0].node.variants.edges[0].node,
    )
  })

  test('creates an object', () => {
    expect(isPlainObject(node)).toBe(true)
  })

  test.skip('is a valid node', () => {
    expect(Joi.validate(node, nodeSchema).error).toBe(null)
  })

  test('contains Shopify ProductVariant fields when called with ProductVariant', () => {
    expect(node).toMatchObject({
      availableForSale: expect.any(Boolean),
      compareAtPrice: expect.any(String),
      id: expect.any(String),
      image: expect.objectContaining({
        altText: expect.any(String),
        id: expect.any(String),
        src: expect.any(String),
      }),
      price: expect.any(String),
      sku: expect.any(String),
      title: expect.any(String),
      weight: expect.any(Number),
      weightUnit: expect.any(String),
    })
  })
})
