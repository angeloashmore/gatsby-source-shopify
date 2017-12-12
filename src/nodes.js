import createNodeHelpers from 'gatsby-node-helpers'

const { createNodeFactory, generateNodeId } = createNodeHelpers({
  typePrefix: 'Shopify',
})

export const CollectionNode = createNodeFactory('Collection', node => {
  if (node.products) {
    node.children = node.products.edges.map(edge =>
      generateNodeId('Product', edge.node.id),
    )
    delete node.products
  }

  return node
})

export const ProductNode = createNodeFactory('Product', node => {
  if (node.variants) {
    const variants = node.variants.edges.map(edge => edge.node)
    const variantPrices = variants
      .map(variant => Number.parseFloat(variant.price))
      .filter(Boolean)

    node.minPrice = Math.min(...variantPrices, 0)
    node.maxPrice = Math.max(...variantPrices, 0)

    node.children = variants.map(variant =>
      generateNodeId('ProductVariant', variant.id),
    )

    delete node.variants
  }

  return node
})

export const ProductVariantNode = createNodeFactory('ProductVariant', node => {
  node.price = Number.parseFloat(node.price)

  return node
})
