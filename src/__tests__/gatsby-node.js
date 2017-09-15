import { sourceNodes, __RewireAPI__ as RewireAPI } from '../gatsby-node'

const createClient = RewireAPI.__GetDependency__('createClient')

const noop = () => {}

// Demo Shopify GraphQL shop
const name = 'graphql'
const token = '078bc5caa0ddebfa89cccb4a1baa1f5c'

describe('createClient', () => {
  test('creates a Shopify GraphQL client', async () => {
    const client = createClient(name, token)
    const result = await client.query('{ shop { name } }')

    expect(result).toEqual({ data: { shop: { name } } })
  })
})

describe('sourceNodes', () => {
  const redux = {
    boundActionCreators: {
      createNode: jest.fn(),
    },
  }
  const { boundActionCreators: { createNode } } = redux

  test.skip('creates a Shopify GraphQL client using options', async () => {
    const createClientMock = jest.fn(() => ({ query: noop }))
    RewireAPI.__Rewire__('createClient', createClientMock)

    await sourceNodes(redux, { name, token })
    expect(createClientMock).toHaveBeenCalledWith(name, token)

    RewireAPI.__ResetDependency__('createClient')
  })

  test('creates ShopifyProduct source nodes', async () => {
    await sourceNodes(redux, { name, token })
    expect(createNode).toHaveBeenCalled()
  })
})
