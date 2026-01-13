import { Category } from '@/lib/validations/expense'

export interface CategoryInfo {
  value: string
  label: string
  icon: string
}

export const CATEGORIES: CategoryInfo[] = [
  { value: Category.FOOD, label: 'Food & Dining', icon: 'Utensils' },
  { value: Category.TRANSPORT, label: 'Transport', icon: 'Car' },
  { value: Category.SOFTWARE, label: 'Software', icon: 'Monitor' },
  { value: Category.HARDWARE, label: 'Hardware', icon: 'Laptop' },
  { value: Category.OFFICE, label: 'Office', icon: 'Building' },
  { value: Category.TRAVEL, label: 'Travel', icon: 'Plane' },
  { value: Category.MARKETING, label: 'Marketing', icon: 'Megaphone' },
  { value: Category.SERVICES, label: 'Services', icon: 'Briefcase' },
  { value: Category.OTHER, label: 'Other', icon: 'MoreHorizontal' },
]

export function getCategoryIcon(category: string): string {
  const found = CATEGORIES.find((c) => c.value === category)
  return found?.icon || 'MoreHorizontal'
}

export function getCategoryLabel(category: string): string {
  const found = CATEGORIES.find((c) => c.value === category)
  return found?.label || 'Other'
}
