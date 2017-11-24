# gatsby-source-shopify

Source plugin for pulling product data into Gatsby from a Shopify store.

**Note**: This is not a feature-complete source plugin. Please submit a pull request and/or open an issue for improvements you feel are necessary. Thanks!

## Install

`npm install --save gatsby-source-shopify`

## How to use

```javascript
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
  allProductNode {
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
