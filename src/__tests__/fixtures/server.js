import { graphql, GraphQLScalarType } from 'graphql'
import { buildClientSchema, printSchema } from 'graphql/utilities'
import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools'
import zipObject from 'lodash.zipobject'
import schemaJSON from './schema.json'

const identity = x => x
const constantly = x => () => x
const scalars = ['DateTime', 'HTML', 'URL']

const genResolver = name =>
  new GraphQLScalarType({
    name,
    parseValue: identity,
    serialize: identity,
    parseLiteral: ast => (ast.kind === Kind.STRING ? ast.value : null),
  })

const schema = makeExecutableSchema({
  typeDefs: printSchema(buildClientSchema(schemaJSON.data)),
  resolvers: zipObject(scalars, scalars.map(genResolver)),
})

addMockFunctionsToSchema({
  mocks: zipObject(scalars, scalars.map(constantly)),
  schema,
})

export default (query, variables) =>
  graphql(schema, query, null, null, variables)
