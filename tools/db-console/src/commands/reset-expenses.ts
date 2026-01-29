import { PrismaClient } from '@prisma/client'
import { Environment, environmentDisplayNames } from '../config.js'
import { confirm, selectOption, askQuestion } from '../prompts.js'

export async function resetExpensesCommand(prisma: PrismaClient, environment: Environment): Promise<void> {
  console.log()
  console.log('Reset Expenses to Unapproved')
  console.log('────────────────────────────')

  // Fetch all founder users
  const founders = await prisma.user.findMany({
    where: { role: 'FOUNDER' },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      _count: { select: { expenses: true } },
    },
  })

  if (founders.length === 0) {
    console.log('No founder users found in the database.')
    return
  }

  // Select a founder
  const founderOptions = founders.map((f) => ({
    value: f.id,
    label: `${f.name} (${f.email}) - ${f._count.expenses} expense(s)`,
  }))
  founderOptions.push({ value: 'cancel', label: 'Cancel - go back to menu' })

  const selectedFounderId = await selectOption<string>(
    'Select a founder whose expenses to reset:',
    founderOptions
  )

  if (selectedFounderId === 'cancel') {
    console.log('Operation cancelled.')
    return
  }

  const selectedFounder = founders.find((f) => f.id === selectedFounderId)
  if (!selectedFounder) {
    console.log('Founder not found.')
    return
  }

  // Fetch expenses for this founder that are NOT already PENDING_APPROVAL
  const expenses = await prisma.expense.findMany({
    where: {
      userId: selectedFounderId,
      status: { not: 'PENDING_APPROVAL' },
    },
    orderBy: { date: 'desc' },
    include: {
      _count: {
        select: {
          approvals: true,
          withdrawalApprovals: true,
        },
      },
    },
  })

  if (expenses.length === 0) {
    console.log()
    console.log(`No resettable expenses found for ${selectedFounder.name}.`)
    console.log('(All expenses are already in PENDING_APPROVAL status)')
    return
  }

  console.log()
  console.log(`Found ${expenses.length} resettable expense(s) for ${selectedFounder.name}:`)
  console.log()

  // Display expenses
  expenses.forEach((expense, index) => {
    const date = expense.date.toISOString().split('T')[0]
    const amount = Number(expense.amount).toFixed(2)
    console.log(`  ${index + 1}. [${expense.status}] ${date} - ${expense.description} - ${amount} (${expense.category})`)
    console.log(`     Approvals: ${expense._count.approvals}, Withdrawal Approvals: ${expense._count.withdrawalApprovals}`)
    if (expense.rejectedById) {
      console.log(`     Has rejection data`)
    }
  })
  console.log()

  // Ask which expenses to reset
  const selectionMode = await selectOption<string>(
    'Which expenses would you like to reset?',
    [
      { value: 'all', label: 'Reset ALL listed expenses' },
      { value: 'select', label: 'Select specific expenses by number' },
      { value: 'cancel', label: 'Cancel - go back to menu' },
    ]
  )

  if (selectionMode === 'cancel') {
    console.log('Operation cancelled.')
    return
  }

  let selectedExpenseIds: string[]

  if (selectionMode === 'all') {
    selectedExpenseIds = expenses.map((e) => e.id)
  } else {
    console.log()
    console.log('Enter expense numbers separated by commas (e.g., 1,3,5):')
    const input = await askQuestion('> ')
    const indices = input.split(',').map((s) => parseInt(s.trim(), 10) - 1)

    const invalidIndices = indices.filter((i) => isNaN(i) || i < 0 || i >= expenses.length)
    if (invalidIndices.length > 0) {
      console.log('Invalid selection. Operation cancelled.')
      return
    }

    selectedExpenseIds = indices.map((i) => expenses[i].id)
  }

  if (selectedExpenseIds.length === 0) {
    console.log('No expenses selected. Operation cancelled.')
    return
  }

  // Show summary of what will happen
  const selectedExpenses = expenses.filter((e) => selectedExpenseIds.includes(e.id))
  console.log()
  console.log(`⚠️  WARNING: This will reset ${selectedExpenseIds.length} expense(s):`)
  console.log(`   Environment: ${environmentDisplayNames[environment]}`)
  console.log()
  for (const exp of selectedExpenses) {
    const date = exp.date.toISOString().split('T')[0]
    const amount = Number(exp.amount).toFixed(2)
    console.log(`   - ${date} ${exp.description} (${amount}) [${exp.status} → PENDING_APPROVAL]`)
  }
  console.log()
  console.log('   For each expense, this will:')
  console.log('   - Set status to PENDING_APPROVAL')
  console.log('   - Delete all approval records')
  console.log('   - Delete all withdrawal approval records')
  console.log('   - Clear rejection data (rejectedBy, rejectedAt, rejectionReason)')
  console.log()

  const confirmed = await confirm('Are you sure you want to reset these expenses?')

  if (!confirmed) {
    console.log('Operation cancelled.')
    return
  }

  // Extra confirmation for production
  if (environment === 'production') {
    console.log()
    console.log('🚨 PRODUCTION ENVIRONMENT DETECTED!')
    console.log('   Type "RESET" to confirm:')
    console.log()

    const confirmText = await askQuestion('> ')

    if (confirmText !== 'RESET') {
      console.log('Confirmation did not match. Operation cancelled.')
      return
    }
  }

  console.log()
  console.log('Resetting expenses...')

  try {
    let totalApprovals = 0
    let totalWithdrawalApprovals = 0

    for (const expenseId of selectedExpenseIds) {
      const expense = selectedExpenses.find((e) => e.id === expenseId)!
      const date = expense.date.toISOString().split('T')[0]

      // Delete approvals
      const deletedApprovals = await prisma.approval.deleteMany({
        where: { expenseId },
      })
      totalApprovals += deletedApprovals.count

      // Delete withdrawal approvals
      const deletedWithdrawalApprovals = await prisma.withdrawalApproval.deleteMany({
        where: { expenseId },
      })
      totalWithdrawalApprovals += deletedWithdrawalApprovals.count

      // Reset expense status and clear rejection fields
      await prisma.expense.update({
        where: { id: expenseId },
        data: {
          status: 'PENDING_APPROVAL',
          rejectedById: null,
          rejectedAt: null,
          rejectionReason: null,
        },
      })

      console.log(`  ✓ Reset: ${date} - ${expense.description}`)
    }

    console.log()
    console.log(`✓ Successfully reset ${selectedExpenseIds.length} expense(s)!`)
    console.log(`  - Deleted ${totalApprovals} approval record(s)`)
    console.log(`  - Deleted ${totalWithdrawalApprovals} withdrawal approval record(s)`)
    console.log(`  - All selected expenses are now PENDING_APPROVAL`)
    console.log()
  } catch (error) {
    console.error()
    console.error('❌ Error resetting expenses:', error instanceof Error ? error.message : error)
    console.error()
  }
}
