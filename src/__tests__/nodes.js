import { ProductNode, __RewireAPI__ as RewireAPI } from '../nodes'
import server from './fixtures/server'

const makeTypeName = RewireAPI.__GetDependency__('makeTypeName')

describe('ProductNode', () => {
  let product

  beforeAll(async () => {
    const result = await server(`
      {
        shop {
          products(first: 1) {
            edges {
              node {
                createdAt
                description
                descriptionHtml
                handle
                id
                onlineStoreUrl
                options {
                  id
                }
                productType
                publishedAt
                tags
                title
                updatedAt
                vendor
              }
            }
          }
        }
      }
    `)

    product = result.data.shop.products.edges[0].node
  })

  test('creates an object', () => {
    expect(typeof ProductNode(product)).toBe('object')
  })

  test('contains the minimal Gatsby properties', () => {
    expect(ProductNode(product)).toMatchObject({
      id: expect.any(String),
      parent: expect.any(String),
      children: expect.any(Array),
      fields: expect.any(Object),
      internal: expect.objectContaining({
        contentDigest: expect.any(String),
        type: expect.any(String),
        owner: expect.any(String),
        fieldOwners: expect.any(Object),
      }),
    })
  })

  test('contains Shopify Product fields', () => {
    expect(ProductNode(product)).toMatchObject({
      createdAt: expect.any(String),
      description: expect.any(String),
      descriptionHtml: expect.any(String),
      handle: expect.any(String),
      onlineStoreUrl: expect.any(String),
      options: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
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
})
