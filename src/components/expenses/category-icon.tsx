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

// Legacy mapping for backwards compatibility
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
  category?: string
  icon?: string // Direct icon name (takes precedence over category)
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export function CategoryIcon({ category, icon, size = 'md', className }: CategoryIconProps) {
  // Use direct icon prop if provided, otherwise fall back to category mapping
  const iconName = icon || (category ? categoryToIcon[category] : undefined) || 'Tag'
  const Icon = iconMap[iconName] || Tag

  return <Icon className={cn(sizeClasses[size], 'text-muted-foreground', className)} />
}

// Export icon map for use in other components
export { iconMap }
