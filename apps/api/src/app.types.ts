import type { Request, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import type { PubSub } from 'graphql-subscriptions'

export interface BaseContext {
  db: PrismaClient
}

export interface GraphqlContext extends BaseContext {
  req: Request
  res: Response
}

export interface GraphqlWsContext extends BaseContext {
  pubsub: PubSub
}
