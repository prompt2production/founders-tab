'use client'

import { useState, useEffect, useCallback } from 'react'

export interface BalanceUser {
  id: string
  name: string
  email: string
}

export interface Balance {
  user: BalanceUser
  total: number
  expenseCount: number
  percentage: number
}

interface UseBalancesResult {
  teamTotal: number
  balances: Balance[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useBalances(): UseBalancesResult {
  const [teamTotal, setTeamTotal] = useState(0)
  const [balances, setBalances] = useState<Balance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBalances = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/balances')

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch balances')
      }

      const data = await response.json()
      setTeamTotal(data.teamTotal)
      setBalances(data.balances)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBalances()
  }, [fetchBalances])

  return {
    teamTotal,
    balances,
    isLoading,
    error,
    refetch: fetchBalances,
  }
}
