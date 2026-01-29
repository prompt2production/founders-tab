import { PrismaClient } from '@prisma/client'
import { Environment, environmentDisplayNames } from '../config.js'
import { confirm } from '../prompts.js'

export async function migrateMultiTenantCommand(prisma: PrismaClient, environment: Environment): Promise<void> {
  console.log()
  console.log('╔══════════════════════════════════════╗')
  console.log('║    Migrate to Multi-Tenant           ║')
  console.log('╚══════════════════════════════════════╝')
  console.log()
  console.log('This command will migrate existing data to support multi-tenancy:')
  console.log()
  console.log('  1. Create a Company record from existing CompanySettings')
  console.log('  2. Link all existing users to that company')
  console.log('  3. Link all existing invitations to that company')
  console.log()
  console.log(`Environment: ${environmentDisplayNames[environment]}`)
  console.log()

  // Check current state
  const existingCompanies = await prisma.company.count()
  const usersWithoutCompany = await prisma.user.count({ where: { companyId: null } })
  const invitationsWithoutCompany = await prisma.invitation.count({ where: { companyId: null } })
  const totalUsers = await prisma.user.count()
  const totalInvitations = await prisma.invitation.count()

  console.log('Current state:')
  console.log(`  Companies: ${existingCompanies}`)
  console.log(`  Users without company: ${usersWithoutCompany} / ${totalUsers}`)
  console.log(`  Invitations without company: ${invitationsWithoutCompany} / ${totalInvitations}`)
  console.log()

  if (usersWithoutCompany === 0 && invitationsWithoutCompany === 0) {
    console.log('✓ All records already have companyId set. Nothing to migrate.')
    console.log()
    return
  }

  const confirmed = await confirm('Proceed with migration?')
  if (!confirmed) {
    console.log('Operation cancelled.')
    return
  }

  console.log()
  console.log('Starting migration...')
  console.log()

  try {
    // Step 1: Get or create Company from CompanySettings
    let company = await prisma.company.findFirst()

    if (!company) {
      console.log('Step 1: Creating Company record...')

      // Try to get existing CompanySettings
      const settings = await prisma.companySettings.findFirst()

      company = await prisma.company.create({
        data: {
          name: settings?.name ?? '',
          currency: settings?.currency ?? 'USD',
        },
      })

      console.log(`  ✓ Created company "${company.name || '(unnamed)'}" with currency ${company.currency}`)
      console.log(`  Company ID: ${company.id}`)
    } else {
      console.log('Step 1: Using existing Company record')
      console.log(`  Company: "${company.name || '(unnamed)'}" (${company.id})`)
    }
    console.log()

    // Step 2: Update users without companyId
    if (usersWithoutCompany > 0) {
      console.log('Step 2: Linking users to company...')

      const result = await prisma.user.updateMany({
        where: { companyId: null },
        data: { companyId: company.id },
      })

      console.log(`  ✓ Updated ${result.count} users`)
    } else {
      console.log('Step 2: All users already linked (skipped)')
    }
    console.log()

    // Step 3: Update invitations without companyId
    if (invitationsWithoutCompany > 0) {
      console.log('Step 3: Linking invitations to company...')

      const result = await prisma.invitation.updateMany({
        where: { companyId: null },
        data: { companyId: company.id },
      })

      console.log(`  ✓ Updated ${result.count} invitations`)
    } else {
      console.log('Step 3: All invitations already linked (skipped)')
    }
    console.log()

    // Verification
    const finalUsersWithoutCompany = await prisma.user.count({ where: { companyId: null } })
    const finalInvitationsWithoutCompany = await prisma.invitation.count({ where: { companyId: null } })

    console.log('═══════════════════════════════════════')
    console.log('  ✓ Migration Complete!')
    console.log('═══════════════════════════════════════')
    console.log()
    console.log('  Final state:')
    console.log(`    Company: "${company.name || '(unnamed)'}"`)
    console.log(`    Users without company: ${finalUsersWithoutCompany}`)
    console.log(`    Invitations without company: ${finalInvitationsWithoutCompany}`)
    console.log()

    if (finalUsersWithoutCompany === 0 && finalInvitationsWithoutCompany === 0) {
      console.log('  ✓ All records now have companyId set.')
      console.log()
      console.log('  NEXT STEPS:')
      console.log('  1. Run: npx prisma migrate dev --name make-company-id-required')
      console.log('     to make companyId non-nullable')
      console.log()
    } else {
      console.log('  ⚠️  Some records still missing companyId. Please investigate.')
      console.log()
    }
  } catch (error) {
    console.error()
    console.error('❌ Error during migration:', error instanceof Error ? error.message : error)
    console.error()
  }
}
