import ExtendableError from 'es6-error'
import { get, last } from 'lodash/fp'

const UNAUTHORIZED_ERROR = new Error('Unauthorized')

/**
 * Error with message formatted specifically for GraphQL error messages.
 */
export class GraphQLError extends ExtendableError {
  constructor({ message, locations, fields }) {
    let str = message

    if (locations)
      str += ` at ${locations.map(l => Object.values(l).join(':')).join(', ')}`

    if (fields) str += ` (${fields.join(' > ')})`

    super(str)
  }
}

/**
 * Request a query from a client. Throws an error if any are returned.
 */
export const queryOnce = async (client, query, first = 250, after) => {
  const { data, errors } = await client.query(
    query,
    { first, after },
    (_req, res) => {
      if (res.status === 401) throw UNAUTHORIZED_ERROR
    },
  )

  if (errors) throw new GraphQLError(errors[0])

  return data
}

/**
 * Get all paginated data from a query. Will execute multiple requests as
 * needed.
 */
export const queryAll = async (
  client,
  path,
  query,
  first = 250,
  after,
  aggregatedResponse,
) => {
  const data = await queryOnce(client, query, first, after)

  const edges = get([...path, 'edges'], data)
  const nodes = edges.map(edge => edge.node)

  aggregatedResponse
    ? (aggregatedResponse = aggregatedResponse.concat(nodes))
    : (aggregatedResponse = nodes)

  if (get([...path, 'pageInfo', 'hasNextPage'], false, data))
    return queryAll(
      client,
      path,
      query,
      first,
      last(edges).cursor,
      aggregatedResponse,
    )

  return aggregatedResponse
}
