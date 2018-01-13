# gatsby-source-shopify

Source plugin for pulling product data into [Gatsby][gatsby] from a
[Shopify][shopify] store.

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

Utilize Gatsby's built-in [GraphiQL IDE][graphiql-intro] to explore the node schemas available.

By default, this is at `http://localhost:8000/___graphql`

## List of implemented nodes

| Name                 | Description                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `ArticleNode`        | A blog entry.                                                                                                         |
| `BlogNode`           | Collection of articles.                                                                                               |
| `CollectionNode`     | Represents a grouping of products that a shop owner can create to organize them or make their shops easier to browse. |
| `ProductNode`        | Represents an individual item for sale in a Shopify store.                                                            |
| `ProductOptionNode`  | Custom product property names.                                                                                        |
| `ProductVariantNode` | Represents a different version of a product, such as differing sizes or differing colors.                             |
| `ShopPolicyNode`     | Policy that a merchant has configured for their store, such as their refund or privacy policy.                        |

## A note on customer information

Not all Shopify nodes have been implemented as they are not necessary for the
static portion of a Gatsby-generated website. This includes any node that
contains sensitive customer-specific information, such as `Order` and
`Payment`.

If you are in need of this data (e.g. building a private, internal website),
please open an issue. Until then, the nodes will not be implemented to lessen
the chances of someone accidentally making private information publicly
available.

[gatsby]: https://gatsby.org
[shopify]: https://shopify.com
[graphiql-intro]: https://medium.com/the-graphqlhub/graphiql-graphql-s-killer-app-9896242b2125
