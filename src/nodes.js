import createNodeHelpers from 'gatsby-node-helpers'
import { tap } from 'lodash/fp'

// Node prefix
const TYPE_PREFIX = 'Shopify'

// Node types
const ARTICLE = 'Article'
const BLOG = 'Blog'
const COLLECTION = 'Collection'
const PRODUCT = 'Product'
const PRODUCT_OPTION = 'ProductOption'
const PRODUCT_VARIANT = 'ProductVariant'
const SHOP_POLICY = 'ShopPolicy'

const { createNodeFactory, generateNodeId } = createNodeHelpers({
  typePrefix: TYPE_PREFIX,
})

export const ArticleNode = createNodeFactory(
  ARTICLE,
  tap(node => {
    if (node.blog) node.blog___NODE = generateNodeId(BLOG, node.blog.id)
  }),
)

export const BlogNode = createNodeFactory(BLOG)

export const CollectionNode = createNodeFactory(
  COLLECTION,
  tap(node => {
    if (node.products)
      node.products___NODE = node.products.edges.map(edge =>
        generateNodeId(PRODUCT, edge.node.id),
      )
  }),
)

export const ProductNode = createNodeFactory(
  PRODUCT,
  tap(node => {
    if (node.variants) {
      const variants = node.variants.edges.map(edge => edge.node)

      node.variants___NODE = variants.map(variant =>
        generateNodeId(PRODUCT_VARIANT, variant.id),
      )

      const variantPrices = variants
        .map(variant => Number.parseFloat(variant.price))
        .filter(Boolean)

      node.extras = {
        minPrice: variantPrices.length ? Math.min(...variantPrices) : 0,
        maxPrice: variantPrices.length ? Math.max(...variantPrices) : 0,
      }
    }

    if (node.options)
      node.options___NODE = node.options.map(option =>
        generateNodeId(PRODUCT_OPTION, option.id),
      )
  }),
)

export const ProductOptionNode = createNodeFactory(PRODUCT_OPTION)

export const ProductVariantNode = createNodeFactory(PRODUCT_VARIANT)

export const ShopPolicyNode = createNodeFactory(SHOP_POLICY)
