import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { Environment } from './config.js'
import { createPrismaClient } from './prisma.js'
import { closeReadline } from './prompts.js'
import { selectEnvironment } from './commands/select-environment.js'
import { showMainMenu, MenuOption } from './commands/main-menu.js'
import { clearData } from './commands/clear-data.js'
import { deleteUserCommand } from './commands/delete-user.js'
import { seedUsersCommand } from './commands/seed-users.js'
import { seedExpensesCommand } from './commands/seed-expenses.js'
import { seedDemoCommand } from './commands/seed-demo.js'
import { resetExpensesCommand } from './commands/reset-expenses.js'
import { listPrimaryUsersCommand } from './commands/list-primary-users.js'
import { migrateMultiTenantCommand } from './commands/migrate-multi-tenant.js'

async function main(): Promise<void> {
  let prisma: PrismaClient | null = null
  let environment: Environment | null = null

  try {
    // Select environment first
    environment = await selectEnvironment()

    // Create Prisma client for selected environment
    prisma = createPrismaClient(environment)

    // Test connection
    await prisma.$connect()

    // Main menu loop
    let running = true
    while (running) {
      const option: MenuOption = await showMainMenu(environment)

      switch (option) {
        case 'clear-data':
          await clearData(prisma, environment)
          break

        case 'delete-user':
          await deleteUserCommand(prisma, environment)
          break

        case 'reset-expenses':
          await resetExpensesCommand(prisma, environment)
          break

        case 'list-primary-users':
          await listPrimaryUsersCommand(prisma, environment)
          break

        case 'migrate-multi-tenant':
          await migrateMultiTenantCommand(prisma, environment)
          break

        case 'seed-demo':
          await seedDemoCommand(prisma, environment)
          break

        case 'seed-users':
          await seedUsersCommand(prisma, environment)
          break

        case 'seed-expenses':
          await seedExpensesCommand(prisma, environment)
          break

        case 'exit':
          running = false
          break
      }
    }

    console.log()
    console.log('Goodbye!')
    console.log()
  } catch (error) {
    console.error()
    console.error('❌ Error:', error instanceof Error ? error.message : error)
    console.error()
    process.exitCode = 1
  } finally {
    // Clean up
    if (prisma) {
      await prisma.$disconnect()
    }
    closeReadline()
  }
}

// Run the application
main()
