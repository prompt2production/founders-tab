import { prisma } from '@/lib/prisma'

/**
 * Get all user IDs belonging to a company
 */
export async function getCompanyUserIds(companyId: string): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: { companyId },
    select: { id: true },
  })
  return users.map((u) => u.id)
}

/**
 * Check if a user belongs to the same company as the current user
 */
export async function isInSameCompany(
  currentUserCompanyId: string,
  targetUserId: string
): Promise<boolean> {
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { companyId: true },
  })
  return targetUser?.companyId === currentUserCompanyId
}

/**
 * Check if an expense belongs to a user in the same company
 */
export async function isExpenseInCompany(
  companyId: string,
  expenseId: string
): Promise<boolean> {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      user: {
        select: { companyId: true },
      },
    },
  })
  return expense?.user?.companyId === companyId
}

/**
 * Get the count of founders in a company (excluding a specific user)
 */
export async function getOtherFoundersCount(
  companyId: string,
  excludeUserId: string
): Promise<number> {
  return prisma.user.count({
    where: {
      companyId,
      role: 'FOUNDER',
      id: { not: excludeUserId },
    },
  })
}

/**
 * Get the total count of founders in a company
 */
export async function getFoundersCount(companyId: string): Promise<number> {
  return prisma.user.count({
    where: {
      companyId,
      role: 'FOUNDER',
    },
  })
}
