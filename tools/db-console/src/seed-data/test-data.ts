import { Role, ExpenseStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

// Category enum for backwards compatibility (categories are now dynamic per company)
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
  category: CategoryType
  status: ExpenseStatus
  receiptUrl: string | null
  notes: string | null
}

export interface ExpensePool {
  description: string
  category: CategoryType
  minAmount: number
  maxAmount: number
  receiptUrl: string | null
  notes: string | null
}

// Password hash for "Password123!" - bcrypt with 12 rounds
const PASSWORD_HASH = '$2b$12$SH5/jM0kXLAAz6tpHxn3g.PnIm0YCCXyQO.Zz09LwL2.QvEZsPkwq'

// The three seed users for development
export const seedUsers: SeedUser[] = [
  {
    email: 'chrisroweonline+ftchris@gmail.com',
    name: 'Chris',
    passwordHash: PASSWORD_HASH,
    avatarInitials: 'C',
    role: Role.FOUNDER,
  },
  {
    email: 'chrisroweonline+ftcandice@gmail.com',
    name: 'Candice',
    passwordHash: PASSWORD_HASH,
    avatarInitials: 'C',
    role: Role.FOUNDER,
  },
  {
    email: 'chrisroweonline+ftadrian@gmail.com',
    name: 'Adrian',
    passwordHash: PASSWORD_HASH,
    avatarInitials: 'A',
    role: Role.FOUNDER,
  },
]

// Extended demo user pool (for when more founders are requested)
export const demoUserPool: SeedUser[] = [
  {
    email: 'chrisroweonline+ftchris@gmail.com',
    name: 'Chris',
    passwordHash: PASSWORD_HASH,
    avatarInitials: 'CH',
    role: Role.FOUNDER,
  },
  {
    email: 'chrisroweonline+ftcandice@gmail.com',
    name: 'Candice',
    passwordHash: PASSWORD_HASH,
    avatarInitials: 'CA',
    role: Role.FOUNDER,
  },
  {
    email: 'chrisroweonline+ftadrian@gmail.com',
    name: 'Adrian',
    passwordHash: PASSWORD_HASH,
    avatarInitials: 'AD',
    role: Role.FOUNDER,
  },
  {
    email: 'chrisroweonline+ftsarah@gmail.com',
    name: 'Sarah',
    passwordHash: PASSWORD_HASH,
    avatarInitials: 'SA',
    role: Role.FOUNDER,
  },
  {
    email: 'chrisroweonline+ftmarcus@gmail.com',
    name: 'Marcus',
    passwordHash: PASSWORD_HASH,
    avatarInitials: 'MA',
    role: Role.FOUNDER,
  },
]

// =============================================
// Realistic startup expense pool by category
// =============================================

