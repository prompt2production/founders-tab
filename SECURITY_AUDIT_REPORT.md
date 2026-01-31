# Security Audit Report

**Application:** Founders Tab - Expense Tracking for Co-Founders
**Audit Date:** 2026-01-31
**Audit Type:** Full Comprehensive Audit
**Auditor:** saas-security-auditor
**Status:** ✅ REMEDIATED (2026-01-31)

---

## Executive Summary

| Severity | Count | Fixed |
|----------|-------|-------|
| Critical | 2 | ✅ 2 |
| High | 4 | ✅ 4 |
| Medium | 6 | 0 |
| Low | 5 | 0 |
| Passed Checks | 18 | - |

### Remediation Applied
The following security fixes were applied on 2026-01-31:
- ✅ **CRITICAL-001**: Path traversal fixed with MIME-type based extensions and magic byte validation
- ✅ **CRITICAL-002**: Next.js updated from 15.3.8 → 15.5.11 (5 CVEs patched)
- ✅ **HIGH-001**: Rate limiting added to login/signup endpoints (5 requests/minute)
- ✅ **HIGH-002**: API key logging removed from email.ts
- ✅ **HIGH-003**: Security headers added (CSP, HSTS, X-Frame-Options, etc.)
- ✅ **HIGH-004**: HTML escaping added to all email templates to prevent XSS

**Detected Stack:**
- Auth Pattern: Custom Session-Based (bcrypt + database sessions with httpOnly cookies)
- Multi-Tenancy: Column-based (companyId on User model, expenses filtered by company membership)
- Database: PostgreSQL with Prisma ORM
- Deployment: Docker Compose with nginx-proxy for SSL

---

## Critical Findings

### [x] CRITICAL-001: Path Traversal Vulnerability in File Upload ✅ FIXED

**Severity:** Critical
**Category:** Developer Task
**Location:** `C:\Development\Repos\founders-tab\src\app\api\upload\route.ts:42-43`
**Effort:** Low (30 minutes)

**Issue:**
The file upload endpoint extracts the file extension directly from the user-provided filename without sanitization. An attacker could craft a filename like `../../../etc/passwd.jpg` or `..%2F..%2F..%2Fetc%2Fpasswd.jpg` to potentially write files outside the intended upload directory.

**Evidence:**
```typescript
// Line 42-43 - extension taken directly from user input
const extension = file.name.split('.').pop() || 'bin'
const filename = `${user.id}-${timestamp}.${extension}`
```

While the current code does include the user ID and timestamp, the extension itself is not sanitized. A crafted extension containing path traversal characters or null bytes could potentially be exploited.

**Remediation:**
```typescript
// Sanitize the extension - only allow alphanumeric characters
const rawExtension = file.name.split('.').pop() || 'bin'
const extension = rawExtension.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) // limit length too

// Double-check filename doesn't contain path separators
const filename = `${user.id}-${timestamp}.${extension}`
if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
  return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
}
```

**Verification:**
- [ ] Extension sanitized to alphanumeric only
- [ ] Path traversal patterns blocked
- [ ] Tested with malicious filenames

---

### [x] CRITICAL-002: Dependency Vulnerabilities in Next.js (Multiple CVEs) ✅ FIXED

**Severity:** Critical
**Category:** DevOps Task
**Location:** `package.json` - `next: 15.3.8`
**Effort:** Medium (1-2 hours for testing after upgrade)

**Issue:**
The current Next.js version has 5 known high-severity vulnerabilities:
- CVE: Cache Key Confusion for Image Optimization API Routes (GHSA-g5qg-72qw-gw5v)
- CVE: Content Injection Vulnerability for Image Optimization (GHSA-xv57-4mr9-wg8v)
- CVE: Improper Middleware Redirect Handling leads to SSRF (GHSA-4342-x723-ch2f)
- CVE: DoS via Image Optimizer remotePatterns configuration (GHSA-9g9p-9gw9-jx7f)
- CVE: Unbounded Memory Consumption via PPR Resume Endpoint (GHSA-5f7q-jpqc-wp7h)
- CVE: HTTP request deserialization DoS with insecure RSC (GHSA-h25m-26qc-wcjf)

