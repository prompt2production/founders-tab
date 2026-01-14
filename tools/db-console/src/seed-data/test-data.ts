import { Role, Category, ExpenseStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

export interface TestUser {
  email: string
  name: string
  passwordHash: string
  avatarInitials: string
  role: Role
}

export interface TestExpense {
  ownerIndex: number // Index into testUsers array
  date: Date
  amount: Decimal
  description: string
  category: Category
  status: ExpenseStatus
  receiptUrl: string | null
  notes: string | null
}

// Password hash for "Password123" - bcrypt with 12 rounds
const PASSWORD_HASH = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.AWuJ5mWqTm0rPm'

export const testUsers: TestUser[] = [
  {
    email: 'alice@example.com',
    name: 'Alice Founder',
    passwordHash: PASSWORD_HASH,
    avatarInitials: 'AF',
    role: Role.FOUNDER,
  },
  {
    email: 'bob@example.com',
    name: 'Bob Founder',
    passwordHash: PASSWORD_HASH,
    avatarInitials: 'BF',
    role: Role.FOUNDER,
  },
  {
    email: 'carol@example.com',
    name: 'Carol Founder',
    passwordHash: PASSWORD_HASH,
    avatarInitials: 'CF',
    role: Role.FOUNDER,
  },
]

export function generateTestExpenses(): TestExpense[] {
  const now = new Date()
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  return [
    // PENDING_APPROVAL expenses (need approval from other founders)
    {
      ownerIndex: 0, // Alice
      date: daysAgo(2),
      amount: new Decimal('45.99'),
      description: 'Team lunch meeting',
      category: Category.FOOD,
      status: ExpenseStatus.PENDING_APPROVAL,
      receiptUrl: null,
      notes: 'Discussed Q1 roadmap',
    },
    {
      ownerIndex: 1, // Bob
      date: daysAgo(5),
      amount: new Decimal('199.00'),
      description: 'Annual software subscription',
      category: Category.SOFTWARE,
      status: ExpenseStatus.PENDING_APPROVAL,
      receiptUrl: 'https://example.com/receipts/software.pdf',
      notes: null,
    },
    {
      ownerIndex: 2, // Carol
      date: daysAgo(3),
      amount: new Decimal('75.50'),
      description: 'Uber rides to client meetings',
      category: Category.TRANSPORT,
      status: ExpenseStatus.PENDING_APPROVAL,
      receiptUrl: null,
      notes: '3 trips',
    },

    // APPROVED expenses (fully approved, ready for withdrawal request)
    {
      ownerIndex: 0, // Alice
      date: daysAgo(10),
      amount: new Decimal('350.00'),
      description: 'Conference registration fee',
      category: Category.MARKETING,
      status: ExpenseStatus.APPROVED,
      receiptUrl: 'https://example.com/receipts/conf.pdf',
      notes: 'Tech Summit 2024',
    },
    {
      ownerIndex: 1, // Bob
      date: daysAgo(15),
      amount: new Decimal('89.99'),
      description: 'Office supplies',
      category: Category.OFFICE,
      status: ExpenseStatus.APPROVED,
      receiptUrl: null,
      notes: 'Notebooks, pens, sticky notes',
    },
    {
      ownerIndex: 2, // Carol
      date: daysAgo(12),
      amount: new Decimal('125.00'),
      description: 'Client dinner',
      category: Category.FOOD,
      status: ExpenseStatus.APPROVED,
      receiptUrl: 'https://example.com/receipts/dinner.pdf',
      notes: 'Meeting with potential investor',
    },

    // WITHDRAWAL_REQUESTED expenses (waiting for founder approval)
    {
      ownerIndex: 0, // Alice
      date: daysAgo(20),
      amount: new Decimal('499.00'),
      description: 'Mechanical keyboard',
      category: Category.HARDWARE,
      status: ExpenseStatus.WITHDRAWAL_REQUESTED,
      receiptUrl: 'https://example.com/receipts/keyboard.pdf',
      notes: 'Ergonomic keyboard for long coding sessions',
    },
    {
      ownerIndex: 1, // Bob
      date: daysAgo(18),
      amount: new Decimal('275.00'),
      description: 'Train tickets to partner meeting',
      category: Category.TRAVEL,
      status: ExpenseStatus.WITHDRAWAL_REQUESTED,
      receiptUrl: null,
      notes: 'Round trip to London',
    },

    // WITHDRAWAL_APPROVED expenses (ready for receipt confirmation)
    {
      ownerIndex: 2, // Carol
      date: daysAgo(25),
      amount: new Decimal('150.00'),
      description: 'Legal consultation',
      category: Category.SERVICES,
      status: ExpenseStatus.WITHDRAWAL_APPROVED,
      receiptUrl: 'https://example.com/receipts/legal.pdf',
      notes: 'Initial trademark discussion',
    },
    {
      ownerIndex: 0, // Alice
      date: daysAgo(22),
      amount: new Decimal('65.00'),
      description: 'Domain and hosting',
      category: Category.SOFTWARE,
      status: ExpenseStatus.WITHDRAWAL_APPROVED,
      receiptUrl: null,
      notes: 'Annual renewal',
    },

    // RECEIVED expenses (completed)
    {
      ownerIndex: 1, // Bob
      date: daysAgo(30),
      amount: new Decimal('180.00'),
      description: 'Coworking space day passes',
      category: Category.OFFICE,
      status: ExpenseStatus.RECEIVED,
      receiptUrl: 'https://example.com/receipts/cowork.pdf',
      notes: '6 day passes for team meetings',
    },
    {
      ownerIndex: 2, // Carol
      date: daysAgo(28),
      amount: new Decimal('95.00'),
      description: 'Marketing materials',
      category: Category.MARKETING,
      status: ExpenseStatus.RECEIVED,
      receiptUrl: null,
      notes: 'Business cards and flyers',
    },
    {
      ownerIndex: 0, // Alice
      date: daysAgo(35),
      amount: new Decimal('320.00'),
      description: 'Flight to client site',
      category: Category.TRAVEL,
      status: ExpenseStatus.RECEIVED,
      receiptUrl: 'https://example.com/receipts/flight.pdf',
      notes: 'Manchester trip',
    },
  ]
}
