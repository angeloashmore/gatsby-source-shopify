import createNodeHelpers from 'gatsby-node-helpers'
import { tap, camelCase } from 'lodash/fp'
import { map } from 'p-iteration'
import { createRemoteFileNode } from 'gatsby-source-filesystem'
import crypto from 'crypto'

// Node prefix
const TYPE_PREFIX = 'Shopify'

// Node types
const ARTICLE = 'Article'
const BLOG = 'Blog'
const COLLECTION = 'Collection'
const COMMENT = 'Comment'
const PRODUCT = 'Product'
const PRODUCT_OPTION = 'ProductOption'
const PRODUCT_VARIANT = 'ProductVariant'
const SHOP_POLICY = 'ShopPolicy'
const PRODUCT_TYPE = 'ProductType'
const {
  createNodeFactory,
  generateNodeId,
  generateTypeName,
} = createNodeHelpers({
  typePrefix: TYPE_PREFIX,
})

const downloadImageAndCreateFileNode = async (
  { id, url },
  { createNode, createNodeId, touchNode, store, cache },
) => {
  let fileNodeID

  const mediaDataCacheKey = `${TYPE_PREFIX}__Media__${url}`
  const cacheMediaData = await cache.get(mediaDataCacheKey)

  if (cacheMediaData) {
    fileNodeID = cacheMediaData.fileNodeID
    touchNode({ nodeId: fileNodeID })
    return fileNodeID
  }

  const fileNode = await createRemoteFileNode({
    url,
    store,
    cache,
    createNode,
    createNodeId,
  })

  if (fileNode) {
    fileNodeID = fileNode.id
    await cache.set(mediaDataCacheKey, { fileNodeID })
    return fileNodeID
  }

  return undefined
}

export const ArticleNode = imageArgs =>
  createNodeFactory(ARTICLE, async node => {
    if (node.blog) node.blog___NODE = generateNodeId(BLOG, node.blog.id)

    if (node.comments)
      node.comments___NODE = node.comments.edges.map(edge =>
        generateNodeId(COMMENT, edge.node.id),
      )

    if (node.image)
      node.image.localFile___NODE = await downloadImageAndCreateFileNode(
        { id: node.image.id, url: node.image.src },
        imageArgs,
      )

    return node
  })

export const BlogNode = _imageArgs => createNodeFactory(BLOG)

export const CollectionNode = imageArgs =>
  createNodeFactory(COLLECTION, async node => {
    if (node.products)
      node.products___NODE = node.products.edges.map(edge =>
        generateNodeId(PRODUCT, edge.node.id),
      )

    if (node.image)
      node.image.localFile___NODE = await downloadImageAndCreateFileNode(
        {
          id: node.image.id,
          url: node.image.src && node.image.src.split('?')[0],
        },
        imageArgs,
      )
    return node
  })

export const CommentNode = _imageArgs => createNodeFactory(COMMENT)

export const ProductTypeNode = imageArgs => rawNode =>
  createNodeFactory(PRODUCT_TYPE)({ id: camelCase(rawNode), name: rawNode })

export const ProductNode = imageArgs =>
  createNodeFactory(PRODUCT, async node => {
    if (node.variants) {
      const variants = node.variants.edges.map(edge => edge.node)

      node.variants___NODE = variants.map(variant =>
        generateNodeId(PRODUCT_VARIANT, variant.id),
      )
    }

    if (node.options)
      node.options___NODE = node.options.map(option =>
        generateNodeId(PRODUCT_OPTION, option.id),
      )

    if (node.images && node.images.edges)
      node.images = await map(node.images.edges, async edge => {
        edge.node.localFile___NODE = await downloadImageAndCreateFileNode(
          {
            id: edge.node.id,
            url: edge.node.originalSrc && edge.node.originalSrc.split('?')[0],
          },
          imageArgs,
        )
        return edge.node
      })

    return node
  })

export const ProductOptionNode = _imageArgs => createNodeFactory(PRODUCT_OPTION)

export const ProductVariantNode = imageArgs =>
  createNodeFactory(PRODUCT_VARIANT, async node => {
    if (node.image)
      node.image.localFile___NODE = await downloadImageAndCreateFileNode(
        {
          id: node.image.id,
          url: node.image.originalSrc && node.image.originalSrc.split('?')[0],
        },
        imageArgs,
      )

    return node
  })

export const ShopPolicyNode = createNodeFactory(SHOP_POLICY)
