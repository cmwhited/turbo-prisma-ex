import { PrismaClient } from '@prisma/client'

import { API_PORT } from './env'
import buildHostedServiceApi from './app'

async function bootstrap(): Promise<void> {
  let _db: PrismaClient | null = null
  try {
    const { server, db } = await buildHostedServiceApi()
    _db = db

    server.listen(API_PORT, () => {
      console.log(`api.server.bootstrap()::api started on port [${API_PORT}]`)
    })
  } catch (err) {
    console.error('api.server.bootstrap()::failure instantiating app', err)
    if (_db != null) {
      try {
        _db.$disconnect() // close out db connection on failure
      } catch (err) {}
    }
    process.exit(1)
  }
}

bootstrap()
