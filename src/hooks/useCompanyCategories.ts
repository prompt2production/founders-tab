'use client'

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'

export interface CompanyCategory {
  id: string
  value: string
  label: string
  icon: string
  isDefault: boolean
  sortOrder: number
}

const fetcher = async (url: string): Promise<CompanyCategory[]> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch categories')
  }
  return response.json()
}

export function useCompanyCategories() {
  const { data, error, isLoading, mutate } = useSWR<CompanyCategory[]>(
    '/api/categories',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  )

  const createCategory = useCallback(
    async (label: string, icon: string = 'Tag'): Promise<CompanyCategory> => {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, icon }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create category')
      }

      const newCategory = await response.json()
      await mutate()
      return newCategory
    },
    [mutate]
  )

  const getCategoryByValue = useCallback(
    (value: string): CompanyCategory | undefined => {
      return data?.find((c: CompanyCategory) => c.value === value)
    },
    [data]
  )

  const getCategoryLabel = useCallback(
    (value: string): string => {
      const category = getCategoryByValue(value)
      return category?.label || value
    },
    [getCategoryByValue]
  )

  const getCategoryIcon = useCallback(
    (value: string): string => {
      const category = getCategoryByValue(value)
      return category?.icon || 'Tag'
    },
    [getCategoryByValue]
  )

  return {
    categories: data || [],
    isLoading,
    error,
    createCategory,
    getCategoryByValue,
    getCategoryLabel,
    getCategoryIcon,
    refetch: mutate,
  }
}
