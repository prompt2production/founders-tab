/**
 * Data migration script to seed default categories for existing companies
 * Run with: npx tsx prisma/seed-categories.ts
 */

import { PrismaClient } from '@prisma/client'

const DEFAULT_CATEGORIES = [
  { value: 'FOOD', label: 'Food & Dining', icon: 'Utensils' },
  { value: 'TRANSPORT', label: 'Transport', icon: 'Car' },
  { value: 'SOFTWARE', label: 'Software', icon: 'Monitor' },
  { value: 'HARDWARE', label: 'Hardware', icon: 'Laptop' },
  { value: 'OFFICE', label: 'Office', icon: 'Building' },
  { value: 'TRAVEL', label: 'Travel', icon: 'Plane' },
  { value: 'MARKETING', label: 'Marketing', icon: 'Megaphone' },
  { value: 'SERVICES', label: 'Services', icon: 'Briefcase' },
  { value: 'OTHER', label: 'Other', icon: 'MoreHorizontal' },
]

const prisma = new PrismaClient()

async function main() {
  console.log('Starting category seeding for existing companies...')

  // Get all companies that don't have any categories yet
  const companiesWithoutCategories = await prisma.company.findMany({
    where: {
      categories: {
        none: {},
      },
    },
    select: {
      id: true,
      name: true,
    },
  })

  console.log(`Found ${companiesWithoutCategories.length} companies without categories`)

  for (const company of companiesWithoutCategories) {
    console.log(`Seeding categories for company: ${company.id} (${company.name || 'unnamed'})`)

    await prisma.companyCategory.createMany({
      data: DEFAULT_CATEGORIES.map((category, index) => ({
        companyId: company.id,
        value: category.value,
        label: category.label,
        icon: category.icon,
        isDefault: true,
        isActive: true,
        sortOrder: index,
      })),
    })
  }

  console.log('Category seeding complete!')
}

main()
  .catch((e) => {
    console.error('Error seeding categories:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
