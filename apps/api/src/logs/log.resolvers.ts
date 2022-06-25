import type { Log, LogSeverity } from '@prisma/client'
import type { GraphqlContext } from '../app.types'

export type LogsQueryArgs = {
  severity?: LogSeverity
}
export async function query_logs(
  _parent: undefined,
  { severity }: LogsQueryArgs,
  { db }: GraphqlContext,
): Promise<Log[]> {
  if (severity != null) {
    return await db.log.findMany({ where: { severity }, orderBy: { timestamp: 'desc' } })
  }
  return await db.log.findMany({ orderBy: { timestamp: 'desc' } })
}
