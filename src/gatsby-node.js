import { pipe } from 'lodash/fp'
import chalk from 'chalk'
import { forEach } from 'p-iteration'
import { createClient, printGraphQLError, queryAll, queryOnce } from './lib'
import {
  ArticleNode,
  BlogNode,
  CollectionNode,
  CommentNode,
  ProductNode,
  ProductOptionNode,
  ProductVariantNode,
  ShopPolicyNode,
  ProductTypeNode,
} from './nodes'
import {
  ARTICLES_QUERY,
  BLOGS_QUERY,
  COLLECTIONS_QUERY,
  PRODUCTS_QUERY,
  SHOP_POLICIES_QUERY,
  PRODUCT_TYPES_QUERY,
} from './queries'

export const sourceNodes = async (
  {
    boundActionCreators: { createNode, touchNode, createNodeId },
    store,
    cache,
  },
  { shopName, accessToken, verbose = true },
) => {
  const client = createClient(shopName, accessToken)

  // Convenience function to namespace console messages.
  const formatMsg = msg =>
    chalk`\n{blue gatsby-source-shopify/${shopName}} ${msg}`

  try {
    console.log(formatMsg('starting to fetch data from Shopify'))

    // Arguments used for file node creation.
    const imageArgs = { createNode, createNodeId, touchNode, store, cache }

    // Arguments used for node creation.
    const args = {
      client,
      createNode,
      createNodeId,
      formatMsg,
      verbose,
      imageArgs,
    }

    // Message printed when fetching is complete.
    const msg = formatMsg('finished fetching data from Shopify')

    console.time(msg)
    await Promise.all([
      createNodes('articles', ARTICLES_QUERY, ArticleNode, args, async x => {
        if (x.comments)
          await forEach(x.comments.edges, async edge =>
            createNode(await CommentNode(imageArgs)(edge.node)),
          )
      }),
      createNodes('blogs', BLOGS_QUERY, BlogNode, args),
      createNodes('collections', COLLECTIONS_QUERY, CollectionNode, args),
      createNodes('productTypes', PRODUCT_TYPES_QUERY, ProductTypeNode, args),
      createNodes('products', PRODUCTS_QUERY, ProductNode, args, async x => {
        if (x.variants)
          await forEach(x.variants.edges, async edge =>
            createNode(await ProductVariantNode(imageArgs)(edge.node)),
          )

        if (x.options)
          await forEach(x.options, async option =>
            createNode(await ProductOptionNode(imageArgs)(option)),
          )
      }),
      createShopPolicies(args),
    ])
    console.timeEnd(msg)
  } catch (e) {
    console.error(chalk`\n{red error} an error occured while sourcing data`)

    // If not a GraphQL request error, let Gatsby print the error.
    if (!e.hasOwnProperty('request')) throw e

    printGraphQLError(e)
  }
}

/**
 * Fetch and create nodes for the provided endpoint, query, and node factory.
 */
const createNodes = async (
  endpoint,
  query,
  nodeFactory,
  { client, createNode, formatMsg, verbose, imageArgs },
  f = async () => {},
) => {
  // Message printed when fetching is complete.
  const msg = formatMsg(`fetched and processed ${endpoint}`)

  if (verbose) console.time(msg)
  await forEach(
    await queryAll(client, ['shop', endpoint], query),
    async entity => {
      const node = await nodeFactory(imageArgs)(entity)
      createNode(node)
      await f(entity)
    },
  )
  if (verbose) console.timeEnd(msg)
}

/**
 * Fetch and create nodes for shop policies.
 */
const createShopPolicies = async ({
  client,
  createNode,
  formatMsg,
  verbose,
}) => {
  // Message printed when fetching is complete.
  const msg = formatMsg('fetched and processed policies')

  if (verbose) console.time(msg)
  const { shop: policies } = await queryOnce(client, SHOP_POLICIES_QUERY)
  Object.entries(policies)
    .filter(([_, policy]) => Boolean(policy))
    .forEach(
      pipe(
        ([type, policy]) => ShopPolicyNode(policy, { type }),
        createNode,
      ),
    )
  if (verbose) console.timeEnd(msg)
}
