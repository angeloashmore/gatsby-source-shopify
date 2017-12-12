import createGraphQLClient from 'graphql-client'
import { partial, pipe } from 'lodash/fp'
import { queryOnce, queryAll } from './lib'
import { CollectionNode, ProductNode, ProductVariantNode, ShopPolicyNode } from './nodes'
import { collectionsQuery, productsQuery, policiesQuery } from './queries'

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

    product.variants.edges.forEach(
      pipe(
        edge => ProductVariantNode(edge.node, { parent: productNode.id }),
        createNode,
      ),
    )
  })
}

const createShopPolicies = async (client, createNode) => {
  const policies = await queryOnce(
    client,
    policiesQuery,
  )

  Object.entries(policies).forEach(
    pipe(
      ([type, policy]) => ShopPolicyNode(policy, { type }),
      createNode
    )
  )
}

export const sourceNodes = async (
  { boundActionCreators: { createNode } },
  { name, token },
) => {
  const client = createClient(name, token)

  await createCollections(client, createNode)
  await createProducts(client, createNode)
  await createShopPolicies(client, createNode)
}
