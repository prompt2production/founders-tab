# Founders Tab

A simple expense tracking app for co-founders to log business-related expenses incurred on personal accounts before formal company incorporation. Each founder can record their spending, and the app maintains a running tally of what will become directors' loan accounts once the company is established.

**Target Users:** Small groups of co-founders (2-5 people) at the ideation/early POC stage who don't yet have company bank accounts or formal structures.

**Key Problems Solved:**
- Track business expenses across multiple founders' personal accounts
- Maintain clear records for future reimbursement when the company generates income
- Provide transparency on who has spent what for the business
- Create an audit trail that can feed into proper accounting later

## Prompt2Production Workflow

This project uses the Prompt2Production methodology for AI-driven development.

There are three phases: **Project Brief** (one-time) → **Design** (one-time) → **Feature Planning** (repeated).

---

## Phase 0: Project Brief

### Trigger: "Project:"

When the user starts a message with **"Project:"** followed by a description of what they're building, this sets the context for everything that follows.

**Example triggers:**
- "Project: A recipe management app for home cooks. Users can save their favourite recipes, organise them by category, and quickly find what to cook for dinner."
- "Project: Internal tool for our sales team to track leads and customer interactions. Needs to be fast and efficient."
- "Project: Personal finance tracker where users can log expenses, set budgets, and see spending trends."

### What to Do

#### 1. Update this file (`CLAUDE.md`)

Replace the "Project Name" heading and description at the top of this file with:
- The actual project name (infer from description or ask)
- A 2-3 sentence summary of what the project is
- Target audience / users
- Key goals or problems it solves

#### 2. Update the Current Status

Update the "Current Status" section at the bottom to show project brief is complete.

#### 3. Prompt for Next Step

Tell the user the project context is set, and prompt them to define the design system:

> "Project context saved. Next, let's define the look and feel. Tell me: **Design system:** followed by your style preferences, or attach an inspiration image."

---

## Phase 1: Design System

### Trigger: "Design system:"

When the user starts a message with **"Design system:"** followed by a description (and optionally attaches an inspiration image), this triggers the design phase. Use the project context to inform design decisions.

**Example triggers:**
- "Design system: clean, modern dashboard style with dark sidebar and light content area. Blues and grays."
- "Design system: minimal like Linear or Notion. Professional but friendly."
- "Design system: [attaches Dribbble image] I want something like this"

### What to Generate

Use the project context from Phase 0 to inform all design decisions. A recipe app should feel warm and inviting; a finance app should feel trustworthy and precise.

#### 1. Update `DESIGN_SYSTEM.md`

Rewrite the design system document with:
- **Colour palette** — Primary, secondary, neutral, semantic (success/warning/danger)
- **Typography** — Font choices, size scale
- **Spacing** — Consistent spacing scale
- **Border radius** — Rounded corners approach
- **Shadows** — Elevation system
- **Layout** — Sidebar vs top nav, content width, responsive approach
- **Component patterns** — How buttons, cards, forms, tables should look

#### 2. Update `src/app/globals.css`

Update the CSS variables to match the colour palette:
```css
@theme inline {
  --color-primary: /* chosen primary */;
  --color-primary-foreground: /* contrast colour */;
  /* etc */
}
```

#### 3. Create `src/app/design/page.tsx`

Generate a comprehensive reference page showing all UI components styled according to the design system:

- **Typography** — Headings, body text, captions
- **Colours** — Swatches showing the full palette
- **Buttons** — All variants (primary, secondary, outline, ghost, destructive) and sizes
- **Form elements** — Inputs, textareas, selects, checkboxes, radio buttons
- **Cards** — With different content layouts
- **Tables** — With sample data, sortable headers
- **Dialogs/Modals** — Confirmation dialogs, form modals
- **Alerts/Toasts** — Success, error, warning, info states
- **Empty states** — What to show when no data
- **Loading states** — Spinners, skeletons
- **Navigation** — Header/sidebar as per layout choice

Install any shadcn components needed: `npx shadcn@latest add [component]`

#### 4. Update `CLAUDE.md`

Update the "Current Status" section at the bottom to indicate design phase is complete.

### Design Iteration

After generating the initial design system, the user may want refinements. Handle these conversationally:

- "Make the primary colour darker"
- "Try a purple accent instead of blue"
- "I want more rounded corners on everything"
- "Add more shadow depth to the cards"

Update the relevant files (`DESIGN_SYSTEM.md`, `globals.css`, `/design` page) based on feedback.

When the user indicates they're happy (e.g., "design looks good", "let's move on", "ready to build"), confirm the design phase is complete and prompt them to start planning features with "Plan feature:".

---

## Phase 2: Feature Planning

### Trigger: "Plan feature:"

