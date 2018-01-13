import Joi from 'joi'
import { nodeSchema } from 'gatsby/dist/joi-schemas/joi'
import { isPlainObject } from 'lodash/fp'
import {
  ArticleNode,
  BlogNode,
  CollectionNode,
  ProductNode,
  ProductOptionNode,
  ProductVariantNode,
  ShopPolicyNode,
  __RewireAPI__ as RewireAPI,
} from '../nodes'
import server from './fixtures/server'
import {
  articlesQuery,
  blogsQuery,
  collectionsQuery,
  productsQuery,
  shopPoliciesQuery,
} from '../queries'

const generateNodeId = RewireAPI.__GetDependency__('generateNodeId')

const NODE_OWNER = 'owner'

/**
 * ArticleNode
 */
describe('ArticleNode', () => {
  let node

  beforeAll(async () => {
    const result = await server(articlesQuery, { first: 1 })
    node = ArticleNode(result.data.shop.articles.edges[0].node)
    node.internal.owner = NODE_OWNER
  })

  test('creates an object', () => {
    expect(isPlainObject(node)).toBe(true)
  })

  test('is a valid node', () => {
    expect(Joi.validate(node, nodeSchema).error).toBe(null)
  })

  test('contains Shopify Article fields when called with Article', () => {
    expect(node).toMatchObject({
      content: expect.any(String),
      contentHtml: expect.any(String),
      excerpt: expect.any(String),
      excerptHtml: expect.any(String),
      id: expect.any(String),
      image: expect.objectContaining({
        altText: expect.any(String),
        id: expect.any(String),
        src: expect.any(String),
      }),
      publishedAt: expect.any(String),
      tags: expect.arrayContaining([expect.any(String)]),
      title: expect.any(String),
      url: expect.any(String),
    })
  })
})

/**
 * BlogNode
 */
describe('BlogNode', () => {
  let node

  beforeAll(async () => {
    const result = await server(blogsQuery, { first: 1 })
    node = BlogNode(result.data.shop.blogs.edges[0].node)
    node.internal.owner = NODE_OWNER
  })

  test('creates an object', () => {
    expect(isPlainObject(node)).toBe(true)
  })

  test('is a valid node', () => {
    expect(Joi.validate(node, nodeSchema).error).toBe(null)
  })

  test('contains Shopify Blog fields when called with Blog', () => {
    expect(node).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      url: expect.any(String),
    })
  })
})

/**
 * CollectionNode
 */
describe('CollectionNode', () => {
  let node

  beforeAll(async () => {
    const result = await server(collectionsQuery, { first: 1 })
    node = CollectionNode(result.data.shop.collections.edges[0].node)
    node.internal.owner = NODE_OWNER
  })

  test('creates an object', () => {
    expect(isPlainObject(node)).toBe(true)
  })

  test('is a valid node', () => {
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

/**
 * ProductNode
 */
describe('ProductNode', () => {
  let node

  beforeAll(async () => {
    const result = await server(productsQuery, { first: 1 })
    node = ProductNode(result.data.shop.products.edges[0].node)
    node.internal.owner = NODE_OWNER
  })

  test('creates an object', () => {
    expect(isPlainObject(node)).toBe(true)
  })

  test('is a valid node', () => {
    expect(Joi.validate(node, nodeSchema).error).toBe(null)
  })

  test('contains Shopify Product fields when called with Product', () => {
    expect(node).toMatchObject({
      createdAt: expect.any(String),
      description: expect.any(String),
      descriptionHtml: expect.any(String),
      handle: expect.any(String),
      onlineStoreUrl: expect.any(String),
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
      maxPrice: expect.any(Number),
      minPrice: expect.any(Number),
    })
  })
})

/**
 * ProductOptionNode
 */
describe('ProductOptionNode', () => {
  let node

  beforeAll(async () => {
    const result = await server(productsQuery, { first: 1 })
    node = ProductOptionNode(
      result.data.shop.products.edges[0].node.options[0],
      {
        parent: generateNodeId(
          'Product',
          result.data.shop.products.edges[0].node.id,
        ),
      },
    )
    node.internal.owner = NODE_OWNER
  })

  test('creates an object', () => {
    expect(isPlainObject(node)).toBe(true)
  })

  test('is a valid node', () => {
    expect(Joi.validate(node, nodeSchema).error).toBe(null)
  })

  test('contains Shopify ProductOption fields when called with ProductOption', () => {
    expect(node).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      values: expect.arrayContaining([expect.any(String)]),
    })
  })
})

/**
 * ProductVariantNode
 */
describe('ProductVariantNode', () => {
  let node

  beforeAll(async () => {
    const result = await server(productsQuery, { first: 1 })
    node = ProductVariantNode(
      result.data.shop.products.edges[0].node.variants.edges[0].node,
      {
        parent: generateNodeId(
          'Product',
          result.data.shop.products.edges[0].node.id,
        ),
      },
    )
    node.internal.owner = NODE_OWNER
  })

  test('creates an object', () => {
    expect(isPlainObject(node)).toBe(true)
  })

  test('is a valid node', () => {
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
      price: expect.any(Number),
      sku: expect.any(String),
      title: expect.any(String),
      weight: expect.any(Number),
      weightUnit: expect.any(String),
    })
  })
})

/**
 * ShopPolicy
 */
describe('ShopPolicy', () => {
  let node

  beforeAll(async () => {
    const result = await server(shopPoliciesQuery)
    node = ShopPolicyNode(result.data.shop.privacyPolicy, {
      type: 'privacyPolicy',
    })
    node.internal.owner = NODE_OWNER
  })

  test('creates an object', () => {
    expect(isPlainObject(node)).toBe(true)
  })

  test('is a valid node', () => {
    expect(Joi.validate(node, nodeSchema).error).toBe(null)
  })

  test('contains Shopify ShopPolicy fields when called with ShopPolicy', () => {
    expect(node).toMatchObject({
      body: expect.any(String),
      id: expect.any(String),
      title: expect.any(String),
      url: expect.any(String),
    })
  })

  test('contains convenience fields when called with ShopPolicy', () => {
    expect(node).toMatchObject({
      type: expect.any(String),
    })
  })
})
