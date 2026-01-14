import { PrismaClient } from '@prisma/client'
import { Environment, getConnectionString } from './config.js'

export function createPrismaClient(environment: Environment): PrismaClient {
  const connectionString = getConnectionString(environment)

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
  })

  return prisma
}