When the user starts a message with **"Plan feature:"** followed by a description, this triggers the feature planning workflow.

**Example triggers:**
- "Plan feature: contact form with name, email, and message fields"
- "Plan feature: user authentication with email/password login"
- "Plan feature: I need a way for users to create and manage tasks"

### What to Generate

For each new feature, create a **feature folder** under `features/`:

```
features/
└── [feature-name]/
    ├── PRD.md        # Product requirements
    ├── prd.json      # User stories for Ralph
    └── progress.txt  # Empty file for Ralph to log iterations
```

**Naming convention:** Use kebab-case for folder names (e.g., `contact-form`, `user-auth`, `task-manager`)

#### 1. Create `features/[feature-name]/PRD.md`

Write detailed product requirements based on the user's description:
- Overview of the feature
- User stories in plain English
- Detailed requirements (fields, validation, behaviour)
- Database models needed
- API endpoints
- UI/UX requirements (reference DESIGN_SYSTEM.md)

#### 2. Create `features/[feature-name]/prd.json`

Create atomic user stories with clear acceptance criteria:

```json
{
  "feature": "Feature Name",
  "stories": [
    {
      "id": "FEATURE-001",
      "title": "Short title",
      "description": "What this story accomplishes",
      "acceptance_criteria": [
        "Specific, verifiable criterion 1",
        "Specific, verifiable criterion 2"
      ],
      "passes": false
    }
  ]
}
```

**Story guidelines:**
- Each story completable in one iteration (2-5 minutes)
- Include specific file paths in acceptance criteria
- Stories must be verifiable (tests pass, file exists, etc.)
- Sequence: infrastructure → validation → API → components → pages → e2e tests
- Set `"passes": false` for all new stories
- Reference DESIGN_SYSTEM.md for any UI stories

**Story count:**
- Simple feature (CRUD, single page): 5-10 stories
- Medium feature (multiple pages, complex logic): 10-20 stories
- Complex feature (auth, integrations): 20-30 stories

#### 3. Create `features/[feature-name]/progress.txt`

Create an empty file. Ralph will append iteration logs here.

#### 4. Update Current Status

Update the "Current Status" section at the bottom of this file to point to the new feature folder.

### After Generating Files

Tell the user:

1. Review the generated files in `features/[feature-name]/`
2. Make any adjustments to PRD.md or prd.json if needed
3. Run Ralph:

```bash
claude --dangerously-skip-permissions
/ralph-loop:ralph-loop "You are working on this project.

BEFORE EACH ITERATION:
1. Read CLAUDE.md for project context
2. Read DESIGN_SYSTEM.md for UI patterns
3. Read features/[feature-name]/prd.json and find the first story with passes: false

YOUR TASK:
1. Implement the story following all acceptance criteria
2. Run tests to verify:
   - npm run test (for unit tests)
   - npx playwright test (only for e2e stories)
3. Fix any failures before proceeding

WHEN STORY COMPLETE:
1. Update features/[feature-name]/prd.json - set passes: true
2. Append to features/[feature-name]/progress.txt with format:
   ---
   Story: [ID] [Title]
   Files changed: [list]
   Notes: [any learnings or issues]
   ---
3. Commit: git add -A && git commit -m 'feat([ID]): [title]'

WHEN ALL STORIES COMPLETE:
Output <promise>COMPLETE</promise>

If stuck after 3 attempts, document blockers and move to next story." --max-iterations 25 --completion-promise COMPLETE
```

(Replace `[feature-name]` with the actual folder name)

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** Tailwind CSS + shadcn/ui
- **Forms:** react-hook-form + zod
- **Icons:** lucide-react
- **Testing:** Vitest (unit/integration) + Playwright (e2e)

## Project Structure

```
project/
├── features/               # Feature planning folders
│   └── [feature-name]/
│       ├── PRD.md
│       ├── prd.json
│       └── progress.txt
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── design/         # Design system reference page
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/
│   │   ├── ui/             # shadcn/ui components (DO NOT MODIFY)
│   │   └── [feature]/      # Feature components
│   ├── lib/
│   │   ├── prisma.ts       # Prisma client singleton
│   │   ├── utils.ts        # shadcn utilities
│   │   └── validations/    # Zod schemas
│   └── types/              # TypeScript types
├── tests/
│   ├── unit/               # Vitest unit tests
│   └── e2e/                # Playwright e2e tests
├── DESIGN_SYSTEM.md        # UI/UX standards (READ THIS)
├── CLAUDE.md               # This file
└── GETTING_STARTED.md      # Workflow guide
```

## Critical Instructions

### Before Writing Any UI Code
1. **Read `DESIGN_SYSTEM.md` completely** — All UI must follow these patterns
2. Use existing shadcn/ui components from `src/components/ui/`
3. Do not modify files in `src/components/ui/` — they are managed by shadcn

