import { graphql, GraphQLScalarType } from 'graphql'
import { buildClientSchema, printSchema } from 'graphql/utilities'
import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools'
import { identity, constant, zipObject } from 'lodash/fp'
import schemaJSON from './schema.json'

const genResolver = name =>
  new GraphQLScalarType({
    name,
    parseValue: identity,
    serialize: identity,
    parseLiteral: ast => (ast.kind === Kind.STRING ? ast.value : null),
  })

const scalars = ['DateTime', 'HTML', 'Money', 'URL']

const schema = makeExecutableSchema({
  typeDefs: printSchema(buildClientSchema(schemaJSON.data)),
  resolvers: zipObject(scalars, scalars.map(genResolver)),
})

addMockFunctionsToSchema({
  mocks: zipObject(scalars, scalars.map(constant)),
  schema,
})

export default (query, variables) =>
  graphql(schema, query, null, null, variables)
