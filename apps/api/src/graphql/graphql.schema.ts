import { gql } from 'apollo-server-express'
import { DocumentNode } from 'graphql'

const typeDefs: DocumentNode = gql`
  type Query {
    logs(severity: LogSeverity): [Log!]
  }

  enum LogSeverity {
    error
    info
    warn
  }

  type Log {
    id: ID!
    app: String!
    timestamp: Int!
    text: String!
    severity: LogSeverity!
    created_at: String!
    updated_at: String!
  }
`

export default typeDefs
