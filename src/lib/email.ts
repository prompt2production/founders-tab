import sgMail from '@sendgrid/mail'

// Initialize SendGrid with API key
const apiKey = process.env.SENDGRID_API_KEY
if (apiKey) {
  sgMail.setApiKey(apiKey)
  console.log('[Email] SendGrid initialized with API key:', apiKey.substring(0, 10) + '...')
} else {
  console.warn('[Email] SendGrid API key not found in environment')
}

const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'hello@founderstab.com'
const fromName = process.env.SENDGRID_FROM_NAME || 'Founders Tab'
const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000'

console.log('[Email] Configuration:', { fromEmail, fromName, appUrl })

interface SendEmailOptions {
  to: string
  subject: string
  text: string
  html: string
}

export async function sendEmail({ to, subject, text, html }: SendEmailOptions): Promise<boolean> {
  console.log('[Email] Attempting to send email:', { to, subject, fromEmail, fromName })

  if (!apiKey) {
    console.error('[Email] FAILED: SendGrid API key not configured')
    return false
  }

  try {
    const response = await sgMail.send({
      to,
      from: {
        email: fromEmail,
        name: fromName,
      },
      subject,
      text,
      html,
    })
    console.log('[Email] SUCCESS: Email sent to', to)
    console.log('[Email] SendGrid response status:', response[0].statusCode)
    return true
  } catch (error: unknown) {
    console.error('[Email] FAILED: Error sending email to', to)
    console.error('[Email] Error details:', error)

    // Log SendGrid-specific error details
    if (error && typeof error === 'object' && 'response' in error) {
      const sgError = error as { response?: { body?: unknown } }
      console.error('[Email] SendGrid error body:', sgError.response?.body)
    }

    return false
  }
}

// ============================================
// Shared Notification Layout Helpers
// ============================================

interface ExpenseDetails {
  description: string
  amount: string
  category: string
  date: string
  submitterName: string
}

export function formatExpenseDetailsHtml(expense: ExpenseDetails): string {
  return `<div style="background: #262626; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 4px 8px 4px 0; color: #a1a1aa; font-size: 13px;">Description</td>
          <td style="padding: 4px 0; color: #e5e5e5; font-size: 13px;">${expense.description}</td>
        </tr>
        <tr>
          <td style="padding: 4px 8px 4px 0; color: #a1a1aa; font-size: 13px;">Amount</td>
          <td style="padding: 4px 0; color: #e5e5e5; font-size: 13px; font-weight: 600;">${expense.amount}</td>
        </tr>
        <tr>
          <td style="padding: 4px 8px 4px 0; color: #a1a1aa; font-size: 13px;">Category</td>
          <td style="padding: 4px 0; color: #e5e5e5; font-size: 13px;">${expense.category}</td>
        </tr>
        <tr>
          <td style="padding: 4px 8px 4px 0; color: #a1a1aa; font-size: 13px;">Date</td>
          <td style="padding: 4px 0; color: #e5e5e5; font-size: 13px;">${expense.date}</td>
        </tr>
        <tr>
          <td style="padding: 4px 8px 4px 0; color: #a1a1aa; font-size: 13px;">Submitted by</td>
          <td style="padding: 4px 0; color: #e5e5e5; font-size: 13px;">${expense.submitterName}</td>
        </tr>
      </table>
    </div>`
}

export function formatExpenseDetailsText(expense: ExpenseDetails): string {
  return `Description: ${expense.description}
Amount: ${expense.amount}
Category: ${expense.category}
Date: ${expense.date}
Submitted by: ${expense.submitterName}`
}

interface BuildNotificationEmailParams {
  title: string
  bodyHtml: string
  ctaText: string
  ctaUrl: string
}

export function buildNotificationEmail({
  title,
  bodyHtml,
  ctaText,
  ctaUrl,
}: BuildNotificationEmailParams): { html: string; text: string } {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); padding: 30px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Founders Tab</h1>
  </div>

  <div style="background: #1a1a1a; padding: 30px; border-radius: 0 0 12px 12px; color: #e5e5e5;">
    <h2 style="color: #f97316; margin-top: 0;">${title}</h2>

    ${bodyHtml}

    <div style="text-align: center; margin: 30px 0;">
      <a href="${ctaUrl}" style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">${ctaText}</a>
    </div>

    <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;">

    <p style="color: #666; font-size: 12px;">Can't click the button? Copy and paste this link:<br>
    <a href="${ctaUrl}" style="color: #f97316; word-break: break-all;">${ctaUrl}</a></p>
  </div>
