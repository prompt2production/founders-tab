'use client'

import { Tag } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CATEGORIES } from '@/lib/constants/categories'
import { CategoryIcon } from '@/components/expenses/category-icon'

interface CategoryFilterProps {
  value?: string
  onChange: (category: string | undefined) => void
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <Select
      value={value || 'all'}
      onValueChange={(val) => onChange(val === 'all' ? undefined : val)}
    >
      <SelectTrigger className="w-[180px]">
        <Tag className="h-4 w-4 mr-2" />
        <SelectValue placeholder="All Categories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {CATEGORIES.map((category) => (
          <SelectItem key={category.value} value={category.value}>
            <span className="flex items-center gap-2">
              <CategoryIcon category={category.value} size="sm" />
              {category.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
