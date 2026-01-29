import { PrismaClient } from '@prisma/client'
import { Environment, environmentDisplayNames } from '../config.js'

export async function listPrimaryUsersCommand(prisma: PrismaClient, environment: Environment): Promise<void> {
  console.log()
  console.log('List Primary Users (Registered)')
  console.log('────────────────────────────────')
  console.log()

  // Primary users are those who registered directly (not via invitation)
  // They will NOT have an invitation record where they are the acceptedBy user
  const primaryUsers = await prisma.user.findMany({
    where: {
      invitation: null, // No invitation record pointing to this user
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          invitationsSent: true,
          expenses: true,
        },
      },
    },
  })

  if (primaryUsers.length === 0) {
    console.log('No primary (registered) users found.')
    console.log()
    return
  }

  console.log(`Found ${primaryUsers.length} primary user(s) in ${environmentDisplayNames[environment]}:`)
  console.log()

  // Display users in a table-like format
  console.log('┌────────────────────────────────────────────────────────────────────────────────────────────────┐')
  console.log('│ #  │ Name                 │ Email                          │ Role    │ Invites │ Expenses    │')
  console.log('├────────────────────────────────────────────────────────────────────────────────────────────────┤')

  primaryUsers.forEach((user, index) => {
    const num = String(index + 1).padStart(2)
    const name = user.name.slice(0, 20).padEnd(20)
    const email = user.email.slice(0, 30).padEnd(30)
    const role = user.role.padEnd(7)
    const invites = String(user._count.invitationsSent).padStart(7)
    const expenses = String(user._count.expenses).padStart(8)

    console.log(`│ ${num} │ ${name} │ ${email} │ ${role} │ ${invites} │ ${expenses}    │`)
  })

  console.log('└────────────────────────────────────────────────────────────────────────────────────────────────┘')
  console.log()

  // Show summary
  const totalInvitesSent = primaryUsers.reduce((sum, u) => sum + u._count.invitationsSent, 0)
  const totalExpenses = primaryUsers.reduce((sum, u) => sum + u._count.expenses, 0)
  const founderCount = primaryUsers.filter(u => u.role === 'FOUNDER').length
  const memberCount = primaryUsers.filter(u => u.role === 'MEMBER').length

  console.log('Summary:')
  console.log(`  • ${primaryUsers.length} primary user(s) who registered directly`)
  console.log(`  • ${founderCount} founder(s), ${memberCount} member(s)`)
  console.log(`  • ${totalInvitesSent} invitation(s) sent by these users`)
  console.log(`  • ${totalExpenses} expense(s) submitted by these users`)
  console.log()

  // Also show invited users count for context
  const invitedUsersCount = await prisma.user.count({
    where: {
      invitation: { isNot: null },
    },
  })

  if (invitedUsersCount > 0) {
    console.log(`Note: There are also ${invitedUsersCount} user(s) who joined via invitation.`)
    console.log()
  }
}
