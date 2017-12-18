import { tap } from 'lodash/fp'
import createNodeHelpers from 'gatsby-node-helpers'

// General node prefix
const TYPE_PREFIX = 'Shopify'

// Node types
const COLLECTION = 'Collection'
const PRODUCT = 'Product'
const PRODUCT_VARIANT = 'ProductVariant'
const SHOP_POLICY = 'ShopPolicy'

// Create Gatsby node helpers.
const { createNodeFactory, generateNodeId } = createNodeHelpers({
  typePrefix: TYPE_PREFIX,
})

/**
 * CollectionNode
 *
 * Represents a grouping of products that a shop owner can create to organize
 * them or make their shops easier to browse.
 */
export const CollectionNode = createNodeFactory(
  COLLECTION,
  tap(node => {
    if (node.products) {
      node.children = node.products.edges.map(edge =>
        generateNodeId(PRODUCT, edge.node.id),
      )

      delete node.products
    }
  }),
)

/**
 * ProductNode
 *
 * Represents an individual item for sale in a Shopify store.
 */
export const ProductNode = createNodeFactory(
  PRODUCT,
  tap(node => {
    if (node.variants) {
      const variants = node.variants.edges.map(edge => edge.node)
      const variantPrices = variants
        .map(variant => Number.parseFloat(variant.price))
        .filter(Boolean)

      node.minPrice = Math.min(...variantPrices, 0)
      node.maxPrice = Math.max(...variantPrices, 0)

      node.children = variants.map(variant =>
        generateNodeId(PRODUCT_VARIANT, variant.id),
      )

      delete node.variants
    }
  }),
)

/**
 * ProductVariantNode
 *
 * Represents a different version of a product, such as differing sizes or
 * differing colors.
 */
export const ProductVariantNode = createNodeFactory(
  PRODUCT_VARIANT,
  tap(node => (node.price = Number.parseFloat(node.price))),
)

/**
 * ShopPolicyNode
 *
 * Policy that a merchant has configured for their store, such as their refund
 * or privacy policy.
 */
export const ShopPolicyNode = createNodeFactory(SHOP_POLICY)
