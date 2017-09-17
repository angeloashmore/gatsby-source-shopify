import { get, last } from 'lodash/fp'

export const formatGraphQLError = ({ message, locations, paths }) => {
  const locs = locations.map(loc => Object.values(loc).join(':')).join(', ')
  return `${message} at ${locs} (${paths.join(' > ')})`
}

export const queryAll = async (
  client,
  path,
  query,
  first = 100,
  after,
  aggregatedResponse,
) => {
  const { data, errors } = await client.query(
    query,
    { first, after },
    (_req, res) => {
      if (res.status === 401) throw new Error('Not authorized')
    },
  )

  if (errors) throw new Error(formatGraphQLError(errors[0]))

  const edges = get([...path, 'edges'], data)
  const nodes = edges.map(edge => edge.node)

  aggregatedResponse
    ? (aggregatedResponse = aggregatedResponse.concat(nodes))
    : (aggregatedResponse = nodes)

  if (get([...path, 'pageInfo', 'hasNextPage'], false, data))
    return getProducts(
      client,
      path,
      query,
      first,
      last(edges).cursor,
      aggregatedResponse,
    )

  return aggregatedResponse
}
