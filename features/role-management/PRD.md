# Role Management

## Overview

Allow FOUNDERs to manage team member roles directly from the Team page. This enables promoting MEMBERs to FOUNDER status or demoting FOUNDERs to MEMBER status, with appropriate safeguards to ensure the team always has at least one FOUNDER.

## User Stories

### As a FOUNDER, I want to:
- See a role management option for each team member
- Promote a MEMBER to FOUNDER so they can approve expenses and manage invitations
- Demote a FOUNDER to MEMBER if they no longer need admin privileges
- Be prevented from demoting the last FOUNDER to maintain system integrity

### As a MEMBER, I want to:
- See my role on the Team page (view only)
- Not see role management controls (no permission)

## Detailed Requirements

### UI/UX Requirements

1. **Role Badge Enhancement** (Team Page)
   - For FOUNDERs viewing the page: Role badge becomes a clickable dropdown
   - For MEMBERs viewing the page: Role badge remains static (no interaction)
   - Current user's own role badge should also be interactive (founders can demote themselves if not the last founder)

2. **Role Dropdown Menu**
   - Shows current role with a checkmark
   - Shows alternative role as selectable option
   - Disabled state for "last founder" scenario with tooltip explanation

3. **Confirmation Dialog**
   - Required before any role change
   - Promote: "Are you sure you want to promote {name} to Founder? They will be able to approve expenses and manage team invitations."
   - Demote: "Are you sure you want to change {name}'s role to Member? They will no longer be able to approve expenses or manage invitations."
   - Self-demote: "Are you sure you want to change your own role to Member? You will no longer be able to approve expenses or manage invitations."

4. **Feedback**
   - Success toast: "Role updated" with description "{name} is now a {role}"
   - Error toast: Appropriate error message

### API Requirements

#### PATCH `/api/users/[id]/role`

**Request:**
```json
{
  "role": "FOUNDER" | "MEMBER"
}
```

**Response (200):**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "FOUNDER" | "MEMBER"
}
```

**Error Responses:**
- 400: Invalid role value
- 401: Not authenticated
- 403: Not a FOUNDER (no permission)
- 403: Cannot demote last FOUNDER
- 404: User not found

### Validation Rules

1. Only users with FOUNDER role can change roles
2. Cannot demote the last remaining FOUNDER
3. Role must be a valid enum value (FOUNDER or MEMBER)
4. User being modified must exist

### Database

No schema changes required - using existing `role` field on User model.

## Edge Cases

1. **Last Founder Protection**: If there's only one FOUNDER, they cannot be demoted
2. **Self-Demotion**: A FOUNDER can demote themselves if there are other FOUNDERs
3. **Concurrent Changes**: If two FOUNDERs try to demote each other simultaneously, the "last founder" check should prevent both from succeeding
4. **No-op Changes**: Changing a role to its current value should succeed silently (idempotent)

## Out of Scope

- Role history/audit log
- Custom roles beyond FOUNDER/MEMBER
- Bulk role changes
- Role-based notifications
