'use client'

import { CATEGORIES } from '@/lib/constants/categories'
import { CategoryIcon } from './category-icon'
import { cn } from '@/lib/utils'

interface CategoryPickerProps {
  value?: string
  onChange: (value: string) => void
  className?: string
}

export function CategoryPicker({ value, onChange, className }: CategoryPickerProps) {
  return (
    <div className={cn('grid grid-cols-3 lg:grid-cols-5 gap-2', className)}>
      {CATEGORIES.map((category) => {
        const isSelected = value === category.value
        return (
          <button
            key={category.value}
            type="button"
            onClick={() => onChange(category.value)}
            className={cn(
              'flex flex-col items-center gap-1 p-3 rounded-lg border transition-all',
              'hover:bg-secondary/50',
              isSelected
                ? 'border-primary bg-primary/10 ring-2 ring-primary'
                : 'border-border bg-card'
            )}
          >
            <CategoryIcon
              category={category.value}
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
  )
}
