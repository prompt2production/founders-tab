# Database Console Application

## Overview

A standalone Node.js console application for managing the Founders Tab database across multiple environments. This tool provides database administrators with a simple interface to clear data or seed test data without needing to run raw SQL or Prisma commands.

## User Stories

### As a developer
- I want to select which environment (development, test, production) to connect to
- I want to clear all data from a database for fresh starts
- I want to seed test data for development and testing purposes
- I want a safe, menu-driven interface to prevent accidental operations

## Detailed Requirements

### Project Structure

The console application should live in a `tools/db-console` folder within the main project:

```
tools/
└── db-console/
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── .env (gitignored)
    └── src/
        ├── index.ts          # Entry point
        ├── config.ts         # Environment configuration
        ├── prisma.ts         # Prisma client setup
        ├── prompts.ts        # Interactive prompts
        ├── commands/
        │   ├── clear-data.ts
        │   └── seed-data.ts
        └── seed-data/
            └── test-data.ts  # Test data definitions
```

### Environment Configuration

The application must support three environments via separate connection strings:

```env
# .env.example
DATABASE_URL_DEV="postgresql://user:password@localhost:5466/founders_tab_dev"
DATABASE_URL_TEST="postgresql://user:password@localhost:5466/founders_tab_test"
DATABASE_URL_PROD="postgresql://user:password@localhost:5466/founders_tab_prod"
```

### Environment Selection

On launch, the application should:
1. Display a welcome message
2. Show a list of available environments (Development, Test, Production)
3. Require user to select one before proceeding
4. Display a warning if Production is selected
5. Store the selected environment for the session

### Main Menu

After environment selection, display:
```
=== Database Console ===
Connected to: [ENVIRONMENT_NAME]

1. Clear all data
2. Seed test data
3. Exit

Select an option:
```

### Clear All Data

When selected:
1. Show confirmation prompt: "Are you sure you want to delete ALL data from [ENVIRONMENT]? (yes/no)"
2. If Production environment, require typing "DELETE PRODUCTION DATA" to confirm
3. Delete data in correct order to respect foreign key constraints:
   - WithdrawalApprovals
   - Approvals
   - Expenses
   - Users
   - (Any other tables as needed)
4. Display progress and completion message
5. Return to main menu

### Seed Test Data

When selected:
1. Show confirmation prompt: "This will add test data to [ENVIRONMENT]. Continue? (yes/no)"
2. Block if Production environment: "Seeding is not allowed in Production"
3. Create test data:
   - 3 founder users
   - 10-15 expenses across various statuses and categories
   - Appropriate approvals and withdrawal approvals
4. Display progress and completion message
5. Return to main menu

### Test Data Definitions

Create realistic test data:

**Users:**
- Alice Founder (FOUNDER role)
- Bob Founder (FOUNDER role)
- Carol Founder (FOUNDER role)

**Expenses:**
- Mix of all statuses: PENDING_APPROVAL, APPROVED, WITHDRAWAL_REQUESTED, WITHDRAWAL_APPROVED, RECEIVED
- Mix of categories: meals, travel, equipment, software, office, other
- Various amounts ($10 - $500)
- Dates within last 30 days
- Some with receipts, some without
- Some with notes, some without

**Approvals:**
- Appropriate approvals for APPROVED expenses
- Partial approvals for PENDING_APPROVAL expenses

**Withdrawal Approvals:**
- Appropriate withdrawal approvals for expenses in withdrawal flow

### Exit

Clean exit with goodbye message.

## Technical Requirements

### Dependencies
- `@prisma/client` - Database access (use existing schema)
- `dotenv` - Environment variable loading
- `readline` - Built-in Node.js module for prompts (no external dependencies)
- `typescript` - Type safety
- `tsx` - TypeScript execution

### Prisma Integration
- Reuse the existing Prisma schema from the main project
- Generate a local Prisma client configured for multiple databases
- Use environment variable switching rather than multiple schema files

### Error Handling
- Graceful handling of database connection failures
- Clear error messages for common issues
- Always return to main menu after errors (don't crash)

### Security Considerations
- Production environment requires extra confirmation steps
- Seeding is blocked in Production
- Connection strings stored in .env (gitignored)
- .env.example provided with placeholder values

## UI/UX Requirements

- Clear, readable console output
- Color-coded messages where appropriate (warnings in yellow/red)
- Progress indicators for long operations
- Consistent formatting and spacing
- Always show current environment in prompts

## Testing

Manual testing checklist:
- [ ] Can select each environment
- [ ] Production shows extra warnings
- [ ] Clear data works and respects foreign keys
- [ ] Seed data creates expected records
- [ ] Exit cleanly terminates
- [ ] Error handling works for invalid inputs
- [ ] Can return to menu after operations
