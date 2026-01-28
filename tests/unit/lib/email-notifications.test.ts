import { describe, it, expect, vi, beforeEach } from 'vitest'

// Set env BEFORE any module loading (vi.hoisted runs before imports)
vi.hoisted(() => {
  process.env.SENDGRID_API_KEY = 'SG.test-key-for-notifications'
})

// Mock SendGrid to prevent actual API calls
vi.mock('@sendgrid/mail', () => ({
  default: {
    setApiKey: vi.fn(),
    send: vi.fn().mockResolvedValue([{ statusCode: 202 }]),
  },
}))

import {
  sendExpenseAwaitingApprovalEmail,
  sendExpenseApprovedEmail,
  sendExpenseRejectedEmail,
  sendWithdrawalApprovedEmail,
  sendWithdrawalRejectedEmail,
} from '@/lib/email'
import sgMail from '@sendgrid/mail'

const sampleExpense = {
  description: 'Team lunch at restaurant',
  amount: '$45.99',
  category: 'FOOD',
  date: '2026-01-15',
  submitterName: 'Jane Doe',
}

describe('sendExpenseAwaitingApprovalEmail', () => {
  beforeEach(() => {
    vi.mocked(sgMail.send).mockClear()
  })

  it('sends email with correct subject', async () => {
    await sendExpenseAwaitingApprovalEmail({
      to: 'founder@example.com',
      expense: sampleExpense,
    })

    expect(sgMail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'New expense from Jane Doe needs your approval',
      })
    )
  })

  it('sends email to correct recipient', async () => {
    await sendExpenseAwaitingApprovalEmail({
      to: 'founder@example.com',
      expense: sampleExpense,
    })

    expect(sgMail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'founder@example.com',
      })
    )
  })

  it('includes expense details in HTML body', async () => {
    await sendExpenseAwaitingApprovalEmail({
      to: 'founder@example.com',
      expense: sampleExpense,
    })

    const call = vi.mocked(sgMail.send).mock.calls[0][0] as { html: string }
    expect(call.html).toContain('Team lunch at restaurant')
    expect(call.html).toContain('$45.99')
    expect(call.html).toContain('FOOD')
    expect(call.html).toContain('Jane Doe')
  })

  it('includes Review Expense CTA', async () => {
    await sendExpenseAwaitingApprovalEmail({
      to: 'founder@example.com',
      expense: sampleExpense,
    })

    const call = vi.mocked(sgMail.send).mock.calls[0][0] as { html: string }
    expect(call.html).toContain('Review Expense')
  })

  it('generates plain text fallback', async () => {
    await sendExpenseAwaitingApprovalEmail({
      to: 'founder@example.com',
      expense: sampleExpense,
    })

    const call = vi.mocked(sgMail.send).mock.calls[0][0] as { text: string }
    expect(call.text).toBeTruthy()
    expect(call.text).not.toContain('<p>')
  })
})

describe('sendExpenseApprovedEmail', () => {
  beforeEach(() => {
    vi.mocked(sgMail.send).mockClear()
  })

  it('sends email with correct subject', async () => {
    await sendExpenseApprovedEmail({
      to: 'user@example.com',
      expense: sampleExpense,
    })

    expect(sgMail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Your expense has been approved',
      })
    )
  })

  it('includes expense details in HTML body', async () => {
    await sendExpenseApprovedEmail({
      to: 'user@example.com',
      expense: sampleExpense,
    })

    const call = vi.mocked(sgMail.send).mock.calls[0][0] as { html: string }
    expect(call.html).toContain('Team lunch at restaurant')
    expect(call.html).toContain('$45.99')
  })

  it('includes View Expense CTA', async () => {
    await sendExpenseApprovedEmail({
      to: 'user@example.com',
      expense: sampleExpense,
    })

    const call = vi.mocked(sgMail.send).mock.calls[0][0] as { html: string }
    expect(call.html).toContain('View Expense')
  })

  it('generates plain text fallback', async () => {
    await sendExpenseApprovedEmail({
      to: 'user@example.com',
      expense: sampleExpense,
    })

    const call = vi.mocked(sgMail.send).mock.calls[0][0] as { text: string }
    expect(call.text).toBeTruthy()
    expect(call.text).not.toContain('<p>')
  })
})

