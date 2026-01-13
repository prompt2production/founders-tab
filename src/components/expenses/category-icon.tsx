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
  LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
}

const categoryToIcon: Record<string, string> = {
  FOOD: 'Utensils',
  TRANSPORT: 'Car',
  SOFTWARE: 'Monitor',
  HARDWARE: 'Laptop',
  OFFICE: 'Building',
  TRAVEL: 'Plane',
  MARKETING: 'Megaphone',
  SERVICES: 'Briefcase',
  OTHER: 'MoreHorizontal',
}

interface CategoryIconProps {
  category: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export function CategoryIcon({ category, size = 'md', className }: CategoryIconProps) {
  const iconName = categoryToIcon[category] || 'MoreHorizontal'
  const Icon = iconMap[iconName] || MoreHorizontal

  return <Icon className={cn(sizeClasses[size], 'text-muted-foreground', className)} />
}
