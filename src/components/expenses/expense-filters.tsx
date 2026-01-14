'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PersonFilter } from './filters/person-filter'
import { DateRangeFilter } from './filters/date-range-filter'
import { CategoryFilter } from './filters/category-filter'

export interface ExpenseFiltersState {
  userId?: string
  category?: string
  startDate?: Date
  endDate?: Date
}

interface ExpenseFiltersProps {
  filters: ExpenseFiltersState
  onFiltersChange: (filters: ExpenseFiltersState) => void
}

export function ExpenseFilters({ filters, onFiltersChange }: ExpenseFiltersProps) {
  const activeFilterCount = [
    filters.userId,
    filters.category,
    filters.startDate || filters.endDate,
  ].filter(Boolean).length

  const handleClearAll = () => {
    onFiltersChange({
      userId: undefined,
      category: undefined,
      startDate: undefined,
      endDate: undefined,
    })
  }

  return (
    <div className="space-y-3">
      {/* Filter controls - horizontal on desktop, stacked on mobile */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        <PersonFilter
          value={filters.userId}
          onChange={(userId) => onFiltersChange({ ...filters, userId })}
        />

        <DateRangeFilter
          value={{ startDate: filters.startDate, endDate: filters.endDate }}
          onChange={(range) =>
            onFiltersChange({
              ...filters,
              startDate: range.startDate,
              endDate: range.endDate,
            })
          }
        />

        <CategoryFilter
          value={filters.category}
          onChange={(category) => onFiltersChange({ ...filters, category })}
        />

        {/* Clear All and Active Filter Count */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
