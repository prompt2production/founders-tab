# DB Console Seed Refactor

## Overview

Refactor the database console's seed functionality to separate user seeding from expense data seeding. This provides more granular control over test data creation and uses production-ready seed user accounts.

## Current State

The existing `seed-data.ts` command:
- Seeds 3 test users (Alice, Bob, Carol) with example.com emails
- Seeds 13 expenses with various statuses
- Seeds approvals and withdrawal approvals
- All done in a single command

## Proposed Changes

Replace the single "Seed test data" option with two separate options:
1. **Seed users** - Creates the three founder accounts
2. **Seed expense data** - Creates expenses for all existing users

## New Menu Structure

```
Database Console
================
Environment: Development
1. Clear all data
2. Seed users
3. Seed expense data
4. Exit
```

## Seed Users Command

Creates three founder accounts:

| Name | Email | Password |
|------|-------|----------|
| Chris | chris@founderstab.com | Password123! |
| Candice | candice@founderstab.com | Password123! |
| Adrian | adrian@founderstab.com | Password123! |

**Behaviour:**
- Checks if users already exist (by email) and skips if present
- Uses bcrypt to hash passwords (same hash as existing)
- Creates users with initials: C, C, A
- Shows summary of users created/skipped
- Blocked on production environment

## Seed Expense Data Command

Creates realistic expense data for **all users currently in the database**.

**Dependency:**
- Requires at least 2 users to exist in the database
- Shows error message if insufficient users exist

**Behaviour:**
- Queries all existing users from database
- Creates expenses distributed across all users
- Creates approval records based on existing users
- Creates withdrawal approval records where applicable
- Maintains realistic distribution of expense statuses:
  - PENDING_APPROVAL: 3 expenses (partial approvals)
  - APPROVED: 3 expenses (fully approved)
  - WITHDRAWAL_REQUESTED: 2 expenses (withdrawal pending)
  - WITHDRAWAL_APPROVED: 2 expenses (withdrawal complete)
  - RECEIVED: 3 expenses (fully completed)
- Blocked on production environment

## Technical Requirements

### File Changes

1. **Update `tools/db-console/src/seed-data/test-data.ts`**
   - Replace Alice/Bob/Carol with Chris/Candice/Adrian
   - Update emails to @founderstab.com domain
   - Keep expense templates for dynamic seeding

2. **Create `tools/db-console/src/commands/seed-users.ts`**
   - New command for seeding users only
   - Check for existing users before creating (idempotent)
   - Use bcrypt for password hashing

3. **Create `tools/db-console/src/commands/seed-expenses.ts`**
   - New command for seeding expense data
   - Query existing users from database
   - Create expenses dynamically based on actual users
   - Validate minimum user count before proceeding

4. **Update `tools/db-console/src/commands/main-menu.ts`**
   - Replace "Seed test data" with "Seed users" and "Seed expense data"
   - Update menu numbering
   - Route to new command files

5. **Remove `tools/db-console/src/commands/seed-data.ts`**
   - No longer needed after refactoring

## Definition of Done

- [ ] Menu shows two separate seed options
- [ ] Seed users creates Chris, Candice, Adrian accounts
- [ ] Seed users is idempotent (skips existing users)
- [ ] Seed expenses works with any users in database
- [ ] Seed expenses validates minimum user count
- [ ] Both commands blocked on production
- [ ] Existing clear data command still works
- [ ] All TypeScript compiles without errors
- [ ] Application runs: `npm run start` in tools/db-console
