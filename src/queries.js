export const articlesQuery = `
  query GetArticles($first: Int!, $after: String) {
    shop {
      articles(first: $first, after: $after) {
        pageInfo {
          hasNextPage
        }
        edges {
          cursor
          node {
            blog {
              id
            }
            content
            contentHtml
            excerpt
            excerptHtml
            id
            image {
              altText
              id
              src
            }
            publishedAt
            tags
            title
            url
          }
        }
      }
    }
  }
`

export const collectionsQuery = `
  query GetCollections($first: Int!, $after: String) {
    shop {
      collections(first: $first, after: $after) {
        pageInfo {
          hasNextPage
        }
        edges {
          cursor
          node {
            description
            descriptionHtml
            handle
            id
            image {
              altText
              id
              src
            }
            products(first: 250) {
              edges {
                node {
                  id
                }
              }
            }
            title
            updatedAt
          }
        }
      }
    }
  }
`

export const blogsQuery = `
  query GetBlogs($first: Int!, $after: String) {
    shop {
      blogs(first: $first, after: $after) {
        pageInfo {
          hasNextPage
        }
        edges {
          cursor
          node {
            id
            title
            url
          }
        }
      }
    }
  }
`

export const productsQuery = `
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
              name
              values
            }
            productType
            publishedAt
            tags
            title
            updatedAt
            variants(first: 250) {
              edges {
                node {
                  availableForSale
                  compareAtPrice
                  id
                  image {
                    altText
                    id
                    src
                  }
                  price
                  sku
                  title
                  weight
                  weightUnit
                }
              }
            }
            vendor
          }
        }
      }
    }
  }
`

export const shopPoliciesQuery = `
  query GetPolicies {
    shop {
      privacyPolicy {
        body
        id
        title
        url
      }
      refundPolicy {
        body
        id
        title
        url
      }
      termsOfService {
        body
        id
        title
        url
      }
    }
  }
`
