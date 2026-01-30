'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { NudgeConfirmationDialog } from './nudge-confirmation-dialog'
import { useCompanySettings } from '@/hooks/useCompanySettings'
import { Bell, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

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

interface NudgeButtonProps {
  expenseId: string
  expense: {
    id: string
    description: string
    amount: string
    date: string
    category: string
    status?: string
    lastNudgeAt?: string | null
    pendingApprovers?: PendingApprover[]
  }
  isCreator: boolean
  status?: string
  lastNudgeAt?: string | null
  pendingApproversCount: number
  pendingApprovers?: PendingApprover[]
  className?: string
  onSuccess?: () => void
}

interface DashboardExpense {
  id: string
  date: string
  amount: string
  description: string
  category: string
  status: string
  lastNudgeAt: string | null
  pendingApprovers: PendingApprover[]
}

function formatTimeRemaining(nextNudgeAt: Date): string {
  const now = new Date()
  const diffMs = nextNudgeAt.getTime() - now.getTime()

  if (diffMs <= 0) return ''

  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export function NudgeButton({
  expenseId,
  expense,
  isCreator,
  status,
  lastNudgeAt,
  pendingApproversCount,
  pendingApprovers,
  className,
  onSuccess,
}: NudgeButtonProps) {
  const { nudgeCooldownHours } = useCompanySettings()
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [allNudgeableExpenses, setAllNudgeableExpenses] = useState<NudgeableExpense[]>([])
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false)

  // Fetch all user's pending expenses when dialog opens
  const fetchAllPendingExpenses = useCallback(async () => {
    setIsLoadingExpenses(true)
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const data = await response.json()
        const pendingExpenses: NudgeableExpense[] = (data.userPendingExpenses || [])
          .filter((e: DashboardExpense) =>
            e.status === 'PENDING_APPROVAL' || e.status === 'WITHDRAWAL_REQUESTED'
          )
          .map((e: DashboardExpense) => ({
            id: e.id,
            description: e.description,
            amount: e.amount,
            date: e.date,
            category: e.category,
            status: e.status as 'PENDING_APPROVAL' | 'WITHDRAWAL_REQUESTED',
            lastNudgeAt: e.lastNudgeAt,
            pendingApprovers: e.pendingApprovers,
          }))
        setAllNudgeableExpenses(pendingExpenses)
      }
    } catch (error) {
      console.error('Failed to fetch pending expenses:', error)
      // Fall back to just the current expense
      setAllNudgeableExpenses([])
    } finally {
      setIsLoadingExpenses(false)
    }
  }, [])

  // Calculate if rate limited based on company settings
  const cooldownMs = nudgeCooldownHours * 60 * 60 * 1000
  const nextNudgeAt = lastNudgeAt && nudgeCooldownHours > 0
    ? new Date(new Date(lastNudgeAt).getTime() + cooldownMs)
    : null
  const isRateLimited = nextNudgeAt && nextNudgeAt.getTime() > Date.now()

  // Update countdown timer
  useEffect(() => {
    if (!isRateLimited || !nextNudgeAt) {
      setTimeRemaining('')
      return
    }

    const updateTimer = () => {
      const remaining = formatTimeRemaining(nextNudgeAt)
      setTimeRemaining(remaining)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [isRateLimited, nextNudgeAt])

  // Don't show if not creator
  if (!isCreator) return null

  // Don't show if wrong status
  if (status !== 'PENDING_APPROVAL' && status !== 'WITHDRAWAL_REQUESTED') return null

  // Don't show if no pending approvers
  if (pendingApproversCount <= 0) return null

  async function handleClick() {
    // Fetch all pending expenses before opening dialog
    await fetchAllPendingExpenses()
    setDialogOpen(true)
  }

  function handleSuccess() {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)
    onSuccess?.()
  }

  // Create nudgeable expense for dialog (current expense)
  const currentNudgeableExpense: NudgeableExpense = {
    id: expense.id,
    description: expense.description,
    amount: expense.amount,
    date: expense.date,
    category: expense.category,
    status: status as 'PENDING_APPROVAL' | 'WITHDRAWAL_REQUESTED',
    lastNudgeAt: expense.lastNudgeAt,
    pendingApprovers: pendingApprovers,
  }

  // Use fetched expenses if available, otherwise fall back to just current expense
  // Make sure current expense is included in the list
  const expensesForDialog = allNudgeableExpenses.length > 0
    ? allNudgeableExpenses.some(e => e.id === expense.id)
      ? allNudgeableExpenses
      : [currentNudgeableExpense, ...allNudgeableExpenses]
    : [currentNudgeableExpense]

  if (showSuccess) {
    return (
      <Button
        variant="outline"
        className={cn('w-full', className)}
        disabled
      >
        <Check className="h-4 w-4 mr-2" />
        Reminder sent!
      </Button>
    )
  }

  if (isRateLimited && timeRemaining) {
    return (
      <Button
        variant="outline"
        className={cn('w-full', className)}
        disabled
      >
        <Bell className="h-4 w-4 mr-2" />
        Next reminder in {timeRemaining}
      </Button>
    )
  }

  return (
    <>
      <div className="space-y-2">
        <Button
          variant="outline"
          className={cn('w-full', className)}
          onClick={handleClick}
          disabled={isLoadingExpenses}
        >
          {isLoadingExpenses ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Bell className="h-4 w-4 mr-2" />
          )}
          Send Reminder
        </Button>

        {/* Show pending approvers */}
        {pendingApprovers && pendingApprovers.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center">
            <span className="text-xs text-muted-foreground">Will notify:</span>
            {pendingApprovers.map((approver) => (
              <span
                key={approver.id}
                className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
              >
                {approver.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <NudgeConfirmationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        triggerExpense={currentNudgeableExpense}
        allNudgeableExpenses={expensesForDialog}
        onSuccess={handleSuccess}
      />
    </>
  )
}
