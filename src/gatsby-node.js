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

const createCollections = async (client, createNode) => {
  const collections = await queryAll(
    client,
    ['shop', 'collections'],
    collectionsQuery,
  )

  collections.forEach(pipe(CollectionNode, createNode))
}

const createProducts = async (client, createNode) => {
  const products = await queryAll(client, ['shop', 'products'], productsQuery)

  products.forEach(product => {
    const productNode = ProductNode(product)
    createNode(productNode)

    product.variants.edges.forEach(edge => {
      const productVariant = edge.node
      const productVariantNode = ProductVariantNode(productVariant, {
        parent: productNode.id,
      })
      createNode(productVariantNode)
    })
  })
}

export const sourceNodes = async (
  { boundActionCreators: { createNode } },
  { name, token },
) => {
  const client = createClient(name, token)

  await createCollections(client, createNode)
  await createProducts(client, createNode)
}