</body>
</html>`

  // Strip HTML tags for plain text fallback
  const textBody = bodyHtml
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const text = `${title}

${textBody}

${ctaText}: ${ctaUrl}`

  return { html, text }
}

// ============================================
// Invitation Email
// ============================================

interface InvitationEmailParams {
  to: string
  inviterName: string
  token: string
  message?: string | null
}

export async function sendInvitationEmail({
  to,
  inviterName,
  token,
  message,
}: InvitationEmailParams): Promise<boolean> {
  console.log('[Email] Preparing invitation email:', { to, inviterName, hasMessage: !!message })

  const inviteUrl = `${appUrl}/invite/${token}`
  console.log('[Email] Invite URL:', inviteUrl)

  const subject = `${inviterName} invited you to join Founders Tab`

  const text = `
${inviterName} has invited you to join their team on Founders Tab.

${message ? `Message: "${message}"` : ''}

Founders Tab helps co-founders track business expenses before company incorporation.

Click the link below to accept the invitation:
${inviteUrl}

This invitation will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.
`.trim()

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); padding: 30px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Founders Tab</h1>
  </div>

  <div style="background: #1a1a1a; padding: 30px; border-radius: 0 0 12px 12px; color: #e5e5e5;">
    <h2 style="color: #f97316; margin-top: 0;">You're Invited!</h2>

    <p><strong>${inviterName}</strong> has invited you to join their team on Founders Tab.</p>

    ${message ? `<div style="background: #262626; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;"><em>"${message}"</em></div>` : ''}

    <p>Founders Tab helps co-founders track business expenses before company incorporation, making it easy to maintain clear records for future reimbursement.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${inviteUrl}" style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Accept Invitation</a>
    </div>

    <p style="color: #888; font-size: 14px;">This invitation will expire in 7 days.</p>

    <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;">

    <p style="color: #666; font-size: 12px;">If you didn't expect this invitation, you can safely ignore this email.</p>

    <p style="color: #666; font-size: 12px;">Can't click the button? Copy and paste this link:<br>
    <a href="${inviteUrl}" style="color: #f97316; word-break: break-all;">${inviteUrl}</a></p>
  </div>
</body>
</html>
`.trim()

  const result = await sendEmail({ to, subject, text, html })
  console.log('[Email] Invitation email result:', { to, success: result })
  return result
}

// ============================================
// Expense Notification Emails
// ============================================

interface ExpenseNotificationParams {
  to: string
  expense: ExpenseDetails
}

export async function sendExpenseAwaitingApprovalEmail({
  to,
  expense,
}: ExpenseNotificationParams): Promise<boolean> {
  const subject = `New expense from ${expense.submitterName} needs your approval`
  const expenseCard = formatExpenseDetailsHtml(expense)
  const bodyHtml = `<p><strong>${expense.submitterName}</strong> submitted a new expense that needs your approval.</p>${expenseCard}`
  const { html, text } = buildNotificationEmail({
    title: 'New Expense Awaiting Approval',
    bodyHtml,
    ctaText: 'Review Expense',
    ctaUrl: `${appUrl}/expenses`,
  })

  return sendEmail({ to, subject, text, html })
}

export async function sendExpenseApprovedEmail({
  to,
  expense,
}: ExpenseNotificationParams): Promise<boolean> {
  const subject = 'Your expense has been approved'
  const expenseCard = formatExpenseDetailsHtml(expense)
  const bodyHtml = `<p>Your expense has been approved by all founders. You can now request a withdrawal when ready.</p>${expenseCard}`
  const { html, text } = buildNotificationEmail({
    title: 'Expense Approved',
    bodyHtml,
    ctaText: 'View Expense',
    ctaUrl: `${appUrl}/expenses`,
  })

  return sendEmail({ to, subject, text, html })
}

interface RejectionNotificationParams extends ExpenseNotificationParams {
  rejectorName: string
  rejectionReason: string
}