### Installing shadcn/ui Components
Components are installed on-demand. When you need a component that doesn't exist in `src/components/ui/`, install it:
```bash
npx shadcn@latest add [component-name]
```
Available components: https://ui.shadcn.com/docs/components

Common components: button, input, label, card, dialog, alert-dialog, select, dropdown-menu, table, badge, form, sonner (toasts)

### Code Style
- Use TypeScript strict mode
- Prefer `async/await` over `.then()`
- Use named exports for components
- Use Zod schemas for all validation (API and forms)
- Co-locate related files in feature folders

### API Routes Pattern
```typescript
// src/app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(1).max(100),
  // ... other fields
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = createSchema.parse(body)
    const item = await prisma.item.create({ data: validated })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Component Pattern
```typescript
// src/components/[feature]/[component].tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
})

type FormData = z.infer<typeof schema>

interface Props {
  onSubmit: (data: FormData) => Promise<void>
  defaultValues?: Partial<FormData>
}

export function MyForm({ onSubmit, defaultValues }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', ...defaultValues },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Form fields per DESIGN_SYSTEM.md */}
      </form>
    </Form>
  )
}
```

### Testing Requirements

**Unit Tests (Vitest):**
- Test validation schemas
- Test utility functions
- Test component rendering

**E2E Tests (Playwright):**
- Test complete user flows
- Test CRUD operations through UI
- Run with `npx playwright test`

**Test file naming:**
- Unit: `*.test.ts` or `*.test.tsx`
- E2E: `*.spec.ts`

### Database Commands

```bash
# Run migrations
npx prisma migrate dev

# Generate client after schema changes
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (careful!)
npx prisma migrate reset
```

### Development Commands

```bash
# Start dev server
npm run dev

# Run unit tests
npm run test

# Run e2e tests
npx playwright test

# Type check
npm run type-check

# Lint
npm run lint
```

## Common Gotchas

1. **Prisma Client in Next.js:** Always import from `@/lib/prisma`, not directly from `@prisma/client`
2. **Server vs Client Components:** API calls and database access only in Server Components or API routes
3. **Form State:** Use `'use client'` directive for any component using react-hook-form
4. **Toast Notifications:** Import `toast` from `sonner`, ensure `<Toaster />` is in layout
5. **Styling:** Use Tailwind classes, follow `DESIGN_SYSTEM.md` spacing and colours

## Environment Variables

Required in `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5466/dbname"
```

## Definition of Done

A feature is complete when:
1. ✅ Functionality works as specified
2. ✅ UI matches DESIGN_SYSTEM.md patterns
3. ✅ TypeScript compiles with no errors
4. ✅ Unit tests pass
5. ✅ E2E tests pass
6. ✅ No console errors in browser
7. ✅ Works on mobile viewport (375px+)

---

## Current Status

**Project:** Founders Tab - Expense tracker for co-founders
**Design:** Complete - Dark mode with orange/red gradient accents, mobile-first
**Completed Features:**
- `features/user-auth` - User Authentication (36 stories) ✓
- `features/expense-submission` - Expense Submission (27 stories) ✓
- `features/expense-list-filtering` - Expense List & Filtering (17 stories) ✓
- `features/running-balance-dashboard` - Running Balance Dashboard (12 stories) ✓
- `features/transaction-approval` - Transaction Approval (21 stories) ✓

**Current Feature:** `features/expense-withdrawal` - Expense Withdrawal (24 stories)

### Next Step
Review the generated files in `features/expense-withdrawal/` and run Ralph:

```bash
claude --dangerously-skip-permissions
/ralph-loop:ralph-loop "You are working on this project.

BEFORE EACH ITERATION:
1. Read CLAUDE.md for project context
2. Read DESIGN_SYSTEM.md for UI patterns
3. Read features/expense-withdrawal/prd.json and find the first story with passes: false

YOUR TASK:
1. Implement the story following all acceptance criteria
2. Run tests to verify:
   - npm run test (for unit tests)
   - npx playwright test (only for e2e stories)
3. Fix any failures before proceeding

WHEN STORY COMPLETE:
1. Update features/expense-withdrawal/prd.json - set passes: true
2. Append to features/expense-withdrawal/progress.txt with format:
   ---
   Story: [ID] [Title]
   Files changed: [list]
   Notes: [any learnings or issues]
   ---
3. Commit: git add -A && git commit -m 'feat([ID]): [title]'

WHEN ALL STORIES COMPLETE:
Output <promise>COMPLETE</promise>

If stuck after 3 attempts, document blockers and move to next story." --max-iterations 50 --completion-promise COMPLETE
```
