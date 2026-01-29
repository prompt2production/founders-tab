'use client'

import { useState } from 'react'
import { CategoryIcon } from './category-icon'
import { cn } from '@/lib/utils'
import { useCompanyCategories } from '@/hooks/useCompanyCategories'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

interface CategoryPickerProps {
  value?: string
  onChange: (value: string) => void
  onCustomCategoryName?: (name: string) => void
  customCategoryName?: string
  className?: string
}

export function CategoryPicker({
  value,
  onChange,
  onCustomCategoryName,
  customCategoryName = '',
  className,
}: CategoryPickerProps) {
  const { categories, isLoading } = useCompanyCategories()
  const isOtherSelected = value === 'OTHER'

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
        {categories.map((category: { value: string; label: string; icon: string }) => {
          const isSelected = value === category.value
          return (
            <button
              key={category.value}
              type="button"
              onClick={() => {
                onChange(category.value)
                // Clear custom name when selecting a non-Other category
                if (category.value !== 'OTHER' && onCustomCategoryName) {
                  onCustomCategoryName('')
                }
              }}
              className={cn(
                'flex flex-col items-center gap-1 p-3 rounded-lg border transition-all',
                'hover:bg-secondary/50',
                isSelected
                  ? 'border-primary bg-primary/10 ring-2 ring-primary'
                  : 'border-border bg-card'
              )}
            >
              <CategoryIcon
                icon={category.icon}
                size="md"
                className={cn(isSelected && 'text-primary')}
              />
              <span
                className={cn(
                  'text-xs font-medium truncate w-full text-center',
                  isSelected ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {category.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Custom category name input when "Other" is selected */}
      {isOtherSelected && onCustomCategoryName && (
        <div className="space-y-1">
          <Input
            placeholder="Enter custom category name..."
            value={customCategoryName}
            onChange={(e) => onCustomCategoryName(e.target.value)}
            className="bg-card-elevated border-border h-12"
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            This will create a new category for future use
          </p>
        </div>
      )}
    </div>
  )
}
