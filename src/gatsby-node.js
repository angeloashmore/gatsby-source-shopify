import createGraphQLClient from 'graphql-client'
import { partial, pipe } from 'lodash/fp'
import { queryAll } from './lib'
import { CollectionNode, ProductNode, ProductVariantNode } from './nodes'
import { collectionsQuery, productsQuery } from './queries'

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

  const collections = await queryAll(
    client,
    ['shop', 'collections'],
    collectionsQuery,
  )
  collections.forEach(pipe(CollectionNode, createNode))

  const products = await queryAll(client, ['shop', 'products'], productsQuery)
  products.forEach(product => {
    const productNode = ProductNode(product)

    product.variants.edges.forEach(variant => {
      const variantNode = ProductVariantNode(productNode, variant.node)
      createNode(variantNode)
      productNode.children.push(variantNode.id)
    })

    createNode(productNode)
  })
}
