import { DEFAULT_CATEGORIES } from './default-categories'

export interface CategoryInfo {
  value: string
  label: string
  icon: string
}

// Legacy static categories for backwards compatibility
// Note: Categories are now dynamic per company, use useCompanyCategories hook instead
export const CATEGORIES: CategoryInfo[] = DEFAULT_CATEGORIES.map((c) => ({
  value: c.value,
  label: c.label,
  icon: c.icon,
}))

// Legacy helper - uses static categories only
// For dynamic categories, use useCompanyCategories hook
export function getCategoryIcon(category: string): string {
  const found = CATEGORIES.find((c) => c.value === category)
  return found?.icon || 'Tag'
}

// Legacy helper - uses static categories only
// For dynamic categories, use useCompanyCategories hook
export function getCategoryLabel(category: string): string {
  const found = CATEGORIES.find((c) => c.value === category)
  // For custom categories, convert value to readable label
  if (!found) {
    return category
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }
  return found.label
}
