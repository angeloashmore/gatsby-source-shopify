# gatsby-source-shopify

Source plugin for pulling product data into Gatsby from a Shopify store.

**Note**: This is not a feature-complete source plugin. Please submit a pull
request and/or open an issue for improvements you feel are necessary. Thanks!

## Install

```sh
npm install --save gatsby-source-shopify
```

## How to use

Add the following plugin config to your `gatsby-config.js` file.

```js
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-shopify`,
    options: {
      name: `your_shop_name`,
      token: `your_access_token`,
    },
  },
]
```

## How to query

You can query nodes created from Shopify like the following:

```graphql
{
  allShopifyProductNode {
    edges {
      node {
        id
        title
      }
    }
  }
}
```

Utilize Gatsby's built-in GraphiQL IDE to explore the node schemas available.

## List of implemented nodes

| Name                 | Description                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `CollectionNode`     | Represents a grouping of products that a shop owner can create to organize them or make their shops easier to browse. |
| `ProductNode`        | Represents an individual item for sale in a Shopify store.                                                            |
| `ProductOptionNode`  | Custom product property names.                                                                                        |
| `ProductVariantNode` | Represents a different version of a product, such as differing sizes or differing colors.                             |
| `ShopPolicyNode`     | Policy that a merchant has configured for their store, such as their refund or privacy policy.                        |
