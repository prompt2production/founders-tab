import { z } from 'zod'

// ExpenseStatus enum matching Prisma schema
export const ExpenseStatus = {
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  WITHDRAWAL_REQUESTED: 'WITHDRAWAL_REQUESTED',
  WITHDRAWAL_APPROVED: 'WITHDRAWAL_APPROVED',
  WITHDRAWAL_REJECTED: 'WITHDRAWAL_REJECTED',
  RECEIVED: 'RECEIVED',
} as const

export type ExpenseStatusType = (typeof ExpenseStatus)[keyof typeof ExpenseStatus]

const expenseStatusValues = Object.values(ExpenseStatus) as [string, ...string[]]

// Legacy Category enum for backwards compatibility with existing code
// Categories are now dynamic per company, stored in CompanyCategory table
export const Category = {
  FOOD: 'FOOD',
  TRANSPORT: 'TRANSPORT',
  SOFTWARE: 'SOFTWARE',
  HARDWARE: 'HARDWARE',
  OFFICE: 'OFFICE',
  TRAVEL: 'TRAVEL',
  MARKETING: 'MARKETING',
  SERVICES: 'SERVICES',
  OTHER: 'OTHER',
} as const

export type CategoryType = (typeof Category)[keyof typeof Category]

// Helper to check if date is not in the future
const notFutureDate = (date: Date) => {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return date <= today
}

// Helper to check if date is not older than 1 year
const notOlderThanOneYear = (date: Date) => {
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  oneYearAgo.setHours(0, 0, 0, 0)
  return date >= oneYearAgo
}

// Helper to check decimal places
const hasMaxTwoDecimalPlaces = (value: number) => {
  const decimalStr = value.toString()
  const decimalIndex = decimalStr.indexOf('.')
  if (decimalIndex === -1) return true
  return decimalStr.length - decimalIndex - 1 <= 2
}

// Create expense schema
// Note: category is now a string that will be validated against company categories at the API level
export const createExpenseSchema = z.object({
  date: z
    .string()
    .or(z.date())
    .transform((val) => (typeof val === 'string' ? new Date(val) : val))
    .refine((date) => !isNaN(date.getTime()), {
      message: 'Invalid date',
    })
    .refine(notFutureDate, {
      message: 'Date cannot be in the future',
    })
    .refine(notOlderThanOneYear, {
      message: 'Date cannot be more than 1 year in the past',
    }),
  amount: z
    .number()
    .positive({ message: 'Amount must be positive' })
    .max(999999.99, { message: 'Amount cannot exceed $999,999.99' })
    .refine(hasMaxTwoDecimalPlaces, {
      message: 'Amount cannot have more than 2 decimal places',
    }),
  description: z
    .string()
    .min(1, { message: 'Description is required' })
    .max(200, { message: 'Description cannot exceed 200 characters' })
    .transform((val) => val.trim()),
  category: z
    .string()
    .min(1, { message: 'Category is required' })
    .max(50, { message: 'Category cannot exceed 50 characters' }),
  receiptUrl: z
    .string()
    .refine(
      (val) => val === '' || val.startsWith('/uploads/') || val.startsWith('http://') || val.startsWith('https://'),
      { message: 'Invalid receipt URL' }
    )
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(500, { message: 'Notes cannot exceed 500 characters' })
    .optional()
    .transform((val) => val?.trim() || undefined),
})

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>

// Update expense schema - all fields optional for partial updates
// Note: category is now a string that will be validated against company categories at the API level
export const updateExpenseSchema = z.object({
  date: z
    .string()
    .or(z.date())
    .transform((val) => (typeof val === 'string' ? new Date(val) : val))
    .refine((date) => !isNaN(date.getTime()), {
      message: 'Invalid date',
    })
    .refine(notFutureDate, {
      message: 'Date cannot be in the future',
    })
    .refine(notOlderThanOneYear, {
      message: 'Date cannot be more than 1 year in the past',
    })
    .optional(),
  amount: z
    .number()
    .positive({ message: 'Amount must be positive' })
    .max(999999.99, { message: 'Amount cannot exceed $999,999.99' })
    .refine(hasMaxTwoDecimalPlaces, {
      message: 'Amount cannot have more than 2 decimal places',
    })
    .optional(),
  description: z
    .string()
    .min(1, { message: 'Description is required' })
    .max(200, { message: 'Description cannot exceed 200 characters' })
    .transform((val) => val.trim())
    .optional(),
  category: z
    .string()
    .min(1, { message: 'Category is required' })
    .max(50, { message: 'Category cannot exceed 50 characters' })
    .optional(),
  receiptUrl: z
    .string()
    .refine(
      (val) => val === '' || val.startsWith('/uploads/') || val.startsWith('http://') || val.startsWith('https://'),
      { message: 'Invalid receipt URL' }
    )
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(500, { message: 'Notes cannot exceed 500 characters' })
    .transform((val) => val?.trim() || undefined)
    .optional()
    .nullable(),
})

export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>

// List expenses query schema
// Note: category is now a string that will be validated against company categories at the API level
export const listExpensesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.string().optional(),
  userId: z.string().optional(),
  status: z.enum(expenseStatusValues).optional(),
  startDate: z
    .string()
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), {
      message: 'Invalid start date',
    })
    .optional(),
  endDate: z
    .string()
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), {
      message: 'Invalid end date',
    })
    .optional(),
})

export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>

// Reject expense schema
export const rejectExpenseSchema = z.object({
  reason: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(1, { message: 'Rejection reason is required' })
        .max(500, { message: 'Rejection reason cannot exceed 500 characters' })
    ),
})

export type RejectExpenseInput = z.infer<typeof rejectExpenseSchema>
