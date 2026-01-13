# User Authentication

## Overview

Implement user authentication for Founders Tab, enabling founders to securely sign up, log in, and manage their accounts. The system supports an initial group of founders with the ability to invite additional team members later.

## User Stories (Plain English)

1. As a new founder, I want to sign up with my email and password so I can start tracking expenses
2. As a registered user, I want to log in to access my account and see my expenses
3. As a logged-in user, I want to log out securely from any device
4. As a user, I want to update my profile information (name, avatar initials)
5. As a user, I want to change my password for security
6. As a user, I want to reset my password if I forget it
7. As a founder, I want to invite new members to join our team via email
8. As an invited user, I want to accept an invitation and create my account
9. As a user, I want to see who else is in my team

## Detailed Requirements

### Authentication Flow

#### Sign Up
- **Fields:** Name, Email, Password, Confirm Password
- **Validation:**
  - Name: Required, 2-100 characters
  - Email: Required, valid email format, unique in system
  - Password: Required, minimum 8 characters, at least one uppercase, one lowercase, one number
  - Confirm Password: Must match password
- **Behaviour:**
  - Create user account
  - Automatically log user in after sign up
  - Redirect to dashboard
  - First user to sign up becomes a "founder" role
  - Show success toast notification

#### Log In
- **Fields:** Email, Password
- **Validation:**
  - Email: Required, valid format
  - Password: Required
- **Behaviour:**
  - Validate credentials against database
  - Create session on success
  - Redirect to dashboard
  - Show error message on invalid credentials (generic "Invalid email or password" - don't reveal which is wrong)
  - Rate limit: Max 5 failed attempts per 15 minutes per IP

#### Log Out
- **Behaviour:**
  - Destroy session
  - Clear any client-side tokens
  - Redirect to login page
  - Show confirmation toast

#### Password Reset
- **Request Reset:**
  - Enter email address
  - Send reset link via email (valid for 1 hour)
  - Show generic success message (don't reveal if email exists)
- **Reset Password:**
  - Enter new password and confirm
  - Same validation as sign up
  - Invalidate reset token after use
  - Log user in automatically

### User Profile

#### View/Edit Profile
- **Editable Fields:**
  - Name
  - Avatar initials (auto-generated from name, but can override)
- **Read-only Fields:**
  - Email (cannot change for MVP)
  - Role (Founder/Member)
  - Member since date

#### Change Password
- **Fields:** Current password, New password, Confirm new password
- **Validation:** Same password rules as sign up
- **Behaviour:** Require current password for security

### Team & Invitations

#### Invite Member (Founders only)
- **Fields:** Email address, Optional personal message
- **Behaviour:**
  - Send invitation email with unique link
  - Link valid for 7 days
  - Track pending invitations
  - Limit: Max 10 pending invitations at a time
  - Cannot invite existing members

#### Accept Invitation
- **Flow:**
  - Click link in email
  - Land on sign-up page with email pre-filled
  - Complete sign up (Name, Password)
  - Automatically join the team as "Member" role
  - Invitation marked as accepted

#### View Team Members
- **Display:**
  - Avatar (gradient based on initials)
  - Name
  - Email
  - Role (Founder/Member)
  - Status (Active/Pending invitation)

### Roles & Permissions

| Permission | Founder | Member |
|------------|---------|--------|
| View own expenses | Yes | Yes |
| Add expenses | Yes | Yes |
| Edit own expenses | Yes | Yes |
| Delete own expenses | Yes | Yes |
| View team expenses | Yes | Yes |
| View team members | Yes | Yes |
| Invite new members | Yes | No |
| Remove members | Yes (future) | No |

## Database Models

### User
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  passwordHash  String
  avatarInitials String?  // Auto-generated if null
  role          Role      @default(MEMBER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  sessions      Session[]
  invitationsSent Invitation[] @relation("InvitedBy")
  invitation    Invitation?   @relation("InvitedUser")
  expenses      Expense[]
  passwordResets PasswordReset[]
}

enum Role {
  FOUNDER
  MEMBER
}
```

### Session
```prisma
model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Invitation
```prisma
model Invitation {
  id          String    @id @default(cuid())
  email       String
  token       String    @unique
  message     String?
  status      InvitationStatus @default(PENDING)
  expiresAt   DateTime
  createdAt   DateTime  @default(now())
  acceptedAt  DateTime?

  invitedById String
  invitedBy   User      @relation("InvitedBy", fields: [invitedById], references: [id])

  acceptedById String?  @unique
  acceptedBy   User?    @relation("InvitedUser", fields: [acceptedById], references: [id])
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  EXPIRED
}
```

### PasswordReset
```prisma
model PasswordReset {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |

### User Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile |
| PATCH | `/api/users/me` | Update profile |
| POST | `/api/users/me/change-password` | Change password |

### Team & Invitations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/team` | List team members |
| GET | `/api/invitations` | List sent invitations |
| POST | `/api/invitations` | Send invitation |
| DELETE | `/api/invitations/:id` | Cancel invitation |
| GET | `/api/invitations/accept/:token` | Validate invitation token |
| POST | `/api/invitations/accept/:token` | Accept invitation (sign up) |

## UI/UX Requirements

Reference `DESIGN_SYSTEM.md` for all styling.

### Pages

#### `/login`
- Mobile-optimised full-screen form
- App logo/name at top
- Email and password fields
- "Log in" primary button (full width)
- "Forgot password?" link
- "Don't have an account? Sign up" link
- Dark background with gradient accent on logo

#### `/signup`
- Similar layout to login
- Name, email, password, confirm password fields
- Password strength indicator
- "Create account" primary button
- "Already have an account? Log in" link

#### `/forgot-password`
- Email field only
- "Send reset link" button
- Success state: "Check your email" message

#### `/reset-password/[token]`
- New password and confirm fields
- "Reset password" button
- Handle invalid/expired token gracefully

#### `/profile`
- User avatar (large, with gradient)
- Editable name field
- Read-only email
- Role badge
- "Change password" button (opens sheet)
- "Log out" button (destructive style)

#### `/team`
- List of team members (avatar, name, email, role)
- Pending invitations section
- "Invite member" button (founders only)
- Invite sheet/dialog with email input

### Components

#### AuthGuard
- Wrapper component for protected routes
- Redirects to `/login` if not authenticated
- Shows loading state while checking auth

#### UserAvatar
- Gradient background based on initials
- Size variants (sm, md, lg)
- Fallback to initials if no image

#### InvitationCard
- Shows pending invitation details
- Cancel button
- Expiry countdown

## Security Considerations

1. **Password Storage:** Use bcrypt with cost factor 12
2. **Session Tokens:** Cryptographically random, 32 bytes
3. **CSRF Protection:** Next.js handles this via SameSite cookies
4. **Rate Limiting:** Implement on login and password reset endpoints
5. **Input Sanitisation:** All inputs validated with Zod
6. **Secure Headers:** Use Next.js security headers
7. **HTTPS Only:** Enforce in production

## Out of Scope (Future)

- Social login (Google, GitHub)
- Two-factor authentication
- Email verification on sign up
- Account deletion
- Remove team members
- Transfer founder role
- Multiple teams/organisations