export async function sendExpenseRejectedEmail({
  to,
  expense,
  rejectorName,
  rejectionReason,
}: RejectionNotificationParams): Promise<boolean> {
  const subject = 'Your expense has been rejected'
  const expenseCard = formatExpenseDetailsHtml(expense)
  const reasonBlock = `<div style="background: #450a0a; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f87171;"><p style="margin: 0 0 8px 0; color: #f87171; font-weight: 600;">Rejected by ${rejectorName}</p><p style="margin: 0; color: #e5e5e5;">${rejectionReason}</p></div>`
  const bodyHtml = `<p>Your expense has been rejected.</p>${expenseCard}${reasonBlock}`
  const { html, text } = buildNotificationEmail({
    title: 'Expense Rejected',
    bodyHtml,
    ctaText: 'View Expense',
    ctaUrl: `${appUrl}/expenses`,
  })

  return sendEmail({ to, subject, text, html })
}

export async function sendWithdrawalApprovedEmail({
  to,
  expense,
}: ExpenseNotificationParams): Promise<boolean> {
  const subject = 'Your withdrawal request has been approved'
  const expenseCard = formatExpenseDetailsHtml(expense)
  const bodyHtml = `<p>Your withdrawal request has been approved by all founders. Please confirm receipt once you have received the funds.</p>${expenseCard}`
  const { html, text } = buildNotificationEmail({
    title: 'Withdrawal Approved',
    bodyHtml,
    ctaText: 'Confirm Receipt',
    ctaUrl: `${appUrl}/expenses`,
  })

  return sendEmail({ to, subject, text, html })
}

export async function sendWithdrawalRejectedEmail({
  to,
  expense,
  rejectorName,
  rejectionReason,
}: RejectionNotificationParams): Promise<boolean> {
  const subject = 'Your withdrawal request has been rejected'
  const expenseCard = formatExpenseDetailsHtml(expense)
  const reasonBlock = `<div style="background: #450a0a; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f87171;"><p style="margin: 0 0 8px 0; color: #f87171; font-weight: 600;">Rejected by ${rejectorName}</p><p style="margin: 0; color: #e5e5e5;">${rejectionReason}</p></div>`
  const bodyHtml = `<p>Your withdrawal request has been rejected.</p>${expenseCard}${reasonBlock}`
  const { html, text } = buildNotificationEmail({
    title: 'Withdrawal Rejected',
    bodyHtml,
    ctaText: 'View Expense',
    ctaUrl: `${appUrl}/expenses`,
  })

  return sendEmail({ to, subject, text, html })
}

// ============================================
// Role Change Notification Emails
// ============================================

interface PromotedToFounderParams {
  to: string
  userName: string
}

export async function sendPromotedToFounderEmail({
  to,
  userName,
}: PromotedToFounderParams): Promise<boolean> {
  const subject = "You've been made a founder"
  const bodyHtml = `<p>Hi <strong>${userName}</strong>,</p>
    <p>You have been promoted to a <strong>Founder</strong> on Founders Tab.</p>
    <p>As a founder, you will now need to approve any expenses logged by other members before they can be processed. You can review pending expenses from the Expenses page.</p>`
  const { html, text } = buildNotificationEmail({
    title: "You're Now a Founder",
    bodyHtml,
    ctaText: 'View Expenses',
    ctaUrl: `${appUrl}/expenses`,
  })

  return sendEmail({ to, subject, text, html })
}

// ============================================
// Approval Nudge Emails
// ============================================

interface NudgeEmailParams extends ExpenseNotificationParams {
  nudgeType: 'expense' | 'withdrawal'
}

export async function sendApprovalNudgeEmail({
  to,
  expense,
  nudgeType,
}: NudgeEmailParams): Promise<boolean> {
  const isWithdrawal = nudgeType === 'withdrawal'
  const subject = isWithdrawal
    ? `Reminder: ${expense.submitterName}'s withdrawal needs your approval`
    : `Reminder: ${expense.submitterName}'s expense needs your approval`

  const expenseCard = formatExpenseDetailsHtml(expense)
  const bodyHtml = `<p>This is a friendly reminder that <strong>${expense.submitterName}</strong>'s ${isWithdrawal ? 'withdrawal request' : 'expense'} is waiting for your approval.</p>${expenseCard}`

  const { html, text } = buildNotificationEmail({
    title: isWithdrawal ? 'Withdrawal Reminder' : 'Expense Reminder',
    bodyHtml,
    ctaText: 'Review Now',
    ctaUrl: `${appUrl}/expenses`,
  })

  return sendEmail({ to, subject, text, html })
}

