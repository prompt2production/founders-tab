# Expense List & Filtering

## Overview

A dedicated expenses page that displays all expenses across the team/group with comprehensive filtering capabilities. Users can filter expenses by team member, date range, or category to quickly find and analyze spending patterns.

## User Stories

### As a founder/team member, I want to:
- View all expenses submitted by the team in one place
- Filter expenses by specific team member to see individual spending
- Filter expenses by date range to analyze spending over time periods
- Filter expenses by category to understand spending distribution
- Combine multiple filters for precise expense discovery
- Clear filters easily to return to the full list
- See expense totals that update based on active filters

## Detailed Requirements

### Navigation
- Add "Expenses" link to the main navigation/sidebar
- Link from "View All" on home page goes to expenses page
- URL: `/expenses`

### Expenses List View
- Display all team expenses (all users, not just current user)
- Show expense details: amount, description, category, date, who submitted it
- Order by date descending (newest first) by default
- Paginated list with 20 items per page
- Show total count of expenses matching current filters
- Show sum total of expenses matching current filters

### Filter Controls

#### Person Filter
- Dropdown/select showing all team members
- Option to show "All Members" (default)
- Shows user name in dropdown
- Filters list to show only that person's expenses

#### Date Range Filter
- Preset options: Today, This Week, This Month, Last Month, This Year
- Custom date range picker (start date, end date)
- Clear button to remove date filter

#### Category Filter
- Multi-select or single-select for categories
- Shows category icon and label
- Option to show "All Categories" (default)

### Filter Behavior
- Filters apply immediately on selection (no "Apply" button needed)
- Multiple filters combine with AND logic
- URL updates with filter params (shareable/bookmarkable)
- Filter state persists on page refresh
- Summary shows active filters count

### Empty States
- No expenses at all: "No expenses yet. Start tracking by adding your first expense."
- No matching filters: "No expenses match your filters. Try adjusting your criteria."

### Responsive Design
- Desktop: Filters in horizontal bar above list
- Mobile: Filters in collapsible panel or sheet
- List items stack appropriately on mobile

## Database Considerations

### API Updates Needed
- GET /api/expenses needs to support:
  - `userId` filter param (to filter by team member)
  - Already supports: `category`, `startDate`, `endDate`, `page`, `limit`
- New endpoint: GET /api/users (to populate person filter dropdown)

## UI/UX Requirements

### Following DESIGN_SYSTEM.md
- Use Card component for filter bar container
- Use Select component for dropdowns
- Use Button variants for filter chips/clear actions
- Use existing ExpenseListItem component
- Loading skeletons while fetching
- Consistent spacing and typography

### Filter Bar Design
- Compact horizontal layout on desktop
- Clear visual indication of active filters
- "Clear All" button when any filter is active
- Filter count badge if filters are collapsed on mobile

## Technical Approach

### State Management
- URL search params as source of truth for filters
- React hooks for local state management
- Debounced API calls for performance

### Components to Create
- ExpensesPage (main page component)
- ExpenseFilters (filter bar component)
- PersonFilter (user dropdown)
- DateRangeFilter (date range picker)
- CategoryFilter (category selector)
- ExpenseListWithPagination (paginated list)
- FilterSummary (shows active filter count/total)

## Success Metrics
- Users can find specific expenses in < 10 seconds
- Filter combinations work correctly
- Page loads quickly even with many expenses
- Filters are intuitive without instruction
