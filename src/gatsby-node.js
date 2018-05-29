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
  const { name, token, verbose = true } = options

  const endpoint = `https://${name}.myshopify.com/api/graphql`
  const headers = { 'X-Shopify-Storefront-Access-Token': token }
  const client = new GraphQLClient(endpoint, { headers })

  const formatMsg = msg => chalk`\n{blue gatsby-source-shopify/${name}} ${msg}`

  try {
    console.log(formatMsg('starting to fetch data from Shopify'))
    const msg = formatMsg('finished fetching data from Shopify')
    const args = [client, createNode, formatMsg, verbose]
    console.time(msg)
    await Promise.all([
      createArticles(...args),
      createBlogs(...args),
      createCollections(...args),
      createProductsAndChildren(...args),
      createShopPolicies(...args),
    ])
    console.timeEnd(msg)
  } catch (e) {
    console.error(chalk`\n{red error} an error occured while sourcing data`)

    if (!e.hasOwnProperty('request')) throw e

    const prettyjsonOptions = { keysColor: 'red', dashColor: 'red' }
    console.error(prettyjson.render(e.response.errors, prettyjsonOptions))
    console.error(prettyjson.render(e.request, prettyjsonOptions))
  }
}

const createArticles = async (client, createNode, formatMsg, verbose) => {
  const msg = formatMsg('fetched and processed articles')

  if (verbose) console.time(msg)
  const articles = await queryAll(client, ['shop', 'articles'], ARTICLES_QUERY)
  articles.forEach(
    pipe(
      ArticleNode,
      createNode,
    ),
  )
  if (verbose) console.timeEnd(msg)
}

const createBlogs = async (client, createNode, formatMsg, verbose) => {
  const msg = formatMsg('fetched and processed blogs')

  if (verbose) console.time(msg)
  const blogs = await queryAll(client, ['shop', 'blogs'], BLOGS_QUERY)
  blogs.forEach(
    pipe(
      BlogNode,
      createNode,
    ),
  )
  if (verbose) console.timeEnd(msg)
}

const createCollections = async (client, createNode, formatMsg, verbose) => {
  const msg = formatMsg('fetched and processed collections')

  if (verbose) console.time(msg)
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
  if (verbose) console.timeEnd(msg)
}

const createProductsAndChildren = async (
  client,
  createNode,
  formatMsg,
  verbose,
) => {
  const msg = formatMsg('fetched and processed products')

  if (verbose) console.time(msg)
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
  if (verbose) console.timeEnd(msg)
}

const createShopPolicies = async (client, createNode, formatMsg, verbose) => {
  const msg = formatMsg('fetched and processed policies')

  if (verbose) console.time(msg)
  const { shop: policies } = await queryOnce(client, SHOP_POLICIES_QUERY)
  Object.entries(policies).forEach(
    pipe(
      ([type, policy]) => ShopPolicyNode(policy, { type }),
      createNode,
    ),
  )
  if (verbose) console.timeEnd(msg)
}
