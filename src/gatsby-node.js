import createGraphQLClient from 'graphql-client'
import { queryAll } from './lib'
import { ProductNode } from './nodes'

const createClient = (name, token) =>
  createGraphQLClient({
    url: `https://${name}.myshopify.com/api/graphql`,
    headers: {
      'X-Shopify-Storefront-Access-Token': token,
    },
  })

export const sourceNodes = async (
  { boundActionCreators: { createNode } },
  { name, token },
) => {
  const client = createClient(name, token)
  const products = await queryAll(
    client,
    ['shop', 'products'],
    `
    query GetProducts($first: Int!, $after: String) {
      shop {
        products(first: $first, after: $after) {
          pageInfo {
            hasNextPage
          }
          edges {
            cursor
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
  `,
  )
  products.forEach(product => createNode(ProductNode(product)))
}
