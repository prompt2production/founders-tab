# Transaction Approval Feature

## Overview

Enable a collaborative approval workflow for expenses where all founding members must agree that a logged expense is a valid business expense. This ensures accountability and consensus among founders before expenses are counted in financial reporting.

## User Stories

### As a founder logging an expense
- I want my expense to be submitted for approval by other founders
- So that all founders can verify it's a legitimate business expense

### As a founder reviewing expenses
- I want to see which expenses need my approval
- I want to approve or view details of pending expenses
- So that I can help validate team expenses

### As a team
- We want only approved expenses included in balance reporting
- So that our financial overview reflects validated business expenses only

## Detailed Requirements

### Expense Status

Expenses will have one of two statuses:
- **PENDING_APPROVAL**: Newly created, awaiting approval from other founders
- **APPROVED**: All required approvals received

### Approval Rules

1. When an expense is created, it starts with status `PENDING_APPROVAL`
2. All founders **except the expense creator** must approve the expense
3. Each founder can only approve an expense once
4. Once all required approvals are received, status automatically changes to `APPROVED`
5. The expense creator cannot approve their own expense
6. Only users with role `FOUNDER` can approve expenses

### Edge Cases

- **Single Founder**: If there's only one founder, expenses are auto-approved (no other founders to approve)
- **New Founder Joins**: Existing pending expenses do NOT require approval from newly joined founders
- **Founder Leaves**: Approvals already given remain valid; pending approvals from that founder are no longer required

### Database Changes

#### New Enum: ExpenseStatus
```prisma
enum ExpenseStatus {
  PENDING_APPROVAL
  APPROVED
}
```

#### Updated Expense Model
```prisma
model Expense {
  // ... existing fields
  status      ExpenseStatus @default(PENDING_APPROVAL)
  approvals   Approval[]
}
```

#### New Model: Approval
```prisma
model Approval {
  id        String   @id @default(cuid())
  expenseId String
  userId    String
  createdAt DateTime @default(now())

  expense   Expense  @relation(fields: [expenseId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([expenseId, userId]) // Each user can only approve once per expense
}
```

### API Endpoints

#### POST /api/expenses/[id]/approve
- Authenticated founders can approve an expense
- Returns 400 if user is the expense creator
- Returns 400 if user already approved
- Returns 400 if user is not a FOUNDER
- Returns 404 if expense not found
- Automatically updates expense status to APPROVED if all required approvals received
- Returns updated expense with approval status

#### GET /api/expenses (updated)
- Add `status` filter parameter (PENDING_APPROVAL, APPROVED, or all)
- Include approval information in response
- Default: show all statuses

#### GET /api/expenses/[id] (updated)
- Include approval details: who has approved, who still needs to approve

#### GET /api/balances (updated)
- Only include APPROVED expenses in totals
- This affects teamTotal, individual totals, and all percentage calculations

#### GET /api/balances/[userId] (updated)
- Only include APPROVED expenses in breakdown

### UI Requirements

#### Expense List
- Show approval status badge on each expense (pending/approved)
- Status filter dropdown to filter by approval status
- Visual indicator for expenses needing user's approval

#### Expense Card/Item
- Show current approval status
- Show approval progress (e.g., "2/3 approvals")
- Show "Approve" button for founders who haven't approved yet
- Cannot approve own expense

#### Add Expense Flow
- Inform user that expense will require approval from other founders
- After creation, show status as "Pending Approval"

#### Balance Dashboard
- Only show approved expenses in totals
- Optionally show pending amounts separately

#### Notifications/Indicators
- Badge count for expenses needing user's approval
- Clear visual distinction between pending and approved expenses

### Testing Requirements

#### Unit Tests
- Approval creation validation
- Status transition logic
- Balance calculations with mixed statuses

#### E2E Tests
- Full approval workflow: create expense → approve by other founders → status changes
- Filter by status
- Verify balances only include approved expenses

## Out of Scope (Future Considerations)

- Rejection workflow (founders can reject with reason)
- Approval comments/notes
- Approval deadline/reminders
- Email notifications for pending approvals
- Approval delegation
