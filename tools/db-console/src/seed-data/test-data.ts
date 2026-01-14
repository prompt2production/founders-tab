import { Role, Category, ExpenseStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

export interface SeedUser {
  email: string
  name: string
  passwordHash: string
  avatarInitials: string
  role: Role
}

export interface ExpenseTemplate {
  daysAgo: number
  amount: string
  description: string
  category: Category
  status: ExpenseStatus
  receiptUrl: string | null
  notes: string | null
}

// Password hash for "Password123!" - bcrypt with 12 rounds
const PASSWORD_HASH = '$2b$12$SH5/jM0kXLAAz6tpHxn3g.PnIm0YCCXyQO.Zz09LwL2.QvEZsPkwq'

// The three seed users for development
export const seedUsers: SeedUser[] = [
  {
    email: 'chris@founderstab.com',
    name: 'Chris',
    passwordHash: PASSWORD_HASH,
    avatarInitials: 'C',
    role: Role.FOUNDER,
  },
  {
    email: 'candice@founderstab.com',
    name: 'Candice',
    passwordHash: PASSWORD_HASH,
    avatarInitials: 'C',
    role: Role.FOUNDER,
  },
  {
    email: 'adrian@founderstab.com',
    name: 'Adrian',
    passwordHash: PASSWORD_HASH,
    avatarInitials: 'A',
    role: Role.FOUNDER,
  },
]

// Expense templates for dynamic seeding (will be distributed across existing users)
export const expenseTemplates: ExpenseTemplate[] = [
  // PENDING_APPROVAL expenses (need approval from other founders)
  {
    daysAgo: 2,
    amount: '45.99',
    description: 'Team lunch meeting',
    category: Category.FOOD,
    status: ExpenseStatus.PENDING_APPROVAL,
    receiptUrl: null,
    notes: 'Discussed Q1 roadmap',
  },
  {
    daysAgo: 5,
    amount: '199.00',
    description: 'Annual software subscription',
    category: Category.SOFTWARE,
    status: ExpenseStatus.PENDING_APPROVAL,
    receiptUrl: 'https://example.com/receipts/software.pdf',
    notes: null,
  },
  {
    daysAgo: 3,
    amount: '75.50',
    description: 'Uber rides to client meetings',
    category: Category.TRANSPORT,
    status: ExpenseStatus.PENDING_APPROVAL,
    receiptUrl: null,
    notes: '3 trips',
  },

  // APPROVED expenses (fully approved, ready for withdrawal request)
  {
    daysAgo: 10,
    amount: '350.00',
    description: 'Conference registration fee',
    category: Category.MARKETING,
    status: ExpenseStatus.APPROVED,
    receiptUrl: 'https://example.com/receipts/conf.pdf',
    notes: 'Tech Summit 2024',
  },
  {
    daysAgo: 15,
    amount: '89.99',
    description: 'Office supplies',
    category: Category.OFFICE,
    status: ExpenseStatus.APPROVED,
    receiptUrl: null,
    notes: 'Notebooks, pens, sticky notes',
  },
  {
    daysAgo: 12,
    amount: '125.00',
    description: 'Client dinner',
    category: Category.FOOD,
    status: ExpenseStatus.APPROVED,
    receiptUrl: 'https://example.com/receipts/dinner.pdf',
    notes: 'Meeting with potential investor',
  },

  // WITHDRAWAL_REQUESTED expenses (waiting for founder approval)
  {
    daysAgo: 20,
    amount: '499.00',
    description: 'Mechanical keyboard',
    category: Category.HARDWARE,
    status: ExpenseStatus.WITHDRAWAL_REQUESTED,
    receiptUrl: 'https://example.com/receipts/keyboard.pdf',
    notes: 'Ergonomic keyboard for long coding sessions',
  },
  {
    daysAgo: 18,
    amount: '275.00',
    description: 'Train tickets to partner meeting',
    category: Category.TRAVEL,
    status: ExpenseStatus.WITHDRAWAL_REQUESTED,
    receiptUrl: null,
    notes: 'Round trip to London',
  },

  // WITHDRAWAL_APPROVED expenses (ready for receipt confirmation)
  {
    daysAgo: 25,
    amount: '150.00',
    description: 'Legal consultation',
    category: Category.SERVICES,
    status: ExpenseStatus.WITHDRAWAL_APPROVED,
    receiptUrl: 'https://example.com/receipts/legal.pdf',
    notes: 'Initial trademark discussion',
  },
  {
    daysAgo: 22,
    amount: '65.00',
    description: 'Domain and hosting',
    category: Category.SOFTWARE,
    status: ExpenseStatus.WITHDRAWAL_APPROVED,
    receiptUrl: null,
    notes: 'Annual renewal',
  },

  // RECEIVED expenses (completed)
  {
    daysAgo: 30,
    amount: '180.00',
    description: 'Coworking space day passes',
    category: Category.OFFICE,
    status: ExpenseStatus.RECEIVED,
    receiptUrl: 'https://example.com/receipts/cowork.pdf',
    notes: '6 day passes for team meetings',
  },
  {
    daysAgo: 28,
    amount: '95.00',
    description: 'Marketing materials',
    category: Category.MARKETING,
    status: ExpenseStatus.RECEIVED,
    receiptUrl: null,
    notes: 'Business cards and flyers',
  },
  {
    daysAgo: 35,
    amount: '320.00',
    description: 'Flight to client site',
    category: Category.TRAVEL,
    status: ExpenseStatus.RECEIVED,
    receiptUrl: 'https://example.com/receipts/flight.pdf',
    notes: 'Manchester trip',
  },
]

// Helper to generate date from days ago
export function daysAgo(days: number): Date {
  const now = new Date()
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
}