**Evidence:**
```
npm audit report shows:
next  10.0.0 - 15.6.0-canary.60
Severity: high
fix available via `npm audit fix --force`
Will install next@15.5.11
```

**Remediation:**
```bash
# Update to patched version
npm update next

# Or force update if breaking changes exist
npm audit fix --force

# Run full test suite after update
npm run test
npm run test:e2e
```

**Verification:**
- [ ] Next.js updated to 15.5.11 or later
- [ ] All tests pass after upgrade
- [ ] Application functionality verified in staging

---

## High Findings

### [x] HIGH-001: Missing Rate Limiting on Authentication Endpoints ✅ FIXED

**Severity:** High
**Category:** Developer Task
**Location:** `C:\Development\Repos\founders-tab\src\app\api\auth\login\route.ts`
**Effort:** Medium (2-4 hours)

**Issue:**
The login endpoint has no rate limiting, enabling brute-force password attacks. An attacker can make unlimited login attempts to guess user passwords.

**Evidence:**
```typescript
// No rate limiting middleware or checks present
export async function POST(request: NextRequest) {
  // ... direct password verification without attempt limiting
}
```

Similar issues exist in:
- `src/app/api/auth/signup/route.ts` (account enumeration via rapid signups)
- `src/app/api/invitations/route.ts` (invitation spam)
- `src/app/api/users/me/change-password/route.ts` (brute force current password)

**Remediation:**
Implement rate limiting using Upstash Redis or a similar solution:

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 attempts per minute
})

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success, limit, reset, remaining } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429, headers: { 'X-RateLimit-Limit': limit.toString(), 'X-RateLimit-Remaining': remaining.toString(), 'X-RateLimit-Reset': reset.toString() } }
    )
  }
  // ... rest of login logic
}
```

**Verification:**
- [ ] Rate limiting implemented on login endpoint
- [ ] Rate limiting implemented on signup endpoint
- [ ] Rate limiting implemented on password change endpoint
- [ ] Rate limiting implemented on invitation creation
- [ ] Tested with rapid repeated requests

---

### [x] HIGH-002: Sensitive API Key Partially Logged ✅ FIXED

**Severity:** High
**Category:** Developer Task
**Location:** `C:\Development\Repos\founders-tab\src\lib\email.ts:7`
**Effort:** Low (15 minutes)

**Issue:**
The SendGrid API key is partially logged to console during initialization. Even partial exposure of API keys is a security risk, especially if logs are aggregated to external services.

**Evidence:**
```typescript
// Line 7 - logs first 10 characters of API key
console.log('[Email] SendGrid initialized with API key:', apiKey.substring(0, 10) + '...')
```

**Remediation:**
```typescript
// Remove API key logging entirely
if (apiKey) {
  sgMail.setApiKey(apiKey)
  console.log('[Email] SendGrid initialized successfully')
} else {
  console.warn('[Email] SendGrid API key not configured')
}
```

**Verification:**
- [ ] API key no longer logged, even partially
- [ ] Only success/failure status logged

---

### [x] HIGH-003: Missing Security Headers ✅ FIXED

**Severity:** High
**Category:** Developer Task
**Location:** `C:\Development\Repos\founders-tab\next.config.ts`
**Effort:** Low (30 minutes)

**Issue:**
The Next.js configuration does not set security headers. This leaves the application vulnerable to clickjacking, MIME-type sniffing attacks, and other browser-based attacks.

**Evidence:**
```typescript
// next.config.ts - minimal configuration, no headers
const nextConfig: NextConfig = {
  output: 'standalone',
}
```

**Remediation:**
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

**Verification:**
- [ ] Security headers added to next.config.ts
- [ ] Headers verified using browser DevTools or curl
- [ ] CSP tested and not breaking application functionality

---

### [x] HIGH-004: Email HTML Injection Vulnerability ✅ FIXED

**Severity:** High
**Category:** Developer Task
**Location:** `C:\Development\Repos\founders-tab\src\lib\email.ts:74-97`
**Effort:** Medium (1-2 hours)

**Issue:**
User-controlled data (expense description, category, submitter name, rejection reason) is directly interpolated into HTML email templates without escaping. An attacker could inject malicious HTML/JavaScript into emails sent to other users.

**Evidence:**
```typescript
// Lines 78-94 - direct interpolation of user data into HTML
export function formatExpenseDetailsHtml(expense: ExpenseDetails): string {
  return `<div style="...">
      <tr>
        <td style="...">Description</td>
        <td style="...">${expense.description}</td>  <!-- XSS vector -->
      </tr>
      // ... more unescaped interpolations
    </table>
  </div>`
}

