'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Bell, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'
import { triggerDataRefresh } from '@/lib/data-refresh'
import { useCompanySettings } from '@/hooks/useCompanySettings'
import { formatCurrency } from '@/lib/format-currency'

interface PendingApprover {
  id: string
  name: string
}

interface NudgeableExpense {
  id: string
  description: string
  amount: number | string
  date: Date | string
  category: string
  status: 'PENDING_APPROVAL' | 'WITHDRAWAL_REQUESTED'
  lastNudgeAt?: string | null
  pendingApprovers?: PendingApprover[]
}

interface NudgeConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerExpense: NudgeableExpense
  allNudgeableExpenses: NudgeableExpense[]
  onSuccess?: () => void
}

export function NudgeConfirmationDialog({
  open,
  onOpenChange,
  triggerExpense,
  allNudgeableExpenses,
  onSuccess,
}: NudgeConfirmationDialogProps) {
  const { currencySymbol, currency, nudgeCooldownHours } = useCompanySettings()
  const [isLoading, setIsLoading] = useState(false)
  const [selection, setSelection] = useState<'single' | 'all'>('single')

  // Filter to only expenses that can be nudged (not on cooldown)
  const cooldownMs = nudgeCooldownHours * 60 * 60 * 1000
  const now = Date.now()

  const isOnCooldown = (expense: NudgeableExpense) => {
    if (nudgeCooldownHours === 0) return false
    if (!expense.lastNudgeAt) return false
    const lastNudgeTime = new Date(expense.lastNudgeAt).getTime()
    return lastNudgeTime + cooldownMs > now
  }

  const nudgeableExpenses = allNudgeableExpenses.filter((e) => !isOnCooldown(e))
  const hasMultiple = nudgeableExpenses.length > 1

  // Calculate total amount
  const totalAmount = nudgeableExpenses.reduce((sum, e) => {
    const amount = typeof e.amount === 'string' ? parseFloat(e.amount) : e.amount
    return sum + amount
  }, 0)

  // Get unique approvers who will receive emails
  const getUniqueApprovers = (expenses: NudgeableExpense[]): PendingApprover[] => {
    const approverMap = new Map<string, PendingApprover>()
    expenses.forEach((e) => {
      e.pendingApprovers?.forEach((approver) => {
        if (!approverMap.has(approver.id)) {
          approverMap.set(approver.id, approver)
        }
      })
    })
    return Array.from(approverMap.values())
  }

  const approversForSelection = selection === 'single'
    ? triggerExpense.pendingApprovers || []
    : getUniqueApprovers(nudgeableExpenses)

  async function handleNudge() {
    setIsLoading(true)

    try {
      if (selection === 'single') {
        // Single nudge
        const response = await fetch(`/api/expenses/${triggerExpense.id}/nudge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send reminder')
        }

        toast.success('Reminder sent', {
          description: `Sent to ${data.nudgedCount} approver${data.nudgedCount > 1 ? 's' : ''}`,
        })
      } else {
        // Bulk nudge
        const response = await fetch('/api/expenses/nudge-bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            expenseIds: nudgeableExpenses.map((e) => e.id),
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send reminders')
        }

        const description = data.skippedCount > 0
          ? `Sent for ${data.nudgedCount} expense${data.nudgedCount > 1 ? 's' : ''} to ${data.approversNotified} approver${data.approversNotified > 1 ? 's' : ''} (${data.skippedCount} skipped due to cooldown)`
          : `Sent for ${data.nudgedCount} expense${data.nudgedCount > 1 ? 's' : ''} to ${data.approversNotified} approver${data.approversNotified > 1 ? 's' : ''}`

        toast.success('Reminders sent', { description })
      }

      triggerDataRefresh('all')
      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      toast.error('Failed to send reminder', { description: message })
    } finally {
      setIsLoading(false)
    }
  }

  // Format expense for display
  const formatExpenseDisplay = (expense: NudgeableExpense) => {
    const date = expense.date instanceof Date ? expense.date : new Date(expense.date)
    const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
    return {
      description: expense.description,
      amount: formatCurrency(amount, currencySymbol, currency),
      date: format(date, 'MMM d, yyyy'),
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Send Reminder
          </DialogTitle>
          <DialogDescription>
            Notify approvers about pending expense{hasMultiple ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {hasMultiple ? (
            <RadioGroup
              value={selection}
              onValueChange={(value: string) => setSelection(value as 'single' | 'all')}
              className="space-y-4"
            >
              {/* Single expense option */}
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="single" id="single" className="mt-1" />
                <Label htmlFor="single" className="flex-1 cursor-pointer">
                  <div className="font-medium">This expense only</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {formatExpenseDisplay(triggerExpense).description} — {formatExpenseDisplay(triggerExpense).amount}
                  </div>
                </Label>
              </div>

              {/* All expenses option */}
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="all" id="all" className="mt-1" />
                <Label htmlFor="all" className="flex-1 cursor-pointer">
                  <div className="font-medium">
                    All {nudgeableExpenses.length} pending expenses
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Total: {formatCurrency(totalAmount, currencySymbol, currency)}
                  </div>
                </Label>
              </div>

              {/* Expense list when "all" is selected */}
              {selection === 'all' && (
                <div className="ml-6 mt-2 space-y-2 max-h-48 overflow-y-auto rounded-lg bg-muted/30 p-3">
                  {nudgeableExpenses.map((expense) => {
                    const display = formatExpenseDisplay(expense)
                    return (
                      <div
                        key={expense.id}
                        className="flex justify-between text-sm py-1.5 border-b border-border last:border-0"
                      >
                        <span className="truncate mr-4">{display.description}</span>
                        <span className="text-muted-foreground shrink-0">{display.amount}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </RadioGroup>
          ) : (
            <div className="text-sm">
              <p className="text-muted-foreground mb-2">
                Send a reminder for this expense:
              </p>
              <div className="rounded-lg bg-muted/30 p-3">
                <div className="font-medium">{formatExpenseDisplay(triggerExpense).description}</div>
                <div className="text-muted-foreground mt-1">
                  {formatExpenseDisplay(triggerExpense).amount} — {formatExpenseDisplay(triggerExpense).date}
                </div>
              </div>
            </div>
          )}

          {/* Approvers who will be emailed */}
          {approversForSelection.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">
                {approversForSelection.length === 1 ? 'Email will be sent to:' : 'Emails will be sent to:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {approversForSelection.map((approver) => (
                  <span
                    key={approver.id}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {approver.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {nudgeCooldownHours > 0 && (
            <p className="text-xs text-muted-foreground mt-4">
              Note: You can send reminders once every {nudgeCooldownHours === 1 ? 'hour' : `${nudgeCooldownHours} hours`}.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleNudge} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Send Reminder
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
