'use client'

import {
  Utensils,
  Car,
  Monitor,
  Laptop,
  Building,
  Plane,
  Megaphone,
  Briefcase,
  MoreHorizontal,
  Tag,
  ShoppingCart,
  CreditCard,
  FileText,
  Wrench,
  Users,
  Package,
  Globe,
  Phone,
  Zap,
  Heart,
  Star,
  LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CATEGORY_ICONS } from '@/lib/constants/category-icons'
import { useState } from 'react'

const iconMap: Record<string, LucideIcon> = {
  Utensils,
  Car,
  Monitor,
  Laptop,
  Building,
  Plane,
  Megaphone,
  Briefcase,
  MoreHorizontal,
  Tag,
  ShoppingCart,
  CreditCard,
  FileText,
  Wrench,
  Users,
  Package,
  Globe,
  Phone,
  Zap,
  Heart,
  Star,
}

interface IconPickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const SelectedIcon = iconMap[value] || Tag

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full h-12 justify-start gap-2 bg-card-elevated border-border',
            className
          )}
        >
          <SelectedIcon className="h-5 w-5" />
          <span className="text-muted-foreground">
            {CATEGORY_ICONS.find((i) => i.value === value)?.label || 'Select icon'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="grid grid-cols-5 gap-1">
          {CATEGORY_ICONS.map((icon) => {
            const Icon = iconMap[icon.value] || Tag
            const isSelected = value === icon.value
            return (
              <button
                key={icon.value}
                type="button"
                onClick={() => {
                  onChange(icon.value)
                  setOpen(false)
                }}
                className={cn(
                  'flex items-center justify-center p-2 rounded-md transition-colors',
                  'hover:bg-secondary',
                  isSelected && 'bg-primary/10 ring-2 ring-primary'
                )}
                title={icon.label}
              >
                <Icon className={cn('h-5 w-5', isSelected && 'text-primary')} />
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