// Line 303 - rejection reason also unescaped
const reasonBlock = `...${rejectionReason}...</p></div>`
```

**Remediation:**
Create an HTML escape utility and use it:

```typescript
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function formatExpenseDetailsHtml(expense: ExpenseDetails): string {
  return `<div style="...">
      <tr>
        <td style="...">Description</td>
        <td style="...">${escapeHtml(expense.description)}</td>
      </tr>
      // ... escape all user-provided values
    </table>
  </div>`
}
```

**Verification:**
- [ ] HTML escape function created
- [ ] All user data escaped in email templates
- [ ] Tested with payload `<script>alert('XSS')</script>` in expense description

---

## Medium Findings

### [ ] MEDIUM-001: Uploaded Files Served Without Content-Disposition Header

**Severity:** Medium
**Category:** Developer Task
**Location:** `C:\Development\Repos\founders-tab\src\app\api\upload\route.ts`
**Effort:** Medium (1 hour)

**Issue:**
Uploaded receipt files are stored in `public/uploads/receipts/` and served directly by Next.js. While file type validation exists, serving user-uploaded files without `Content-Disposition: attachment` headers could allow browser rendering of potentially malicious content (e.g., SVG with JavaScript, HTML files if validation is bypassed).

**Evidence:**
```typescript
// Files stored in public directory, served without special headers
const filepath = join(process.cwd(), 'public', 'uploads', 'receipts', filename)
await writeFile(filepath, buffer)
const url = `/uploads/receipts/${filename}`
```

**Remediation:**
Consider implementing a dedicated file serving route that sets proper headers:

```typescript
// Create src/app/api/files/[...path]/route.ts
export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  // Authenticate user
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Serve file with proper headers
  const response = new NextResponse(fileBuffer)
  response.headers.set('Content-Disposition', 'attachment; filename="receipt.pdf"')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  return response
}
```

Alternatively, add security headers at the nginx-proxy level for the `/uploads/` path.

**Verification:**
- [ ] Files served with Content-Disposition: attachment
- [ ] X-Content-Type-Options: nosniff header present
- [ ] Tested with SVG file upload attempt

---

### [ ] MEDIUM-002: Session Not Invalidated on Password Change

**Severity:** Medium
**Category:** Developer Task
**Location:** `C:\Development\Repos\founders-tab\src\app\api\users\me\change-password\route.ts`
**Effort:** Low (30 minutes)

**Issue:**
When a user changes their password, existing sessions are not invalidated. If an account was compromised, the attacker's session would remain active even after the legitimate user changes their password.

**Evidence:**
```typescript
// Lines 45-51 - password updated but sessions not cleared
const newPasswordHash = await hashPassword(validated.newPassword)

await prisma.user.update({
  where: { id: user.id },
  data: { passwordHash: newPasswordHash },
})

// Missing: await deleteAllUserSessions(user.id)
```

**Remediation:**
```typescript
import { deleteAllUserSessions, createSession, setSessionCookie } from '@/lib/auth'

// After updating password
await prisma.user.update({
  where: { id: user.id },
  data: { passwordHash: newPasswordHash },
})

// Invalidate all existing sessions
await deleteAllUserSessions(user.id)

// Create a new session for the current user
const newToken = await createSession(user.id)
await setSessionCookie(newToken)
```

**Verification:**
- [ ] All sessions invalidated on password change
- [ ] New session created for current user
- [ ] Tested by logging in from two browsers, changing password in one

---

### [ ] MEDIUM-003: Missing File Type Validation via Magic Bytes

**Severity:** Medium
**Category:** Developer Task
**Location:** `C:\Development\Repos\founders-tab\src\app\api\upload\route.ts:25`
**Effort:** Medium (1-2 hours)

**Issue:**
File type validation relies solely on the MIME type provided by the browser, which can be easily spoofed. An attacker could upload a malicious file by simply changing the Content-Type header.

**Evidence:**
```typescript
// Line 25 - MIME type from browser, not file content
if (!ALLOWED_TYPES.includes(file.type)) {
  return NextResponse.json(
    { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, PDF' },
    { status: 400 }
  )
}
```

**Remediation:**
Validate file content using magic bytes:

```typescript
const FILE_SIGNATURES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF header (need to also check for WEBP)
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
}

