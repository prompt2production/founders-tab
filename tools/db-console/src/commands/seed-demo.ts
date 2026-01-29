import { PrismaClient, ExpenseStatus, User } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { Environment, environmentDisplayNames } from '../config.js'
import { confirm, selectOption, askQuestion } from '../prompts.js'
import {
  demoUserPool,
  expensePool,
  rejectionReasons,
  daysAgo,
  randomAmount,
  randomPick,
  randomBetween,
  shuffle,
} from '../seed-data/test-data.js'

type DemoSize = 'light' | 'medium' | 'heavy'

const DEMO_SIZE_CONFIG: Record<DemoSize, { label: string; expensesPerUser: [number, number]; description: string }> = {
  light: {
    label: 'Light (~8-12 expenses per founder)',
    expensesPerUser: [8, 12],
    description: 'A few weeks of activity',
  },
  medium: {
    label: 'Medium (~15-25 expenses per founder)',
    expensesPerUser: [15, 25],
    description: '2-3 months of typical startup activity',
  },
  heavy: {
    label: 'Heavy (~30-45 expenses per founder)',
    expensesPerUser: [30, 45],
    description: '4-6 months of busy startup activity',
  },
}

export async function seedDemoCommand(prisma: PrismaClient, environment: Environment): Promise<void> {
  console.log()

  // Block production
  if (environment === 'production') {
    console.log('❌ ERROR: Demo seeding is not allowed in Production environment!')
    console.log('   This operation has been blocked for safety.')
    console.log()
    return
  }

  console.log('╔══════════════════════════════════════╗')
  console.log('║       Full Demo Seed                 ║')
  console.log('╚══════════════════════════════════════╝')
  console.log()
  console.log('This will clear ALL existing data and create a complete')
  console.log('demo dataset simulating a startup that has been running')
  console.log('for a few months.')
  console.log()
  console.log(`Environment: ${environmentDisplayNames[environment]}`)
  console.log()

  // Step 1: How many founders?
  const founderCount = await selectOption<string>(
    'How many co-founders?',
    [
      { value: '2', label: '2 founders' },
      { value: '3', label: '3 founders (Recommended)' },
      { value: '4', label: '4 founders' },
      { value: '5', label: '5 founders' },
    ]
  )
  const numFounders = parseInt(founderCount, 10)

  // Step 2: How much data?
  const demoSize = await selectOption<DemoSize>(
    'How much expense data?',
    [
      { value: 'light', label: DEMO_SIZE_CONFIG.light.label },
      { value: 'medium', label: `${DEMO_SIZE_CONFIG.medium.label} (Recommended)` },
      { value: 'heavy', label: DEMO_SIZE_CONFIG.heavy.label },
    ]
  )

  const config = DEMO_SIZE_CONFIG[demoSize]
  const [minPerUser, maxPerUser] = config.expensesPerUser
  const totalExpensesEstimate = `${numFounders * minPerUser}-${numFounders * maxPerUser}`

  // Step 3: Company name
  console.log()
  console.log('Company name (press Enter for "Founders Tab"):')
  const companyNameInput = await askQuestion('> ')
  const companyName = companyNameInput.trim() || 'Founders Tab'

  // Show summary
  console.log()
  console.log('═══════════════════════════════════════')
  console.log('  Demo Seed Summary')
  console.log('═══════════════════════════════════════')
  console.log()
  console.log(`  Company:        ${companyName}`)
  console.log(`  Founders:       ${numFounders}`)
  const selectedUsers = demoUserPool.slice(0, numFounders)
  for (const user of selectedUsers) {
    console.log(`                  - ${user.name} (${user.email})`)
  }
  console.log(`  Data volume:    ${config.description}`)
  console.log(`  Est. expenses:  ~${totalExpensesEstimate} total`)
  console.log()
  console.log('  ⚠️  This will DELETE all existing data first!')
  console.log()

  const confirmed = await confirm('Proceed with demo seed?')
  if (!confirmed) {
    console.log('Operation cancelled.')
    return
  }

  console.log()
  console.log('Starting demo seed...')
  console.log()

  try {
    // ===== Phase 1: Clear all data =====
    console.log('Phase 1: Clearing existing data...')
    await prisma.withdrawalApproval.deleteMany()
    await prisma.approval.deleteMany()
    await prisma.expense.deleteMany()
    await prisma.session.deleteMany()
    await prisma.passwordReset.deleteMany()
    await prisma.invitation.deleteMany()
    await prisma.user.deleteMany()
    await prisma.company.deleteMany()
    await prisma.companySettings.deleteMany()
    await prisma.item.deleteMany()
    console.log('  ✓ All data cleared')
    console.log()

    // ===== Phase 2: Create company =====
    console.log('Phase 2: Creating company...')
    const company = await prisma.company.create({
      data: {
        name: companyName,
        currency: 'GBP',
      },
    })
    // Also create CompanySettings for backward compatibility during migration
    await prisma.companySettings.create({
      data: {
        name: companyName,
        currency: 'GBP',
      },
    })
    console.log(`  ✓ Company "${companyName}" created (GBP)`)
    console.log()

    // ===== Phase 3: Create users =====
    console.log('Phase 3: Creating founders...')
    const createdUsers: User[] = []
    for (const userData of selectedUsers) {
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          passwordHash: userData.passwordHash,
          avatarInitials: userData.avatarInitials,
          role: userData.role,
          companyId: company.id,
        },
      })
      createdUsers.push(user)
      console.log(`  ✓ Created ${user.name} (${user.email})`)
    }
    console.log()

    // ===== Phase 4: Create expenses =====
    console.log('Phase 4: Creating expenses...')

    // Determine the status distribution based on age of expense
    // Older expenses are more likely to be fully processed
    // Recent expenses are more likely to be pending

    let totalExpenses = 0
    let totalApprovals = 0
    let totalWithdrawalApprovals = 0
    let totalRejected = 0

    const allExpenseIds: { id: string; ownerIndex: number; status: ExpenseStatus }[] = []

    for (let userIdx = 0; userIdx < createdUsers.length; userIdx++) {
      const user = createdUsers[userIdx]
      const numExpenses = randomBetween(minPerUser, maxPerUser)

      console.log(`  Creating ${numExpenses} expenses for ${user.name}...`)

      // Pick random expenses from the pool, allowing repeats with different amounts/dates
      const maxDaysBack = demoSize === 'heavy' ? 180 : demoSize === 'medium' ? 90 : 45

      for (let i = 0; i < numExpenses; i++) {
        const template = randomPick(expensePool)
        const expDaysAgo = randomBetween(1, maxDaysBack)

        // Status based on age:
        // 0-7 days: mostly PENDING_APPROVAL (70%), some APPROVED (30%)
        // 8-21 days: mix of APPROVED (40%), WITHDRAWAL_REQUESTED (25%), PENDING (20%), REJECTED (15%)
        // 22-60 days: WITHDRAWAL_APPROVED (30%), RECEIVED (40%), APPROVED (15%), REJECTED (10%), WITHDRAWAL_REJECTED (5%)
        // 60+ days: mostly RECEIVED (70%), WITHDRAWAL_APPROVED (15%), REJECTED (10%), WITHDRAWAL_REJECTED (5%)
        const status = pickStatusByAge(expDaysAgo)

        const amount = template.minAmount === template.maxAmount
          ? template.minAmount.toFixed(2)
          : randomAmount(template.minAmount, template.maxAmount)

        // Determine rejection data
        const isRejected = status === ExpenseStatus.REJECTED || status === ExpenseStatus.WITHDRAWAL_REJECTED
        const otherUsers = createdUsers.filter((_, idx) => idx !== userIdx)
        const rejector = isRejected && otherUsers.length > 0 ? randomPick(otherUsers) : null

        const expense = await prisma.expense.create({
          data: {
            userId: user.id,
            date: daysAgo(expDaysAgo),
            amount: new Decimal(amount),
            description: template.description,
            category: template.category,
            status,
            receiptUrl: template.receiptUrl,
            notes: template.notes,
            rejectedById: rejector?.id ?? null,
            rejectedAt: isRejected ? daysAgo(Math.max(1, expDaysAgo - randomBetween(1, 3))) : null,
            rejectionReason: isRejected ? randomPick(rejectionReasons) : null,
          },
        })

        allExpenseIds.push({ id: expense.id, ownerIndex: userIdx, status })
        totalExpenses++
        if (isRejected) totalRejected++
      }
    }
    console.log(`  ✓ Created ${totalExpenses} expenses (${totalRejected} rejected)`)
    console.log()

    // ===== Phase 5: Create approvals =====
    console.log('Phase 5: Creating approval records...')

    for (const expense of allExpenseIds) {
      const otherUserIndices = createdUsers
        .map((_, idx) => idx)
        .filter(idx => idx !== expense.ownerIndex)

      if (expense.status === ExpenseStatus.PENDING_APPROVAL) {
        // Partial approval: 0 or 1 other users have approved
        const approverCount = otherUserIndices.length > 1 ? randomBetween(0, 1) : 0
        const shuffledOthers = shuffle(otherUserIndices)
        for (let a = 0; a < approverCount; a++) {
          await prisma.approval.create({
            data: {
              expenseId: expense.id,
              userId: createdUsers[shuffledOthers[a]].id,
            },
          })
          totalApprovals++
        }
      } else if (
        expense.status === ExpenseStatus.APPROVED ||
        expense.status === ExpenseStatus.WITHDRAWAL_REQUESTED ||
        expense.status === ExpenseStatus.WITHDRAWAL_APPROVED ||
        expense.status === ExpenseStatus.RECEIVED
      ) {
        // Full approval: all other users have approved
        for (const idx of otherUserIndices) {
          await prisma.approval.create({
            data: {
              expenseId: expense.id,
              userId: createdUsers[idx].id,
            },
          })
          totalApprovals++
        }
      } else if (
        expense.status === ExpenseStatus.REJECTED ||
        expense.status === ExpenseStatus.WITHDRAWAL_REJECTED
      ) {
        // Rejected: some may have approved before rejection
        const approverCount = randomBetween(0, Math.max(0, otherUserIndices.length - 1))
        const shuffledOthers = shuffle(otherUserIndices)
        for (let a = 0; a < approverCount; a++) {
          await prisma.approval.create({
            data: {
              expenseId: expense.id,
              userId: createdUsers[shuffledOthers[a]].id,
            },
          })
          totalApprovals++
        }
      }
    }
    console.log(`  ✓ Created ${totalApprovals} approval records`)
    console.log()

    // ===== Phase 6: Create withdrawal approvals =====
    console.log('Phase 6: Creating withdrawal approval records...')

    for (const expense of allExpenseIds) {
      const otherUserIndices = createdUsers
        .map((_, idx) => idx)
        .filter(idx => idx !== expense.ownerIndex)

      if (expense.status === ExpenseStatus.WITHDRAWAL_REQUESTED) {
        // Partial withdrawal approval: some but not all other users
        const approverCount = randomBetween(0, Math.max(0, otherUserIndices.length - 1))
        const shuffledOthers = shuffle(otherUserIndices)
        for (let a = 0; a < approverCount; a++) {
          await prisma.withdrawalApproval.create({
            data: {
              expenseId: expense.id,
              userId: createdUsers[shuffledOthers[a]].id,
            },
          })
          totalWithdrawalApprovals++
        }
      } else if (
        expense.status === ExpenseStatus.WITHDRAWAL_APPROVED ||
        expense.status === ExpenseStatus.RECEIVED
      ) {
        // Full withdrawal approval: all other users
        for (const idx of otherUserIndices) {
          await prisma.withdrawalApproval.create({
            data: {
              expenseId: expense.id,
              userId: createdUsers[idx].id,
            },
          })
          totalWithdrawalApprovals++
        }
      } else if (expense.status === ExpenseStatus.WITHDRAWAL_REJECTED) {
        // Some withdrawal approvals before rejection
        const approverCount = randomBetween(0, Math.max(0, otherUserIndices.length - 1))
        const shuffledOthers = shuffle(otherUserIndices)
        for (let a = 0; a < approverCount; a++) {
          await prisma.withdrawalApproval.create({
            data: {
              expenseId: expense.id,
              userId: createdUsers[shuffledOthers[a]].id,
            },
          })
          totalWithdrawalApprovals++
        }
      }
    }
    console.log(`  ✓ Created ${totalWithdrawalApprovals} withdrawal approval records`)
    console.log()

    // ===== Summary =====
    // Calculate totals per user
    const perUserCounts: Record<string, number> = {}
    const perUserTotals: Record<string, number> = {}
    for (const user of createdUsers) {
      const userExpenses = await prisma.expense.findMany({
        where: { userId: user.id },
        select: { amount: true },
      })
      perUserCounts[user.name] = userExpenses.length
      perUserTotals[user.name] = userExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
    }

    // Status breakdown
    const statusCounts: Record<string, number> = {}
    for (const expense of allExpenseIds) {
      statusCounts[expense.status] = (statusCounts[expense.status] || 0) + 1
    }

    console.log('═══════════════════════════════════════')
    console.log('  ✓ Demo Seed Complete!')
    console.log('═══════════════════════════════════════')
    console.log()
    console.log('  Company:')
    console.log(`    ${companyName} (GBP)`)
    console.log()
    console.log('  Founders:')
    for (const user of createdUsers) {
      const count = perUserCounts[user.name]
      const total = perUserTotals[user.name].toFixed(2)
      console.log(`    ${user.name}: ${count} expenses, £${total} total`)
    }
    console.log()
    console.log('  Status breakdown:')
    for (const [status, count] of Object.entries(statusCounts).sort()) {
      console.log(`    ${status}: ${count}`)
    }
    console.log()
    console.log('  Totals:')
    console.log(`    ${totalExpenses} expenses`)
    console.log(`    ${totalApprovals} approval records`)
    console.log(`    ${totalWithdrawalApprovals} withdrawal approval records`)
    console.log(`    ${totalRejected} rejected expenses`)
    console.log()
    console.log('  All users have password: Password123!')
    console.log()
  } catch (error) {
    console.error()
    console.error('❌ Error during demo seed:', error instanceof Error ? error.message : error)
    console.error()
  }
}

