import { PrismaClient } from '@prisma/client'
import { Environment, environmentDisplayNames } from '../config.js'
import { confirm } from '../prompts.js'
import { seedUsers } from '../seed-data/test-data.js'

export async function seedUsersCommand(prisma: PrismaClient, environment: Environment): Promise<void> {
  console.log()

  // Block production seeding
  if (environment === 'production') {
    console.log('❌ ERROR: Seeding users is not allowed in Production environment!')
    console.log('   This operation has been blocked for safety.')
    console.log()
    return
  }

  console.log(`Seed users into ${environmentDisplayNames[environment]}?`)
  console.log()
  console.log('The following users will be created (if they don\'t exist):')
  for (const user of seedUsers) {
    console.log(`  - ${user.name} (${user.email})`)
  }
  console.log()

  const confirmed = await confirm('Continue?')

  if (!confirmed) {
    console.log('Operation cancelled.')
    return
  }

  console.log()
  console.log('Seeding users...')

  let created = 0
  let skipped = 0

  try {
    for (const user of seedUsers) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      })

      if (existingUser) {
        console.log(`  ⏭️  Skipped ${user.name} (${user.email}) - already exists`)
        skipped++
      } else {
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            passwordHash: user.passwordHash,
            avatarInitials: user.avatarInitials,
            role: user.role,
          },
        })
        console.log(`  ✓ Created ${user.name} (${user.email})`)
        created++
      }
    }

    console.log()
    console.log('✓ User seeding complete!')
    console.log()
    console.log('Summary:')
    console.log(`  - ${created} user${created !== 1 ? 's' : ''} created`)
    console.log(`  - ${skipped} user${skipped !== 1 ? 's' : ''} skipped (already existed)`)
    console.log()
    console.log('All users have password: Password123!')
    console.log()
  } catch (error) {
    console.error()
    console.error('❌ Error seeding users:', error instanceof Error ? error.message : error)
    console.error()
  }
}