function validateFileSignature(buffer: Buffer, mimeType: string): boolean {
  const signature = FILE_SIGNATURES[mimeType]
  if (!signature) return false

  for (let i = 0; i < signature.length; i++) {
    if (buffer[i] !== signature[i]) return false
  }
  return true
}

// In the handler
const bytes = await file.arrayBuffer()
const buffer = Buffer.from(bytes)

if (!validateFileSignature(buffer, file.type)) {
  return NextResponse.json({ error: 'File content does not match type' }, { status: 400 })
}
```

**Verification:**
- [ ] Magic byte validation implemented
- [ ] Tested with renamed executable uploaded as image
- [ ] All allowed types have signature checks

---

### [ ] MEDIUM-004: No Middleware Protection for API Routes

**Severity:** Medium
**Category:** Developer Task
**Location:** Project Root (no middleware.ts file found)
**Effort:** Medium (2-3 hours)

**Issue:**
There is no Next.js middleware protecting routes. While individual API routes check authentication, a centralized middleware layer would provide defense-in-depth and ensure no routes are accidentally left unprotected.

**Evidence:**
No `middleware.ts` file exists in the project root or `src/` directory.

**Remediation:**
Create `src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
const publicPaths = [
  '/login',
  '/signup',
  '/invite',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/invitations/accept',
  '/', // Marketing home page
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if path is public
  const isPublic = publicPaths.some(path =>
    pathname === path || pathname.startsWith(`${path}/`)
  )

  if (isPublic) {
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionToken = request.cookies.get('session_token')?.value

  if (!sessionToken && pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
```

**Verification:**
- [ ] Middleware created and tested
- [ ] All protected routes blocked without session
- [ ] Public routes accessible without session

---

### [ ] MEDIUM-005: Console Logging in Production API Routes

**Severity:** Medium
**Category:** Developer Task
**Location:** Multiple files in `src/app/api/`
**Effort:** Medium (1-2 hours)

**Issue:**
API routes log errors and information to console, which in production could leak sensitive information to server logs accessible by hosting providers or log aggregation services.

**Evidence:**
Found 50+ instances of `console.log`, `console.error`, and `console.warn` across API routes. Examples:
- `console.error('Login error:', error)` - may log stack traces with sensitive data
- `console.error('Error creating expense:', error)` - full error objects logged

**Remediation:**
1. Create a structured logger that sanitizes sensitive data:

```typescript
// src/lib/logger.ts
const isProduction = process.env.NODE_ENV === 'production'

export const logger = {
  error: (message: string, context?: Record<string, unknown>) => {
    if (isProduction) {
      // Send to structured logging service (e.g., Sentry, LogRocket)
      // Avoid logging full error objects
      console.error(JSON.stringify({ level: 'error', message, ...sanitize(context) }))
    } else {
      console.error(message, context)
    }
  },
  // ... similar for info, warn
}

function sanitize(obj: Record<string, unknown> | undefined) {
  if (!obj) return {}
  const { password, token, passwordHash, ...safe } = obj
  return safe
}
```

2. Replace console.log/error calls with structured logger

**Verification:**
- [ ] Structured logger implemented
- [ ] All console.* calls replaced
- [ ] Sensitive data sanitized from logs

---

### [ ] MEDIUM-006: ESLint Vulnerability (Stack Overflow)

**Severity:** Medium
**Category:** DevOps Task
**Location:** `package.json` - `eslint: ^8`
**Effort:** Low (30 minutes)

**Issue:**
ESLint has a moderate severity vulnerability allowing stack overflow when serializing objects with circular references (GHSA-p5wg-g6qr-c7cg).

**Evidence:**
```
npm audit report:
eslint  <9.26.0
Severity: moderate
```

**Remediation:**
```bash
npm update eslint
# Or upgrade to ESLint 9.x with configuration migration
npx @eslint/migrate-config .eslintrc.js
npm install eslint@latest
```

**Verification:**
- [ ] ESLint updated to 9.26.0 or later
- [ ] Lint rules still work correctly
- [ ] `npm audit` shows no eslint vulnerabilities

---

## Low Findings

### [ ] LOW-001: Password Requirements Could Be Stronger

**Severity:** Low
**Category:** Developer Task
**Location:** `C:\Development\Repos\founders-tab\src\lib\validations\auth.ts:4-9`
**Effort:** Low (15 minutes)

**Issue:**
Password requirements only require 8 characters, one uppercase, one lowercase, and one number. No special character requirement and minimum length is industry-minimum.

**Evidence:**
```typescript
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
```

**Remediation:**
Consider strengthening requirements:

```typescript
const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
```

**Verification:**
- [ ] Password requirements updated
- [ ] Frontend validation messages updated

---

### [ ] LOW-002: Invitation Token in URL (Potential Referer Leakage)

**Severity:** Low
**Category:** Developer Task
**Location:** `C:\Development\Repos\founders-tab\src\lib\email.ts:184`
**Effort:** Low (30 minutes)

**Issue:**
Invitation tokens are passed in the URL path, which could leak via Referer headers if the invitation page contains external links or resources.

**Evidence:**
```typescript
const inviteUrl = `${appUrl}/invite/${token}`
```

**Remediation:**
The current implementation is acceptable since:
1. Tokens expire after 7 days
2. Tokens can only be used once
3. The Referrer-Policy header (once added in HIGH-003) mitigates this

However, consider adding `rel="noreferrer"` to any external links on the invitation page and ensure Referrer-Policy header is set.

**Verification:**
- [ ] Referrer-Policy header configured
- [ ] External links have rel="noreferrer"

---

### [ ] LOW-003: Cookie Domain Too Broad in Production Config

**Severity:** Low
**Category:** DevOps Task
**Location:** `C:\Development\Repos\founders-tab\.env.production.example:19`
**Effort:** Low (15 minutes)

**Issue:**
The cookie domain is set to `.founderstab.com` (leading dot), which allows cookies to be sent to all subdomains. If any subdomain is compromised, session cookies could be stolen.

**Evidence:**
```
COOKIE_DOMAIN=.founderstab.com
```

**Remediation:**
If no subdomains need to share sessions, remove the leading dot:
```
COOKIE_DOMAIN=founderstab.com
```

Or if subdomains exist (e.g., app.founderstab.com), ensure all subdomains are equally protected.

**Verification:**
- [ ] Cookie domain scope reviewed
- [ ] Decision documented based on subdomain usage

---

### [ ] LOW-004: Missing Database SSL Configuration in Example

**Severity:** Low
**Category:** DevOps Task
**Location:** `C:\Development\Repos\founders-tab\.env.example:11`
**Effort:** Low (10 minutes)

**Issue:**
The example DATABASE_URL doesn't include SSL configuration, which could lead to unencrypted database connections in production if deployed incorrectly.

**Evidence:**
```
DATABASE_URL="postgresql://appuser:change_this_password@localhost:5466/appdb"
```

**Remediation:**
Update the production example to include SSL:
```
# In .env.production.example
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

**Verification:**
- [ ] Production DATABASE_URL includes sslmode=require
- [ ] Database connection verified with SSL

---

### [ ] LOW-005: JWT_SECRET Referenced But Not Used

**Severity:** Low
**Category:** Developer Task
**Location:** `C:\Development\Repos\founders-tab\.env.production.example:9`
**Effort:** Low (15 minutes)

**Issue:**
`JWT_SECRET` is listed in the production environment example but the application uses database sessions, not JWTs. This could cause confusion during deployment.

**Evidence:**
```
JWT_SECRET=your_secure_jwt_secret_here
```

But no JWT usage found in the codebase (sessions are database-backed with random tokens).

**Remediation:**
Remove `JWT_SECRET` from `.env.production.example` to avoid confusion, or document that it's reserved for future use.

**Verification:**
- [ ] Unused environment variable removed or documented

---

## Passed Checks

The following security controls were verified as properly implemented:

- [x] Passwords hashed with bcrypt (cost factor 12) - `src/lib/auth/password.ts`
- [x] Session tokens are cryptographically random (32 bytes via crypto.randomBytes) - `src/lib/auth/session.ts`
- [x] Session expiration enforced (7 days) with cleanup of expired sessions - `src/lib/auth/session.ts:59-63`
- [x] Session cookies set with httpOnly, secure (production), sameSite=lax - `src/lib/auth/cookies.ts`
- [x] Password hash never returned in API responses - verified across all user endpoints
- [x] Generic error messages on login (doesn't reveal if email exists) - `src/app/api/auth/login/route.ts:20-24`
- [x] All database queries use Prisma ORM (no raw SQL injection vectors found)
- [x] Input validation with Zod on all API endpoints
- [x] Multi-tenancy isolation via companyId filtering on all data access
- [x] Role-based access control for founder-only operations (approve, reject, role changes, settings)
- [x] Expense ownership verified before updates/deletes - `src/app/api/expenses/[id]/route.ts`
- [x] Company membership verified before accessing team/expense data
- [x] Cannot approve own expenses - `src/app/api/expenses/[id]/approve/route.ts:57-62`
- [x] File upload has size limits (5MB) and type restrictions
- [x] Docker container runs as non-root user - `Dockerfile:70`
- [x] Environment files properly gitignored
- [x] No XSS vectors in React components (no dangerouslySetInnerHTML, no eval)
- [x] Signup email enumeration mitigated (generic error could be improved)

---

## Recommended Security Tools

### Add to CI/CD Pipeline

| Tool | Purpose | Command | Priority |
|------|---------|---------|----------|
| npm audit | Dependency vulnerabilities | `npm audit --audit-level=high` | High |
| Trivy | Container scanning | `trivy image founderstab-app:latest` | High |
| eslint-plugin-security | Static analysis | Add to ESLint config | Medium |
| secretlint | Secret detection | `npx secretlint "**/*"` | Medium |

### Infrastructure Monitoring

| Tool | Purpose | Installation |
|------|---------|--------------|
| Fail2ban | Brute force protection | `apt install fail2ban` |
| UFW | Firewall | `apt install ufw` |
| Lynis | System audit | `lynis audit system` |

### Ongoing Monitoring (Optional)

| Service | Purpose | Cost |
|---------|---------|------|
| UptimeRobot | Uptime + SSL monitoring | Free |
| Sentry | Error tracking + security alerts | Free tier |
| Snyk | Continuous dependency scanning | Free tier |

---

## DevOps Hardening Commands

### Firewall Setup (Ubuntu)
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### SSH Hardening
```bash
# Edit /etc/ssh/sshd_config:
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication yes

# Then restart:
sudo systemctl restart sshd
```

### Fail2ban Installation
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

---

## Action Plan

### Immediate (Today)
- [ ] CRITICAL-001: Fix path traversal in file upload
- [ ] CRITICAL-002: Update Next.js to patched version
- [ ] HIGH-002: Remove API key logging

### This Week
- [ ] HIGH-001: Implement rate limiting on auth endpoints
- [ ] HIGH-003: Add security headers to next.config.ts
- [ ] HIGH-004: Escape HTML in email templates
- [ ] MEDIUM-002: Invalidate sessions on password change

### Next Sprint
- [ ] MEDIUM-001: Add Content-Disposition headers for uploads
- [ ] MEDIUM-003: Implement magic byte validation
- [ ] MEDIUM-004: Create middleware for route protection
- [ ] MEDIUM-005: Implement structured logging
- [ ] MEDIUM-006: Update ESLint

### Backlog
- [ ] LOW-001: Strengthen password requirements
- [ ] LOW-002: Verify Referrer-Policy configuration
- [ ] LOW-003: Review cookie domain scope
- [ ] LOW-004: Document SSL requirements
- [ ] LOW-005: Clean up unused JWT_SECRET reference

### Recurring
- [ ] Monthly: Run `npm audit` and update dependencies
- [ ] Monthly: Review access logs for anomalies
- [ ] Quarterly: Re-run this security audit
- [ ] Quarterly: Rotate secrets and API keys
