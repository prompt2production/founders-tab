# Running Balance Dashboard

## Overview

A dashboard view showing each founder's cumulative expense total - their "running balance" or what will become their directors' loan account balance once the company is incorporated. This provides transparency on who has spent what for the business and helps founders track their individual contributions.

## User Stories

### As a founder, I want to:
- See my total expenses at a glance (my running balance)
- See what each co-founder has spent in total
- Understand the relative contribution of each team member
- See how the total team spend is distributed
- View historical trends of spending over time

## Detailed Requirements

### Dashboard Page
- Dedicated page at `/balance` or integrate into existing `/team` page
- Shows all team members with their total expense amounts
- Highlights the current user's balance prominently
- Shows team total at the top

### Balance Cards (Per Person)
- User avatar and name
- Total amount spent to date (running balance)
- Percentage of total team spend
- Number of expenses submitted
- Optional: Trend indicator (up/down from last month)

### Team Summary Section
- Total team expenses (all time)
- Average per founder
- Number of founders
- Optional: Visual breakdown (pie chart or bar chart)

### Balance Details
- Clicking a founder shows their expense breakdown by category
- Shows monthly spending trend
- Quick link to view their expenses (filtered)

### Visual Design
- Use gradient balance cards similar to home page
- Large, prominent monetary values with tabular-nums
- Clear visual hierarchy
- Responsive layout (cards stack on mobile)

## API Requirements

### GET /api/balances
Returns running balance for all team members:
```json
{
  "teamTotal": 15000.00,
  "balances": [
    {
      "user": {
        "id": "...",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "total": 5000.00,
      "expenseCount": 25,
      "percentage": 33.33,
      "monthlyChange": 500.00
    }
  ]
}
```

### GET /api/balances/[userId]
Returns detailed balance for a specific user:
```json
{
  "user": { "id": "...", "name": "John Doe" },
  "total": 5000.00,
  "expenseCount": 25,
  "byCategory": [
    { "category": "SOFTWARE", "total": 2000.00, "count": 10 },
    { "category": "TRAVEL", "total": 1500.00, "count": 5 }
  ],
  "byMonth": [
    { "month": "2024-01", "total": 1000.00 },
    { "month": "2024-02", "total": 1500.00 }
  ]
}
```

## UI/UX Requirements

### Following DESIGN_SYSTEM.md
- Balance cards use gradient styling for prominence
- Large tabular-nums for monetary values
- Avatar with user initials
- Consistent spacing and rounded corners
- Loading skeletons while fetching

### Layout
- Mobile: Single column, cards stacked vertically
- Desktop: Grid layout, 2-3 cards per row
- Current user's card can be larger/highlighted

## Technical Approach

### Components to Create
- BalanceDashboard (main page component)
- BalanceCard (individual founder card)
- BalanceSummary (team totals overview)
- BalanceBreakdown (category/monthly breakdown)
- useBalances hook (fetch team balances)
- useBalance hook (fetch individual balance details)

### State Management
- Server-side data fetching where possible
- Client-side state for interactive elements
- Refresh on navigation to page

## Success Metrics
- Founders can see total spend in < 3 seconds
- Balance information is accurate and up-to-date
- Clear understanding of team spending distribution
