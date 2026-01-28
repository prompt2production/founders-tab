import { describe, it, expect } from 'vitest'
import {
  buildNotificationEmail,
  formatExpenseDetailsHtml,
  formatExpenseDetailsText,
} from '@/lib/email'

const sampleExpense = {
  description: 'Team lunch at restaurant',
  amount: '$45.99',
  category: 'FOOD',
  date: '2026-01-15',
  submitterName: 'Jane Doe',
}

describe('formatExpenseDetailsHtml', () => {
  it('returns HTML containing all expense fields', () => {
    const html = formatExpenseDetailsHtml(sampleExpense)

    expect(html).toContain('Team lunch at restaurant')
    expect(html).toContain('$45.99')
    expect(html).toContain('FOOD')
    expect(html).toContain('2026-01-15')
    expect(html).toContain('Jane Doe')
  })

  it('returns HTML table structure', () => {
    const html = formatExpenseDetailsHtml(sampleExpense)

    expect(html).toContain('<table')
    expect(html).toContain('Description')
    expect(html).toContain('Amount')
    expect(html).toContain('Category')
    expect(html).toContain('Date')
    expect(html).toContain('Submitted by')
  })
})

describe('formatExpenseDetailsText', () => {
  it('returns plain text containing all expense fields', () => {
    const text = formatExpenseDetailsText(sampleExpense)

    expect(text).toContain('Team lunch at restaurant')
    expect(text).toContain('$45.99')
    expect(text).toContain('FOOD')
    expect(text).toContain('2026-01-15')
    expect(text).toContain('Jane Doe')
  })
})

describe('buildNotificationEmail', () => {
  const params = {
    title: 'Expense Approved',
    bodyHtml: '<p>Your expense has been approved by all founders.</p>',
    ctaText: 'View Expense',
    ctaUrl: 'http://localhost:3000/expenses',
  }

  it('returns html and text properties', () => {
    const result = buildNotificationEmail(params)

    expect(result).toHaveProperty('html')
    expect(result).toHaveProperty('text')
    expect(typeof result.html).toBe('string')
    expect(typeof result.text).toBe('string')
  })

  it('html includes gradient header with Founders Tab branding', () => {
    const { html } = buildNotificationEmail(params)

    expect(html).toContain('Founders Tab')
    expect(html).toContain('linear-gradient(135deg, #f97316')
    expect(html).toContain('#dc2626')
  })

  it('html includes dark background body', () => {
    const { html } = buildNotificationEmail(params)

    expect(html).toContain('#1a1a1a')
  })

  it('html includes title', () => {
    const { html } = buildNotificationEmail(params)

    expect(html).toContain('Expense Approved')
  })

  it('html includes body content', () => {
    const { html } = buildNotificationEmail(params)

    expect(html).toContain('Your expense has been approved by all founders.')
  })

  it('html includes CTA button with correct text and link', () => {
    const { html } = buildNotificationEmail(params)

    expect(html).toContain('View Expense')
    expect(html).toContain('http://localhost:3000/expenses')
  })

  it('html includes fallback link', () => {
    const { html } = buildNotificationEmail(params)

    // The URL should appear at least twice (CTA button + fallback text link)
    const urlMatches = html.match(/http:\/\/localhost:3000\/expenses/g)
    expect(urlMatches!.length).toBeGreaterThanOrEqual(2)
  })

  it('text includes title', () => {
    const { text } = buildNotificationEmail(params)

    expect(text).toContain('Expense Approved')
  })

  it('text includes body content without HTML tags', () => {
    const { text } = buildNotificationEmail(params)

    expect(text).toContain('Your expense has been approved by all founders.')
    expect(text).not.toContain('<p>')
  })

  it('text includes CTA link', () => {
    const { text } = buildNotificationEmail(params)

    expect(text).toContain('View Expense')
    expect(text).toContain('http://localhost:3000/expenses')
  })
})
