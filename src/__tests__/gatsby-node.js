import { sourceNodes, __RewireAPI__ as RewireAPI } from '../gatsby-node'
import graphQLServer from './fixtures/server'

const createClient = RewireAPI.__GetDependency__('createClient')

const queryMock = jest.fn(graphQLServer)
RewireAPI.__Rewire__('createGraphQLClient', () => ({ query: queryMock }))

const name = 'name'
const token = 'token'

describe('sourceNodes', () => {
  const redux = {
    boundActionCreators: {
      createNode: jest.fn(),
    },
  }
  const { boundActionCreators: { createNode } } = redux

  beforeEach(() => {
    queryMock.mockClear()
  })

  test('queries Shopify', async () => {
    await sourceNodes(redux, { name, token })
    expect(queryMock).toHaveBeenCalled()
  })

  test('creates ShopifyProduct source nodes', async () => {
    await sourceNodes(redux, { name, token })
    expect(createNode).toHaveBeenCalled()
  })
})
