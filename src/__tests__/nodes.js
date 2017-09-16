import { ProductNode, __RewireAPI__ as RewireAPI } from '../nodes'

const makeTypeName = RewireAPI.__GetDependency__('makeTypeName')

const obj = { id: 'id' }

describe('ProductNode', () => {
  test('creates an object', () => {
    expect(typeof ProductNode(obj)).toBe('object')
  })

  test('contains the minimal Gatsby properties', () => {
    expect(ProductNode(obj)).toMatchObject({
      id: expect.any(String),
      children: expect.any(Array),
      fields: expect.any(Object),
      internal: expect.objectContaining({
        contentDigest: expect.any(String),
        type: expect.any(String),
        owner: expect.any(String),
        fieldOwners: expect.any(Object)
      })
    })
  })
})