describe('sendExpenseRejectedEmail', () => {
  beforeEach(() => {
    vi.mocked(sgMail.send).mockClear()
  })

  it('sends email with correct subject', async () => {
    await sendExpenseRejectedEmail({
      to: 'user@example.com',
      expense: sampleExpense,
      rejectorName: 'Bob Founder',
      rejectionReason: 'Insufficient documentation',
    })

    expect(sgMail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Your expense has been rejected',
      })
    )
  })

  it('includes expense details in HTML body', async () => {
    await sendExpenseRejectedEmail({
      to: 'user@example.com',
      expense: sampleExpense,
      rejectorName: 'Bob Founder',
      rejectionReason: 'Insufficient documentation',
    })

    const call = vi.mocked(sgMail.send).mock.calls[0][0] as { html: string }
    expect(call.html).toContain('Team lunch at restaurant')
    expect(call.html).toContain('$45.99')
  })

  it('includes rejection reason in HTML', async () => {
    await sendExpenseRejectedEmail({
      to: 'user@example.com',
      expense: sampleExpense,
      rejectorName: 'Bob Founder',
      rejectionReason: 'Insufficient documentation',
    })

    const call = vi.mocked(sgMail.send).mock.calls[0][0] as { html: string }
    expect(call.html).toContain('Insufficient documentation')
  })

  it('includes rejector name in HTML', async () => {
    await sendExpenseRejectedEmail({
      to: 'user@example.com',
      expense: sampleExpense,
      rejectorName: 'Bob Founder',
      rejectionReason: 'Insufficient documentation',
    })

    const call = vi.mocked(sgMail.send).mock.calls[0][0] as { html: string }
    expect(call.html).toContain('Bob Founder')
  })

  it('generates plain text fallback', async () => {
    await sendExpenseRejectedEmail({
      to: 'user@example.com',
      expense: sampleExpense,
      rejectorName: 'Bob Founder',
      rejectionReason: 'Insufficient documentation',
    })

    const call = vi.mocked(sgMail.send).mock.calls[0][0] as { text: string }
    expect(call.text).toBeTruthy()
    expect(call.text).not.toContain('<p>')
  })
})

describe('sendWithdrawalApprovedEmail', () => {
  beforeEach(() => {
    vi.mocked(sgMail.send).mockClear()
  })

  it('sends email with correct subject', async () => {
    await sendWithdrawalApprovedEmail({
      to: 'user@example.com',
      expense: sampleExpense,
    })

    expect(sgMail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Your withdrawal request has been approved',
      })
    )
  })

  it('includes expense details in HTML body', async () => {
    await sendWithdrawalApprovedEmail({
      to: 'user@example.com',
      expense: sampleExpense,
    })

    const call = vi.mocked(sgMail.send).mock.calls[0][0] as { html: string }
    expect(call.html).toContain('Team lunch at restaurant')
    expect(call.html).toContain('$45.99')
  })

  it('includes Confirm Receipt CTA', async () => {
    await sendWithdrawalApprovedEmail({
      to: 'user@example.com',
      expense: sampleExpense,
    })

    const call = vi.mocked(sgMail.send).mock.calls[0][0] as { html: string }
    expect(call.html).toContain('Confirm Receipt')
  })

  it('generates plain text fallback', async () => {
    await sendWithdrawalApprovedEmail({
      to: 'user@example.com',
      expense: sampleExpense,
    })

    const call = vi.mocked(sgMail.send).mock.calls[0][0] as { text: string }
    expect(call.text).toBeTruthy()
    expect(call.text).not.toContain('<p>')
  })
})

describe('sendWithdrawalRejectedEmail', () => {
  beforeEach(() => {
    vi.mocked(sgMail.send).mockClear()
  })

  it('sends email with correct subject', async () => {
    await sendWithdrawalRejectedEmail({
      to: 'user@example.com',
      expense: sampleExpense,
      rejectorName: 'Alice Founder',
      rejectionReason: 'Need receipts first',
    })

    expect(sgMail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Your withdrawal request has been rejected',
      })
    )
  })

  it('includes expense details in HTML body', async () => {
    await sendWithdrawalRejectedEmail({
      to: 'user@example.com',
      expense: sampleExpense,
      rejectorName: 'Alice Founder',
      rejectionReason: 'Need receipts first',
    })

    const call = vi.mocked(sgMail.send).mock.calls[0][0] as { html: string }
    expect(call.html).toContain('Team lunch at restaurant')
    expect(call.html).toContain('$45.99')
  })

  it('includes rejection reason in HTML', async () => {
    await sendWithdrawalRejectedEmail({
      to: 'user@example.com',
      expense: sampleExpense,
      rejectorName: 'Alice Founder',
      rejectionReason: 'Need receipts first',
    })

    const call = vi.mocked(sgMail.send).mock.calls[0][0] as { html: string }
    expect(call.html).toContain('Need receipts first')
  })

  it('includes rejector name in HTML', async () => {
    await sendWithdrawalRejectedEmail({
      to: 'user@example.com',
      expense: sampleExpense,
      rejectorName: 'Alice Founder',
      rejectionReason: 'Need receipts first',
    })

    const call = vi.mocked(sgMail.send).mock.calls[0][0] as { html: string }
    expect(call.html).toContain('Alice Founder')
  })

  it('generates plain text fallback', async () => {
    await sendWithdrawalRejectedEmail({
      to: 'user@example.com',
      expense: sampleExpense,
      rejectorName: 'Alice Founder',
      rejectionReason: 'Need receipts first',
    })

    const call = vi.mocked(sgMail.send).mock.calls[0][0] as { text: string }
    expect(call.text).toBeTruthy()
    expect(call.text).not.toContain('<p>')
  })
})
