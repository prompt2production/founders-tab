import { PrismaClient, ExpenseStatus } from '@prisma/client'
import { Environment, environmentDisplayNames } from '../config.js'
import { confirm } from '../prompts.js'
import { testUsers, generateTestExpenses } from '../seed-data/test-data.js'

export async function seedData(prisma: PrismaClient, environment: Environment): Promise<void> {
  console.log()

  // Block production seeding
  if (environment === 'production') {
    console.log('❌ ERROR: Seeding is not allowed in Production environment!')
    console.log('   This operation has been blocked for safety.')
    console.log()
    return
  }

  console.log(`Seed test data into ${environmentDisplayNames[environment]}?`)
  console.log()

  const confirmed = await confirm('Continue?')

  if (!confirmed) {
    console.log('Operation cancelled.')
    return
  }

  console.log()
  console.log('Seeding data...')

  try {
    // Create users first
    console.log('  Creating users...')
    const createdUsers = await Promise.all(
      testUsers.map((user) =>
        prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            passwordHash: user.passwordHash,
            avatarInitials: user.avatarInitials,
            role: user.role,
          },
        })
      )
    )
    console.log(`    ✓ Created ${createdUsers.length} users`)

    // Create expenses
    console.log('  Creating expenses...')
    const testExpenses = generateTestExpenses()
    const createdExpenses = await Promise.all(
      testExpenses.map((expense) =>
        prisma.expense.create({
          data: {
            userId: createdUsers[expense.ownerIndex].id,
            date: expense.date,
            amount: expense.amount,
            description: expense.description,
            category: expense.category,
            status: expense.status,
            receiptUrl: expense.receiptUrl,
            notes: expense.notes,
          },
        })
      )
    )
    console.log(`    ✓ Created ${createdExpenses.length} expenses`)

    // Create approvals for APPROVED and later status expenses
    // (All founders except owner need to approve for expense to be APPROVED)
    console.log('  Creating approvals...')
    let approvalCount = 0
    for (let i = 0; i < createdExpenses.length; i++) {
      const expense = createdExpenses[i]
      const testExpense = testExpenses[i]

      // Skip PENDING_APPROVAL expenses - they don't have all approvals yet
      if (testExpense.status === ExpenseStatus.PENDING_APPROVAL) {
        // Add partial approvals (just one founder)
        const approverIndex = (testExpense.ownerIndex + 1) % 3
        await prisma.approval.create({
          data: {
            expenseId: expense.id,
            userId: createdUsers[approverIndex].id,
          },
        })
        approvalCount++
        continue
      }

      // For all other statuses, all other founders have approved
      for (let j = 0; j < createdUsers.length; j++) {
        if (j !== testExpense.ownerIndex) {
          await prisma.approval.create({
            data: {
              expenseId: expense.id,
              userId: createdUsers[j].id,
            },
          })
          approvalCount++
        }
      }
    }
    console.log(`    ✓ Created ${approvalCount} approvals`)

    // Create withdrawal approvals for expenses in withdrawal flow
    console.log('  Creating withdrawal approvals...')
    let withdrawalApprovalCount = 0
    for (let i = 0; i < createdExpenses.length; i++) {
      const expense = createdExpenses[i]
      const testExpense = testExpenses[i]

      if (testExpense.status === ExpenseStatus.WITHDRAWAL_REQUESTED) {
        // Partial withdrawal approvals (one founder has approved)
        const approverIndex = (testExpense.ownerIndex + 1) % 3
        await prisma.withdrawalApproval.create({
          data: {
            expenseId: expense.id,
            userId: createdUsers[approverIndex].id,
          },
        })
        withdrawalApprovalCount++
      } else if (
        testExpense.status === ExpenseStatus.WITHDRAWAL_APPROVED ||
        testExpense.status === ExpenseStatus.RECEIVED
      ) {
        // All other founders have approved withdrawal
        for (let j = 0; j < createdUsers.length; j++) {
          if (j !== testExpense.ownerIndex) {
            await prisma.withdrawalApproval.create({
              data: {
                expenseId: expense.id,
                userId: createdUsers[j].id,
              },
            })
            withdrawalApprovalCount++
          }
        }
      }
    }
    console.log(`    ✓ Created ${withdrawalApprovalCount} withdrawal approvals`)

    console.log()
    console.log('✓ Test data seeded successfully!')
    console.log()
    console.log('Summary:')
    console.log(`  - ${createdUsers.length} users (password: Password123)`)
    console.log(`  - ${createdExpenses.length} expenses`)
    console.log(`  - ${approvalCount} approvals`)
    console.log(`  - ${withdrawalApprovalCount} withdrawal approvals`)
    console.log()
  } catch (error) {
    console.error()
    console.error('❌ Error seeding data:', error instanceof Error ? error.message : error)
    console.error()
  }
}
