# Expense Withdrawal Feature

## Overview

This feature allows founders to request withdrawal of approved expenses. When a founder requests withdrawal, all other founders must approve the withdrawal request. Once approved, the requesting founder confirms receipt of funds, completing the withdrawal process.

## User Stories

### As a founder who paid for an expense
- I want to request withdrawal of my approved expense so I can be reimbursed
- I want to see the status of my withdrawal request
- I want to confirm when I've received the funds

### As a founder reviewing withdrawal requests
- I want to see pending withdrawal requests that need my approval
- I want to approve withdrawal requests from other founders
- I want to see a history of withdrawal approvals

## Status Flow

```
PENDING_APPROVAL → APPROVED → WITHDRAWAL_REQUESTED → WITHDRAWAL_APPROVED → RECEIVED
```

1. **APPROVED**: Expense has been approved by all founders (existing)
2. **WITHDRAWAL_REQUESTED**: Owner has requested withdrawal, awaiting other founders' approval
3. **WITHDRAWAL_APPROVED**: All founders have approved the withdrawal, awaiting owner confirmation
4. **RECEIVED**: Owner has confirmed receipt of funds (terminal state)

## Detailed Requirements

### Database Changes

1. Add new ExpenseStatus enum values:
   - `WITHDRAWAL_REQUESTED`
   - `WITHDRAWAL_APPROVED`
   - `RECEIVED`

2. Add WithdrawalApproval model to track withdrawal approvals separately from expense approvals:
   - `id`: String (cuid)
   - `expenseId`: String (foreign key)
   - `userId`: String (foreign key)
   - `createdAt`: DateTime

### API Endpoints

#### POST /api/expenses/[id]/request-withdrawal
- Only expense owner can request withdrawal
- Expense must be in APPROVED status
- Changes status to WITHDRAWAL_REQUESTED
- Returns updated expense

#### POST /api/expenses/[id]/approve-withdrawal
- Any founder except expense owner can approve
- Expense must be in WITHDRAWAL_REQUESTED status
- User cannot approve twice
- When all founders have approved, status changes to WITHDRAWAL_APPROVED
- Returns updated expense with withdrawal approvals

#### POST /api/expenses/[id]/confirm-receipt
- Only expense owner can confirm
- Expense must be in WITHDRAWAL_APPROVED status
- Changes status to RECEIVED
- Returns updated expense

#### GET /api/expenses updates
- Include withdrawal approval info in response
- Add withdrawalApprovals array
- Add withdrawalApprovalsNeeded count
- Add canCurrentUserApproveWithdrawal boolean
- Support filtering by new status values

### UI Components

#### WithdrawalStatusBadge
- Shows current withdrawal status with appropriate colors
- WITHDRAWAL_REQUESTED: Warning colors (amber)
- WITHDRAWAL_APPROVED: Info colors (blue)
- RECEIVED: Success colors (green)

#### RequestWithdrawalButton
- Shown on approved expenses owned by current user
- Opens confirmation dialog
- Shows loading state during request

#### ApproveWithdrawalButton
- Shown on WITHDRAWAL_REQUESTED expenses not owned by current user
- Disabled if user already approved
- Shows loading state during approval

#### ConfirmReceiptButton
- Shown on WITHDRAWAL_APPROVED expenses owned by current user
- Opens confirmation dialog
- Shows loading state during confirmation

### UI Updates

#### ExpenseListItem
- Show withdrawal status badge for expenses in withdrawal flow
- Visual distinction for different withdrawal states

#### EditExpenseSheet
- Show withdrawal status section
- Show list of who has approved withdrawal
- Show appropriate action button based on status and user role

#### ExpenseFilters
- Add new status filter options for withdrawal states

#### Navigation Badge
- Include withdrawal requests needing approval in pending count

## Validation Rules

1. Only expense owner can request withdrawal
2. Only approved expenses can have withdrawal requested
3. Founders cannot approve their own withdrawal request
4. Each founder can only approve a withdrawal once
5. Only expense owner can confirm receipt
6. Receipt can only be confirmed after all founders approve withdrawal

## Edge Cases

1. Single founder team: Withdrawal is auto-approved (goes directly to WITHDRAWAL_APPROVED)
2. User tries to edit expense during withdrawal flow: Should be prevented
3. New founder joins during withdrawal: Should be included in required approvals

## Testing Requirements

### Unit Tests
- Test all new API endpoints
- Test validation rules
- Test auto-approval for single founder

### E2E Tests
- Test complete withdrawal flow
- Test status filtering for withdrawal states
- Test UI components display correctly
