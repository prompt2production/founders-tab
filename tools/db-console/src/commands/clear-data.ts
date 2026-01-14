import { PrismaClient } from '@prisma/client'
import { Environment, environmentDisplayNames } from '../config.js'
import { confirm, askQuestion } from '../prompts.js'

export async function clearData(prisma: PrismaClient, environment: Environment): Promise<void> {
  console.log()
  console.log('⚠️  WARNING: This will delete ALL data from the database!')
  console.log(`   Environment: ${environmentDisplayNames[environment]}`)
  console.log()

  // Standard confirmation
  const confirmed = await confirm('Are you sure you want to delete ALL data?')

  if (!confirmed) {
    console.log('Operation cancelled.')
    return
  }

  // Extra confirmation for production
  if (environment === 'production') {
    console.log()
    console.log('🚨 PRODUCTION ENVIRONMENT DETECTED!')
    console.log('   Type "DELETE PRODUCTION DATA" to confirm:')
    console.log()

    const confirmText = await askQuestion('> ')

    if (confirmText !== 'DELETE PRODUCTION DATA') {
      console.log('Confirmation text did not match. Operation cancelled.')
      return
    }
  }

  console.log()
  console.log('Deleting data...')

  try {
    // Delete in order to respect foreign key constraints
    console.log('  Deleting withdrawal approvals...')
    const withdrawalApprovals = await prisma.withdrawalApproval.deleteMany()
    console.log(`    ✓ Deleted ${withdrawalApprovals.count} withdrawal approvals`)

    console.log('  Deleting approvals...')
    const approvals = await prisma.approval.deleteMany()
    console.log(`    ✓ Deleted ${approvals.count} approvals`)

    console.log('  Deleting expenses...')
    const expenses = await prisma.expense.deleteMany()
    console.log(`    ✓ Deleted ${expenses.count} expenses`)

    console.log('  Deleting users...')
    const users = await prisma.user.deleteMany()
    console.log(`    ✓ Deleted ${users.count} users`)

    console.log()
    console.log('✓ All data has been cleared successfully!')
    console.log()
  } catch (error) {
    console.error()
    console.error('❌ Error clearing data:', error instanceof Error ? error.message : error)
    console.error()
  }
}
