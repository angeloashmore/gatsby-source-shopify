import { graphql, GraphQLScalarType } from 'graphql'
import { buildClientSchema, printSchema } from 'graphql/utilities'
import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools'
import schemaJSON from './schema.json'

const typeDefs = printSchema(buildClientSchema(schemaJSON.data))

const genResolver = name => new GraphQLScalarType({
  name,
  description: '',
  parseValue(value) {
    return value
  },
  serialize(value) {
    return value
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return ast.value
    }
    return null
  },
})

const schema = makeExecutableSchema({
  typeDefs,
  resolvers: {
    DateTime: genResolver('DateTime'),
    HTML: genResolver('HTML'),
    URL: genResolver('HTML'),
  },
})

addMockFunctionsToSchema({
  mocks: {
    DateTime: () => '',
    HTML: () => '',
    URL: () => ''
  },
  schema,
})

export default (query, variables) => graphql(schema, query, null, null, variables)
