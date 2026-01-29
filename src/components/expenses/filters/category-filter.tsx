'use client'

import { Tag, Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCompanyCategories } from '@/hooks/useCompanyCategories'
import { CategoryIcon } from '@/components/expenses/category-icon'

interface CategoryFilterProps {
  value?: string
  onChange: (category: string | undefined) => void
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const { categories, isLoading } = useCompanyCategories()

  return (
    <Select
      value={value || 'all'}
      onValueChange={(val) => onChange(val === 'all' ? undefined : val)}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[180px]">
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Tag className="h-4 w-4 mr-2" />
        )}
        <SelectValue placeholder="All Categories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {categories.map((category: { value: string; label: string; icon: string }) => (
          <SelectItem key={category.value} value={category.value}>
            <span className="flex items-center gap-2">
              <CategoryIcon icon={category.icon} size="sm" />
              {category.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
