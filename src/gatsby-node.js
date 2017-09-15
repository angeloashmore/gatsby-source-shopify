import createGraphQLClient from 'graphql-client'

const createClient = (name, token) =>
  createGraphQLClient({
    url: `https://${name}.myshopify.com/api/graphql`,
    headers: {
      'X-Shopify-Storefront-Access-Token': token,
    },
  })

const formatGraphQLErrors = ({ messages, locations, paths }) => {
  const locs = locations.map(loc => Object.values(loc).join(':')).join(', ')
  return `${messages.join('\n')} at ${locs} (${paths.join(' > ')})`
}

const getProducts = async (client, first = 100, after, aggregatedResponse) => {
  const response = await client.query(
    `
    query GetProducts($first: Int!, $after: String) {
      shop {
        products(first: $first, after: $after) {
          pageInfo {
            hasNextPage
          }
          edges {
            cursor
            node {
              createdAt
              description
              descriptionHtml
              handle
              id
              onlineStoreUrl
              options {
                id
              }
              productType
              publishedAt
              tags
              title
              updatedAt
              vendor
            }
          }
        }
      }
    }
  `,
    {
      first,
      after,
    },
    (_req, res) => {
      if (res.status === 401) throw new Error('Not authorized')
    },
  )

  if (response.errors) throw new Error(formatGraphQLErrors(response.errors))

  const { edges } = response.data.shop.products
  const nodes = edges.map(edge => edge.node)

  aggregatedResponse
    ? (aggregatedResponse = aggregatedResponse.concat(nodes))
    : (aggregatedResponse = nodes)

  if (response.data.shop.products.pageInfo.hasNextPage)
    return getProducts(client, first, last(edges).cursor, aggregatedResponse)

  return aggregatedResponse
}

export const sourceNodes = async (
  { boundActionCreators: { createNode } },
  { name, token },
) => {
  const client = createClient(name, token)
  const products = await getProducts(client)
  products.forEach(createNode)
}