export const expensePool: ExpensePool[] = [
  // FOOD - Team meals, coffee meetings, client entertainment
  { description: 'Team lunch - strategy session', category: Category.FOOD, minAmount: 25, maxAmount: 65, receiptUrl: null, notes: 'Discussed product roadmap' },
  { description: 'Coffee meeting with potential advisor', category: Category.FOOD, minAmount: 8, maxAmount: 18, receiptUrl: null, notes: null },
  { description: 'Client dinner - partnership discussion', category: Category.FOOD, minAmount: 80, maxAmount: 180, receiptUrl: 'https://example.com/receipts/dinner.pdf', notes: 'Promising lead, follow-up scheduled' },
  { description: 'Working lunch - sprint planning', category: Category.FOOD, minAmount: 30, maxAmount: 55, receiptUrl: null, notes: 'Q1 sprint planning with team' },
  { description: 'Snacks and drinks for team meeting', category: Category.FOOD, minAmount: 12, maxAmount: 35, receiptUrl: null, notes: null },
  { description: 'Investor lunch meeting', category: Category.FOOD, minAmount: 60, maxAmount: 150, receiptUrl: 'https://example.com/receipts/investor-lunch.pdf', notes: 'Met with angel investor' },
  { description: 'Team breakfast - product launch prep', category: Category.FOOD, minAmount: 20, maxAmount: 45, receiptUrl: null, notes: 'Early morning session' },
  { description: 'Coffee for late night coding session', category: Category.FOOD, minAmount: 6, maxAmount: 15, receiptUrl: null, notes: null },
  { description: 'Pizza for hackathon night', category: Category.FOOD, minAmount: 25, maxAmount: 50, receiptUrl: null, notes: 'Built the MVP dashboard' },
  { description: 'Team celebration dinner', category: Category.FOOD, minAmount: 90, maxAmount: 200, receiptUrl: 'https://example.com/receipts/celebration.pdf', notes: 'First paying customer milestone' },

  // TRANSPORT - Getting to meetings, events
  { description: 'Uber to client meeting', category: Category.TRANSPORT, minAmount: 12, maxAmount: 35, receiptUrl: null, notes: null },
  { description: 'Train ticket - London pitch meeting', category: Category.TRANSPORT, minAmount: 45, maxAmount: 120, receiptUrl: 'https://example.com/receipts/train.pdf', notes: 'Return ticket' },
  { description: 'Taxi from airport', category: Category.TRANSPORT, minAmount: 25, maxAmount: 60, receiptUrl: null, notes: 'Late flight, no public transport' },
  { description: 'Uber rides - networking event', category: Category.TRANSPORT, minAmount: 15, maxAmount: 40, receiptUrl: null, notes: 'Round trip to startup meetup' },
  { description: 'Parking - co-working space', category: Category.TRANSPORT, minAmount: 5, maxAmount: 15, receiptUrl: null, notes: null },
  { description: 'Train to partner office', category: Category.TRANSPORT, minAmount: 20, maxAmount: 65, receiptUrl: null, notes: 'Monthly in-person sync' },
  { description: 'Uber to demo day venue', category: Category.TRANSPORT, minAmount: 10, maxAmount: 30, receiptUrl: null, notes: null },
  { description: 'Congestion charge - central London', category: Category.TRANSPORT, minAmount: 15, maxAmount: 15, receiptUrl: null, notes: null },

  // SOFTWARE - SaaS subscriptions, dev tools
  { description: 'GitHub Team plan - monthly', category: Category.SOFTWARE, minAmount: 19, maxAmount: 44, receiptUrl: 'https://example.com/receipts/github.pdf', notes: 'Team plan for 3 seats' },
  { description: 'Figma Professional - monthly', category: Category.SOFTWARE, minAmount: 12, maxAmount: 15, receiptUrl: null, notes: 'Design tool subscription' },
  { description: 'Vercel Pro plan - monthly', category: Category.SOFTWARE, minAmount: 20, maxAmount: 20, receiptUrl: null, notes: 'Hosting and deployment' },
  { description: 'Notion Team plan - monthly', category: Category.SOFTWARE, minAmount: 8, maxAmount: 10, receiptUrl: null, notes: 'Project management' },
  { description: 'Slack Pro - monthly', category: Category.SOFTWARE, minAmount: 7, maxAmount: 8, receiptUrl: null, notes: 'Per-user plan' },
  { description: 'AWS monthly bill', category: Category.SOFTWARE, minAmount: 30, maxAmount: 150, receiptUrl: 'https://example.com/receipts/aws.pdf', notes: 'EC2 + RDS + S3' },
  { description: 'Domain registration - founderstab.com', category: Category.SOFTWARE, minAmount: 10, maxAmount: 25, receiptUrl: null, notes: 'Annual renewal' },
  { description: 'Google Workspace - monthly', category: Category.SOFTWARE, minAmount: 6, maxAmount: 12, receiptUrl: null, notes: 'Business email and docs' },
  { description: 'Linear subscription - monthly', category: Category.SOFTWARE, minAmount: 8, maxAmount: 10, receiptUrl: null, notes: 'Issue tracking' },
  { description: 'Stripe Atlas subscription fee', category: Category.SOFTWARE, minAmount: 0, maxAmount: 0, receiptUrl: null, notes: 'Company formation platform' },
  { description: 'PostHog analytics - monthly', category: Category.SOFTWARE, minAmount: 0, maxAmount: 50, receiptUrl: null, notes: 'Product analytics' },
  { description: 'Resend email service - monthly', category: Category.SOFTWARE, minAmount: 0, maxAmount: 20, receiptUrl: null, notes: 'Transactional emails' },
  { description: 'SSL certificate renewal', category: Category.SOFTWARE, minAmount: 15, maxAmount: 50, receiptUrl: null, notes: 'Annual wildcard cert' },
  { description: '1Password Teams - monthly', category: Category.SOFTWARE, minAmount: 20, maxAmount: 30, receiptUrl: null, notes: 'Password management' },

  // HARDWARE - Equipment for the team
  { description: 'Mechanical keyboard', category: Category.HARDWARE, minAmount: 80, maxAmount: 250, receiptUrl: 'https://example.com/receipts/keyboard.pdf', notes: 'Ergonomic keyboard for long coding sessions' },
  { description: 'USB-C hub and cables', category: Category.HARDWARE, minAmount: 25, maxAmount: 60, receiptUrl: null, notes: null },
  { description: 'External monitor - 27 inch', category: Category.HARDWARE, minAmount: 250, maxAmount: 450, receiptUrl: 'https://example.com/receipts/monitor.pdf', notes: 'Second screen for productivity' },
  { description: 'Wireless mouse', category: Category.HARDWARE, minAmount: 25, maxAmount: 80, receiptUrl: null, notes: null },
  { description: 'Noise-cancelling headphones', category: Category.HARDWARE, minAmount: 150, maxAmount: 350, receiptUrl: 'https://example.com/receipts/headphones.pdf', notes: 'For working in coffee shops and co-working' },
  { description: 'Webcam for video calls', category: Category.HARDWARE, minAmount: 50, maxAmount: 120, receiptUrl: null, notes: 'HD webcam for investor calls' },
  { description: 'Phone charger and cable', category: Category.HARDWARE, minAmount: 15, maxAmount: 35, receiptUrl: null, notes: null },
  { description: 'Laptop stand', category: Category.HARDWARE, minAmount: 25, maxAmount: 65, receiptUrl: null, notes: 'Ergonomic setup' },
  { description: 'Portable SSD - 1TB', category: Category.HARDWARE, minAmount: 60, maxAmount: 120, receiptUrl: null, notes: 'Backup drive' },

  // OFFICE - Workspace, supplies
  { description: 'Co-working space day pass', category: Category.OFFICE, minAmount: 20, maxAmount: 35, receiptUrl: null, notes: null },
  { description: 'Co-working space monthly hot desk', category: Category.OFFICE, minAmount: 150, maxAmount: 300, receiptUrl: 'https://example.com/receipts/cowork.pdf', notes: 'Monthly membership' },
  { description: 'Stationery and notebooks', category: Category.OFFICE, minAmount: 10, maxAmount: 30, receiptUrl: null, notes: null },
  { description: 'Whiteboard and markers', category: Category.OFFICE, minAmount: 25, maxAmount: 60, receiptUrl: null, notes: 'For brainstorming sessions' },
  { description: 'Printer ink cartridges', category: Category.OFFICE, minAmount: 20, maxAmount: 50, receiptUrl: null, notes: null },
  { description: 'Meeting room hire - 4 hours', category: Category.OFFICE, minAmount: 40, maxAmount: 100, receiptUrl: null, notes: 'Board meeting room' },
  { description: 'Desk lamp', category: Category.OFFICE, minAmount: 20, maxAmount: 45, receiptUrl: null, notes: null },
  { description: 'Filing cabinet', category: Category.OFFICE, minAmount: 50, maxAmount: 120, receiptUrl: null, notes: 'For keeping receipts and contracts organised' },

  // TRAVEL - Business trips
  { description: 'Flight to client site - Manchester', category: Category.TRAVEL, minAmount: 80, maxAmount: 200, receiptUrl: 'https://example.com/receipts/flight-man.pdf', notes: 'Return flight' },
  { description: 'Hotel - 2 nights for conference', category: Category.TRAVEL, minAmount: 200, maxAmount: 400, receiptUrl: 'https://example.com/receipts/hotel.pdf', notes: 'Tech conference accommodation' },
  { description: 'Flight to Berlin - partner meeting', category: Category.TRAVEL, minAmount: 120, maxAmount: 300, receiptUrl: 'https://example.com/receipts/flight-ber.pdf', notes: 'International partner discussion' },
  { description: 'Hotel - overnight for pitch event', category: Category.TRAVEL, minAmount: 90, maxAmount: 180, receiptUrl: 'https://example.com/receipts/hotel-pitch.pdf', notes: 'Startup pitch competition' },
  { description: 'Airbnb - 3 nights team retreat', category: Category.TRAVEL, minAmount: 250, maxAmount: 500, receiptUrl: 'https://example.com/receipts/airbnb.pdf', notes: 'Quarterly team offsite' },
  { description: 'Travel insurance - business trip', category: Category.TRAVEL, minAmount: 20, maxAmount: 50, receiptUrl: null, notes: null },

  // MARKETING - Promotion, branding, events
  { description: 'Business cards - 500 qty', category: Category.MARKETING, minAmount: 25, maxAmount: 60, receiptUrl: null, notes: 'For networking events' },
  { description: 'Facebook/Instagram ads - monthly', category: Category.MARKETING, minAmount: 50, maxAmount: 200, receiptUrl: null, notes: 'Lead generation campaign' },
  { description: 'Google Ads credit - monthly', category: Category.MARKETING, minAmount: 100, maxAmount: 300, receiptUrl: 'https://example.com/receipts/google-ads.pdf', notes: 'Search and display campaigns' },
  { description: 'Conference sponsorship booth', category: Category.MARKETING, minAmount: 300, maxAmount: 800, receiptUrl: 'https://example.com/receipts/conf-sponsor.pdf', notes: 'Startup expo booth' },
  { description: 'Branded t-shirts for team', category: Category.MARKETING, minAmount: 80, maxAmount: 200, receiptUrl: null, notes: '10 shirts with company logo' },
  { description: 'Logo design - freelancer', category: Category.MARKETING, minAmount: 150, maxAmount: 500, receiptUrl: 'https://example.com/receipts/logo.pdf', notes: 'Brand identity design' },
  { description: 'Promotional flyers - 1000 qty', category: Category.MARKETING, minAmount: 40, maxAmount: 100, receiptUrl: null, notes: 'For event handout' },
  { description: 'LinkedIn Premium - monthly', category: Category.MARKETING, minAmount: 30, maxAmount: 60, receiptUrl: null, notes: 'Lead generation and networking' },
  { description: 'Event ticket - startup networking', category: Category.MARKETING, minAmount: 15, maxAmount: 50, receiptUrl: null, notes: null },
  { description: 'Branded stickers and swag', category: Category.MARKETING, minAmount: 30, maxAmount: 80, receiptUrl: null, notes: 'For meetups and events' },

  // SERVICES - Legal, accounting, consulting
  { description: 'Legal consultation - company formation', category: Category.SERVICES, minAmount: 100, maxAmount: 300, receiptUrl: 'https://example.com/receipts/legal.pdf', notes: 'Initial advice on Ltd structure' },
  { description: 'Accountancy setup fee', category: Category.SERVICES, minAmount: 200, maxAmount: 500, receiptUrl: 'https://example.com/receipts/accountant.pdf', notes: 'Year-end accounts preparation' },
  { description: 'Trademark registration application', category: Category.SERVICES, minAmount: 170, maxAmount: 250, receiptUrl: 'https://example.com/receipts/trademark.pdf', notes: 'UK trademark class 42' },
  { description: 'Freelance developer - UI fixes', category: Category.SERVICES, minAmount: 200, maxAmount: 600, receiptUrl: 'https://example.com/receipts/freelancer.pdf', notes: '8 hours of front-end work' },
  { description: 'Company secretary filing', category: Category.SERVICES, minAmount: 50, maxAmount: 120, receiptUrl: null, notes: 'Annual confirmation statement' },
  { description: 'Data protection registration (ICO)', category: Category.SERVICES, minAmount: 35, maxAmount: 60, receiptUrl: null, notes: 'Annual GDPR registration' },
  { description: 'Freelance copywriter - website', category: Category.SERVICES, minAmount: 150, maxAmount: 400, receiptUrl: null, notes: 'Homepage and about page copy' },
  { description: 'Patent preliminary search', category: Category.SERVICES, minAmount: 200, maxAmount: 500, receiptUrl: 'https://example.com/receipts/patent-search.pdf', notes: 'Prior art search for core algorithm' },

  // OTHER - Miscellaneous
  { description: 'Book - Zero to One (Peter Thiel)', category: Category.OTHER, minAmount: 10, maxAmount: 15, receiptUrl: null, notes: 'Team reading' },
  { description: 'Online course - product management', category: Category.OTHER, minAmount: 30, maxAmount: 100, receiptUrl: null, notes: 'Udemy course' },
  { description: 'Stock photos - annual plan', category: Category.OTHER, minAmount: 50, maxAmount: 120, receiptUrl: null, notes: 'For website and marketing' },
  { description: 'Gifts for early beta testers', category: Category.OTHER, minAmount: 30, maxAmount: 80, receiptUrl: null, notes: 'Thank you gifts' },
  { description: 'Emergency phone screen repair', category: Category.OTHER, minAmount: 80, maxAmount: 200, receiptUrl: null, notes: 'Work phone cracked screen' },
]

// Rejection reasons pool
export const rejectionReasons: string[] = [
  'Receipt missing - please upload before resubmitting',
  'Amount doesn\'t match the receipt provided',
  'This looks like a personal expense, not business-related',
  'Please split this into separate expenses by category',
  'Duplicate submission - already claimed on another expense',
  'Need more detail in the description',
  'Exceeds the agreed budget for this category',
  'Please provide the vendor invoice instead of bank statement',
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

// Helper to get a random number between min and max
export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Helper to get a random amount between min and max, rounded to 2 decimals
export function randomAmount(min: number, max: number): string {
  const amount = min + Math.random() * (max - min)
  return amount.toFixed(2)
}

// Helper to pick a random item from an array
export function randomPick<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

// Helper to shuffle an array (Fisher-Yates)
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
