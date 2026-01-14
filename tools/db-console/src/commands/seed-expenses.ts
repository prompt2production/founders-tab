import { PrismaClient, ExpenseStatus, User } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { Environment, environmentDisplayNames } from '../config.js'
import { confirm } from '../prompts.js'
import { expenseTemplates, daysAgo } from '../seed-data/test-data.js'

export async function seedExpensesCommand(prisma: PrismaClient, environment: Environment): Promise<void> {
  console.log()

  // Block production seeding
  if (environment === 'production') {
    console.log('❌ ERROR: Seeding expenses is not allowed in Production environment!')
    console.log('   This operation has been blocked for safety.')
    console.log()
    return
  }

  // Get all existing users
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
  })

  if (users.length < 2) {
    console.log('❌ ERROR: At least 2 users must exist in the database to seed expenses.')
    console.log(`   Currently found: ${users.length} user${users.length !== 1 ? 's' : ''}`)
    console.log()
    console.log('   Run "Seed users" first to create the required users.')
    console.log()
    return
  }

  console.log(`Seed expense data into ${environmentDisplayNames[environment]}?`)
  console.log()
  console.log(`Found ${users.length} users in the database:`)
  for (const user of users) {
    console.log(`  - ${user.name} (${user.email})`)
  }
  console.log()
  console.log(`Will create ${expenseTemplates.length} expenses distributed across all users.`)
  console.log()

  const confirmed = await confirm('Continue?')

  if (!confirmed) {
    console.log('Operation cancelled.')
    return
  }

  console.log()
  console.log('Seeding expense data...')

  try {
    // Create expenses distributed across users
    console.log('  Creating expenses...')
    const createdExpenses: { id: string; ownerIndex: number; status: ExpenseStatus }[] = []

    for (let i = 0; i < expenseTemplates.length; i++) {
      const template = expenseTemplates[i]
      const ownerIndex = i % users.length
      const owner = users[ownerIndex]

      const expense = await prisma.expense.create({
        data: {
          userId: owner.id,
          date: daysAgo(template.daysAgo),
          amount: new Decimal(template.amount),
          description: template.description,
          category: template.category,
          status: template.status,
          receiptUrl: template.receiptUrl,
          notes: template.notes,
        },
      })

      createdExpenses.push({
        id: expense.id,
        ownerIndex,
        status: template.status,
      })
    }
    console.log(`    ✓ Created ${createdExpenses.length} expenses`)

    // Create approvals for expenses that need them
    console.log('  Creating approvals...')
    let approvalCount = 0

    for (const expense of createdExpenses) {
      if (expense.status === ExpenseStatus.PENDING_APPROVAL) {
        // Partial approval - one other user has approved
        const approverIndex = (expense.ownerIndex + 1) % users.length
        await prisma.approval.create({
          data: {
            expenseId: expense.id,
            userId: users[approverIndex].id,
          },
        })
        approvalCount++
      } else if (expense.status !== ExpenseStatus.PENDING_APPROVAL) {
        // Full approval - all other users have approved
        for (let j = 0; j < users.length; j++) {
          if (j !== expense.ownerIndex) {
            await prisma.approval.create({
              data: {
                expenseId: expense.id,
                userId: users[j].id,
              },
            })
            approvalCount++
          }
        }
      }
    }
    console.log(`    ✓ Created ${approvalCount} approvals`)

    // Create withdrawal approvals for expenses in withdrawal flow
    console.log('  Creating withdrawal approvals...')
    let withdrawalApprovalCount = 0

    for (const expense of createdExpenses) {
      if (expense.status === ExpenseStatus.WITHDRAWAL_REQUESTED) {
        // Partial withdrawal approval - one other user has approved
        const approverIndex = (expense.ownerIndex + 1) % users.length
        await prisma.withdrawalApproval.create({
          data: {
            expenseId: expense.id,
            userId: users[approverIndex].id,
          },
        })
        withdrawalApprovalCount++
      } else if (
        expense.status === ExpenseStatus.WITHDRAWAL_APPROVED ||
        expense.status === ExpenseStatus.RECEIVED
      ) {
        // Full withdrawal approval - all other users have approved
        for (let j = 0; j < users.length; j++) {
          if (j !== expense.ownerIndex) {
            await prisma.withdrawalApproval.create({
              data: {
                expenseId: expense.id,
                userId: users[j].id,
              },
            })
            withdrawalApprovalCount++
          }
        }
      }
    }
    console.log(`    ✓ Created ${withdrawalApprovalCount} withdrawal approvals`)

    console.log()
    console.log('✓ Expense data seeded successfully!')
    console.log()
    console.log('Summary:')
    console.log(`  - ${createdExpenses.length} expenses`)
    console.log(`  - ${approvalCount} approvals`)
    console.log(`  - ${withdrawalApprovalCount} withdrawal approvals`)
    console.log()
  } catch (error) {
    console.error()
    console.error('❌ Error seeding expenses:', error instanceof Error ? error.message : error)
    console.error()
  }
}
