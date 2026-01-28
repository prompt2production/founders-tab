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
