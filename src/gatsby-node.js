import { GraphQLClient } from 'graphql-request'
import { pipe } from 'lodash/fp'
import chalk from 'chalk'
import prettyjson from 'prettyjson'
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

  const log = msg =>
    console.log(chalk`\n{blue [gatsby-source-shopify/${name}]} ${msg}`)

  try {
    await createArticles(client, createNode, log)
    await createBlogs(client, createNode, log)
    await createCollections(client, createNode, log)
    await createProductsAndChildren(client, createNode, log)
    await createShopPolicies(client, createNode, log)
  } catch (e) {
    console.error(chalk`\n{red error} an error occured while sourcing data`)

    if (!e.hasOwnProperty('request')) throw e

    const prettyjsonOptions = { keysColor: 'red', dashColor: 'red' }
    console.error(prettyjson.render(e.response.errors, prettyjsonOptions))
    console.error(prettyjson.render(e.request, prettyjsonOptions))
  }
}

const createArticles = async (client, createNode, log) => {
  log('fetching articles')
  const articles = await queryAll(client, ['shop', 'articles'], ARTICLES_QUERY)
  articles.forEach(
    pipe(
      ArticleNode,
      createNode,
    ),
  )
}

const createBlogs = async (client, createNode, log) => {
  log('fetching blogs')
  const blogs = await queryAll(client, ['shop', 'blogs'], BLOGS_QUERY)
  blogs.forEach(
    pipe(
      BlogNode,
      createNode,
    ),
  )
}

const createCollections = async (client, createNode, log) => {
  log('fetching collections')
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

const createProductsAndChildren = async (client, createNode, log) => {
  log('fetching products')
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

const createShopPolicies = async (client, createNode, log) => {
  log('fetching policies')
  const { shop: policies } = await queryOnce(client, SHOP_POLICIES_QUERY)
  Object.entries(policies).forEach(
    pipe(
      ([type, policy]) => ShopPolicyNode(policy, { type }),
      createNode,
    ),
  )
}
