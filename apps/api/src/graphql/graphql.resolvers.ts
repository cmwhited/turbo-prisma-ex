import type { IResolvers } from '@graphql-tools/utils'

import { query_logs } from '../logs'

const resolvers: IResolvers = {
  Query: {
    logs: query_logs,
  },
}

export default resolvers
