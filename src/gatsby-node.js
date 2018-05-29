import { GraphQLClient } from 'graphql-request'
import { pipe } from 'lodash/fp'
import { queryAll, queryOnce } from './lib'
import {
  ArticleNode,
  BlogNode,
  CollectionNode,
  ProductNode,
  ProductOptionNode,
  ProductVariantNode,
  ShopPolicyNode,
} from './nodes'
import {
  ARTICLES_QUERY,
  BLOGS_QUERY,
  COLLECTIONS_QUERY,
  PRODUCTS_QUERY,
  SHOP_POLICIES_QUERY,
} from './queries'

export const sourceNodes = async (gatsby, options) => {
  const {
    boundActionCreators: { createNode },
  } = gatsby
  const { name, token } = options

  const client = new GraphQLClient(
    `https://${name}.myshopify.com/api/graphql`,
    {
      headers: {
        'X-Shopify-Storefront-Access-Token': token,
      },
    },
  )

  await createArticles(client, createNode)
  await createBlogs(client, createNode)
  await createCollections(client, createNode)
  await createProductsAndChildren(client, createNode)
  await createShopPolicies(client, createNode)
}

const createArticles = async (client, createNode) => {
  const articles = await queryAll(client, ['shop', 'articles'], ARTICLES_QUERY)
  articles.forEach(
    pipe(
      ArticleNode,
      createNode,
    ),
  )
}

const createBlogs = async (client, createNode) => {
  const blogs = await queryAll(client, ['shop', 'blogs'], BLOGS_QUERY)
  blogs.forEach(
    pipe(
      BlogNode,
      createNode,
    ),
  )
}

const createCollections = async (client, createNode) => {
  const collections = await queryAll(
    client,
    ['shop', 'collections'],
    COLLECTIONS_QUERY,
  )
  collections.forEach(
    pipe(
      CollectionNode,
      createNode,
    ),
  )
}

const createProductsAndChildren = async (client, createNode) => {
  const products = await queryAll(client, ['shop', 'products'], PRODUCTS_QUERY)
  products.forEach(product => {
    createNode(ProductNode(product))

    product.variants.edges.forEach(
      pipe(
        edge => ProductVariantNode(edge.node),
        createNode,
      ),
    )

    product.options.forEach(
      pipe(
        ProductOptionNode,
        createNode,
      ),
    )
  })
}

const createShopPolicies = async (client, createNode) => {
  const { shop: policies } = await queryOnce(client, SHOP_POLICIES_QUERY)
  Object.entries(policies).forEach(
    pipe(
      ([type, policy]) => ShopPolicyNode(policy, { type }),
      createNode,
    ),
  )
}