// ============================================
// Bulk Approval Nudge Emails (Consolidated)
// ============================================

interface BulkExpenseItem {
  description: string
  amount: string
  category: string
  date: string
}

interface BulkNudgeEmailParams {
  to: string
  expenses: BulkExpenseItem[]
  submitterName: string
  nudgeType: 'expense' | 'withdrawal'
}

function formatBulkExpenseListHtml(expenses: BulkExpenseItem[]): string {
  const rows = expenses.map((e) => `
    <tr>
      <td style="padding: 8px; color: #e5e5e5; font-size: 13px; border-bottom: 1px solid #333;">${e.description}</td>
      <td style="padding: 8px; color: #e5e5e5; font-size: 13px; border-bottom: 1px solid #333; text-align: right; font-weight: 600;">${e.amount}</td>
      <td style="padding: 8px; color: #a1a1aa; font-size: 13px; border-bottom: 1px solid #333;">${e.category}</td>
      <td style="padding: 8px; color: #a1a1aa; font-size: 13px; border-bottom: 1px solid #333;">${e.date}</td>
    </tr>
  `).join('')

  // Calculate total
  const total = expenses.reduce((sum, e) => {
    const numericAmount = parseFloat(e.amount.replace(/[^0-9.-]/g, ''))
    return sum + (isNaN(numericAmount) ? 0 : numericAmount)
  }, 0)

  // Extract currency symbol from first expense
  const currencyMatch = expenses[0]?.amount.match(/^[^0-9]+/)
  const currencySymbol = currencyMatch ? currencyMatch[0] : '$'

  return `<div style="background: #262626; padding: 16px; border-radius: 8px; margin: 20px 0; overflow-x: auto;">
    <table style="width: 100%; border-collapse: collapse; min-width: 400px;">
      <thead>
        <tr>
          <th style="padding: 8px; color: #a1a1aa; font-size: 12px; text-align: left; border-bottom: 1px solid #444;">Description</th>
          <th style="padding: 8px; color: #a1a1aa; font-size: 12px; text-align: right; border-bottom: 1px solid #444;">Amount</th>
          <th style="padding: 8px; color: #a1a1aa; font-size: 12px; text-align: left; border-bottom: 1px solid #444;">Category</th>
          <th style="padding: 8px; color: #a1a1aa; font-size: 12px; text-align: left; border-bottom: 1px solid #444;">Date</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
      <tfoot>
        <tr>
          <td style="padding: 12px 8px; color: #e5e5e5; font-size: 14px; font-weight: 600;">Total (${expenses.length} expenses)</td>
          <td style="padding: 12px 8px; color: #f97316; font-size: 14px; font-weight: 600; text-align: right;">${currencySymbol}${total.toFixed(2)}</td>
          <td colspan="2"></td>
        </tr>
      </tfoot>
    </table>
  </div>`
}

export async function sendBulkApprovalNudgeEmail({
  to,
  expenses,
  submitterName,
  nudgeType,
}: BulkNudgeEmailParams): Promise<boolean> {
  const isWithdrawal = nudgeType === 'withdrawal'
  const count = expenses.length
  const subject = isWithdrawal
    ? `Reminder: ${count} withdrawal${count > 1 ? 's' : ''} from ${submitterName} need${count === 1 ? 's' : ''} your approval`
    : `Reminder: ${count} expense${count > 1 ? 's' : ''} from ${submitterName} need${count === 1 ? 's' : ''} your approval`

  const expenseList = formatBulkExpenseListHtml(expenses)
  const bodyHtml = `<p>This is a friendly reminder that <strong>${submitterName}</strong> has <strong>${count}</strong> ${isWithdrawal ? 'withdrawal request' : 'expense'}${count > 1 ? 's' : ''} waiting for your approval.</p>${expenseList}`

  const { html, text } = buildNotificationEmail({
    title: isWithdrawal ? 'Withdrawal Reminders' : 'Expense Reminders',
    bodyHtml,
    ctaText: 'Review Now',
    ctaUrl: `${appUrl}/expenses`,
  })

  return sendEmail({ to, subject, text, html })
}
