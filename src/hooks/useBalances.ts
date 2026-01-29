'use client'

import { useState, useEffect, useCallback } from 'react'
import { subscribeToDataRefresh } from '@/lib/data-refresh'

export type BalanceFilter = 'owed' | 'approved' | 'pending' | 'active' | 'all'

export interface BalanceUser {
  id: string
  name: string
  email: string
}

export interface Balance {
  user: BalanceUser
  total: number
  pendingTotal: number
  expenseCount: number
  percentage: number
}

interface UseBalancesResult {
  teamTotal: number
  pendingTotal: number
  balances: Balance[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useBalances(filter: BalanceFilter = 'owed'): UseBalancesResult {
  const [teamTotal, setTeamTotal] = useState(0)
  const [pendingTotal, setPendingTotal] = useState(0)
  const [balances, setBalances] = useState<Balance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBalances = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/balances?filter=${filter}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch balances')
      }

      const data = await response.json()
      setTeamTotal(data.teamTotal)
      setPendingTotal(data.pendingTotal)
      setBalances(data.balances)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchBalances()
  }, [fetchBalances])

  // Subscribe to global data refresh events
  useEffect(() => {
    return subscribeToDataRefresh(fetchBalances, ['balances', 'expenses', 'all'])
  }, [fetchBalances])

  return {
    teamTotal,
    pendingTotal,
    balances,
    isLoading,
    error,
    refetch: fetchBalances,
  }
}