/**
 * Pick an expense status based on how old the expense is.
 * Older expenses are more likely to be fully processed,
 * recent ones are more likely pending.
 */
function pickStatusByAge(daysOld: number): ExpenseStatus {
  const roll = Math.random() * 100

  if (daysOld <= 7) {
    // Very recent: mostly pending
    if (roll < 70) return ExpenseStatus.PENDING_APPROVAL
    if (roll < 90) return ExpenseStatus.APPROVED
    return ExpenseStatus.REJECTED
  }

  if (daysOld <= 21) {
    // Recent: mix
    if (roll < 20) return ExpenseStatus.PENDING_APPROVAL
    if (roll < 55) return ExpenseStatus.APPROVED
    if (roll < 75) return ExpenseStatus.WITHDRAWAL_REQUESTED
    return ExpenseStatus.REJECTED
  }

  if (daysOld <= 60) {
    // Older: mostly processed
    if (roll < 5) return ExpenseStatus.PENDING_APPROVAL
    if (roll < 15) return ExpenseStatus.APPROVED
    if (roll < 25) return ExpenseStatus.WITHDRAWAL_REQUESTED
    if (roll < 55) return ExpenseStatus.WITHDRAWAL_APPROVED
    if (roll < 85) return ExpenseStatus.RECEIVED
    if (roll < 95) return ExpenseStatus.REJECTED
    return ExpenseStatus.WITHDRAWAL_REJECTED
  }

  // Very old: almost all completed
  if (roll < 5) return ExpenseStatus.APPROVED
  if (roll < 15) return ExpenseStatus.WITHDRAWAL_APPROVED
  if (roll < 75) return ExpenseStatus.RECEIVED
  if (roll < 90) return ExpenseStatus.REJECTED
  return ExpenseStatus.WITHDRAWAL_REJECTED
}
