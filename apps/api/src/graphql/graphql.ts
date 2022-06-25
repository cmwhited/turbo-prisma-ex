import { makeExecutableSchema } from '@graphql-tools/schema'
import { GraphQLSchema } from 'graphql'

import typeDefs from './graphql.schema'
import resolvers from './graphql.resolvers'

const schema: GraphQLSchema = makeExecutableSchema({ typeDefs, resolvers })

export default schema
