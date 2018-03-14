import createGraphQLClient from 'graphql-client'
import { pipe } from 'lodash/fp'
import { queryOnce, queryAll } from './lib'
import {
  ArticleNode,
  BlogNode,
  CollectionNode,
  ProductNode,
  ProductOptionNode,
  ProductVariantNode,
  ProductImageNode,
  ShopPolicyNode,
} from './nodes'
import {
  articlesQuery,
  blogsQuery,
  collectionsQuery,
  productsQuery,
  shopPoliciesQuery,
} from './queries'

export const sourceNodes = async (
  { boundActionCreators: { createNode } },
  { name, token },
) => {
  const client = createGraphQLClient({
    url: `https://${name}.myshopify.com/api/graphql`,
    headers: {
      'X-Shopify-Storefront-Access-Token': token,
    },
  })

  // Call the create function, each with their own fetching. Individual
  // fetching is required as some nodes require multiple paginated requests.
  await createArticles(client, createNode)
  await createBlogs(client, createNode)
  await createCollections(client, createNode)
  await createProductsAndChildren(client, createNode)
  await createShopPolicies(client, createNode)
}

/**
 * Query storefront for Article objects and create ArticleNodes.
 */
async function createArticles(client, createNode) {
  const articles = await queryAll(client, ['shop', 'articles'], articlesQuery)

  articles.forEach(pipe(ArticleNode, createNode))
}

/**
 * Query storefront for Blog objects and create BlogNodes.
 */
async function createBlogs(client, createNode) {
  const blogs = await queryAll(client, ['shop', 'blogs'], blogsQuery)

  blogs.forEach(pipe(BlogNode, createNode))
}

/**
 * Query storefront for Collection objects and create CollectionNodes.
 */
async function createCollections(client, createNode) {
  const collections = await queryAll(
    client,
    ['shop', 'collections'],
    collectionsQuery,
  )

  collections.forEach(pipe(CollectionNode, createNode))
}

/**
 * Query storefront for Product objects and their associated ProductOptions and
 * ProductVariants and create their nodes.
 *
 * ProductNodes, ProductOptions, ProductVariantNodes have parent-child links.
 */
async function createProductsAndChildren(client, createNode) {
  const products = await queryAll(client, ['shop', 'products'], productsQuery)

  products.forEach(product => {
    const productNode = ProductNode(product)
    createNode(productNode)

    // Create child ProductVariant nodes.
    product.variants.edges.forEach(
      pipe(
        edge => ProductVariantNode(edge.node, { parent: productNode.id }),
        createNode,
      ),
    )

    // Create child ProductOptions nodes.
    product.options.forEach(
      pipe(
        option => ProductOptionNode(option, { parent: productNode.id }),
        createNode,
      ),
    )

    product.images.edges.forEach(
      pipe(
        edge => ProductImageNode(edge.node, { parent: productNode.id }),
        createNode
      ),
    )
  })
}

/**
 * Query storefront for ShopPolicy objects and create ShopPolicyNodes.
 */
async function createShopPolicies(client, createNode) {
  const policies = await queryOnce(client, shopPoliciesQuery)

  Object.entries(policies).forEach(
    pipe(([type, policy]) => ShopPolicyNode(policy, { type }), createNode),
  )
}
