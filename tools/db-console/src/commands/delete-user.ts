import { PrismaClient } from '@prisma/client'
import { Environment, environmentDisplayNames } from '../config.js'
import { confirm, selectOption, askQuestion } from '../prompts.js'

export async function deleteUserCommand(prisma: PrismaClient, environment: Environment): Promise<void> {
  console.log()
  console.log('Delete User')
  console.log('───────────')

  // Fetch all users
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      _count: {
        select: {
          expenses: true,
          approvals: true,
          withdrawalApprovals: true,
          sessions: true,
        },
      },
    },
  })

  if (users.length === 0) {
    console.log('No users found in the database.')
    return
  }

  console.log()
  console.log(`Found ${users.length} user(s):`)
  console.log()

  // Build options for selection
  const options = users.map((user) => ({
    value: user.id,
    label: `${user.name} (${user.email}) - ${user.role} - ${user._count.expenses} expenses, ${user._count.approvals} approvals`,
  }))

  // Add cancel option
  options.push({ value: 'cancel', label: 'Cancel - go back to menu' })

  const selectedId = await selectOption<string>(
    'Select a user to delete:',
    options
  )

  if (selectedId === 'cancel') {
    console.log('Operation cancelled.')
    return
  }

  const selectedUser = users.find((u) => u.id === selectedId)
  if (!selectedUser) {
    console.log('User not found.')
    return
  }

  // Show what will be deleted
  console.log()
  console.log('⚠️  WARNING: This will delete the following:')
  console.log(`   User: ${selectedUser.name} (${selectedUser.email})`)
  console.log(`   Environment: ${environmentDisplayNames[environment]}`)
  console.log()
  console.log('   Related data that will also be deleted:')
  console.log(`   - ${selectedUser._count.expenses} expense(s)`)
  console.log(`   - ${selectedUser._count.approvals} approval(s)`)
  console.log(`   - ${selectedUser._count.withdrawalApprovals} withdrawal approval(s)`)
  console.log(`   - ${selectedUser._count.sessions} session(s)`)
  console.log('   - All password reset tokens')
  console.log('   - All invitations sent by this user')
  console.log()

  const confirmed = await confirm('Are you sure you want to delete this user and all related data?')

  if (!confirmed) {
    console.log('Operation cancelled.')
    return
  }

  // Extra confirmation for production
  if (environment === 'production') {
    console.log()
    console.log('🚨 PRODUCTION ENVIRONMENT DETECTED!')
    console.log(`   Type the user's email to confirm deletion: ${selectedUser.email}`)
    console.log()

    const confirmText = await askQuestion('> ')

    if (confirmText !== selectedUser.email) {
      console.log('Email did not match. Operation cancelled.')
      return
    }
  }

  console.log()
  console.log('Deleting user and related data...')

  try {
    // Delete invitations where this user was the inviter
    // (invitations they sent)
    console.log('  Deleting invitations sent by user...')
    const sentInvitations = await prisma.invitation.deleteMany({
      where: { invitedById: selectedId },
    })
    console.log(`    ✓ Deleted ${sentInvitations.count} sent invitation(s)`)

    // Clear acceptedById for any invitations this user accepted
    // (so the invitation record can remain for audit, but without the user reference)
    console.log('  Clearing accepted invitation references...')
    const acceptedInvitations = await prisma.invitation.updateMany({
      where: { acceptedById: selectedId },
      data: { acceptedById: null },
    })
    console.log(`    ✓ Cleared ${acceptedInvitations.count} accepted invitation reference(s)`)

    // Now delete the user - Prisma cascade will handle:
    // - Sessions
    // - PasswordResets
    // - Expenses (and their approvals/withdrawal approvals via cascade)
    // - Approvals (where this user approved someone else's expense)
    // - WithdrawalApprovals (where this user approved someone else's withdrawal)
    console.log('  Deleting user (cascades to expenses, sessions, approvals, etc.)...')
    await prisma.user.delete({
      where: { id: selectedId },
    })
    console.log('    ✓ User deleted')

    console.log()
    console.log(`✓ User "${selectedUser.name}" and all related data have been deleted successfully!`)
    console.log()
  } catch (error) {
    console.error()
    console.error('❌ Error deleting user:', error instanceof Error ? error.message : error)
    console.error()
  }
}
