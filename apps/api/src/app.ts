import http from 'http'
import express, { Request, Response } from 'express'
import expressWs from 'express-ws'
import helmet from 'helmet'
import { ApolloServer } from 'apollo-server-express'
import { ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'
import { PubSub } from 'graphql-subscriptions'
import { PrismaClient } from '@prisma/client'

import type { BaseContext, GraphqlContext, GraphqlWsContext } from './app.types'
import { DATABASE_URL } from './env'
import { schema } from './graphql'

type TurboPrismaExApi = {
  server: http.Server
  db: any
}
export default async function buildApi(): Promise<TurboPrismaExApi> {
  console.log('api.app.build()::starting api')
  if (!DATABASE_URL) {
    console.error('api.app.build()::unable to find database url in environment. exiting...')
    process.exit(1)
  }

  const { app } = expressWs(express())
  app.set('trust proxy', true)
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(
    helmet({
      contentSecurityPolicy: false, // if set to true this breaks graphql playground
    }),
  )

  // instantiate db client
  console.log('api.app.build()::connecting to db')
  const db = new PrismaClient()
  await db.$connect()

  // build the context to pass to the gql api and ws server
  const ctx: BaseContext = { db }

  // health-check endpoint. validates server is running and can be pinged at /
  app.get('/', (_req: Request, res: Response) => res.sendStatus(200))

  // instantiate the http server that will hoist the graphql server from apollo
  console.log('api.app.buildHostedServiceApi()::instantiating http, websocket, and apollo graphql server instances')
  const server = http.createServer(app)
  const wsServer = new WebSocketServer({
    server,
    path: '/graphql',
  })
  // Hand in the schema we just created and have the WebSocketServer start listening.
  const serverCleanup = useServer(
    {
      schema,
      context: (): GraphqlWsContext => ({
        ...ctx,
        pubsub: new PubSub(),
      }),
    },
    wsServer,
  )

  // instantiate the apollo graphql server
  const apolloServer = new ApolloServer({
    schema,
    csrfPrevention: true,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer: server }),
      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
      ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
    context: ({ req, res }): GraphqlContext => ({
      ...ctx,
      req,
      res,
    }),
  })
  await apolloServer.start()
  apolloServer.applyMiddleware({
    app,
    path: '/graphql',
    cors: {
      origin: 'http://localhost:5000',
      credentials: true,
    },
  })

  return { db, server }
}
