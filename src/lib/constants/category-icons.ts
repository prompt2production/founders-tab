/**
 * Available icons for category selection
 * These are Lucide icon names that can be used for custom categories
 */
export const CATEGORY_ICONS = [
  { value: 'Tag', label: 'Tag' },
  { value: 'Utensils', label: 'Food' },
  { value: 'Car', label: 'Car' },
  { value: 'Monitor', label: 'Monitor' },
  { value: 'Laptop', label: 'Laptop' },
  { value: 'Building', label: 'Building' },
  { value: 'Plane', label: 'Plane' },
  { value: 'Megaphone', label: 'Megaphone' },
  { value: 'Briefcase', label: 'Briefcase' },
  { value: 'ShoppingCart', label: 'Shopping' },
  { value: 'CreditCard', label: 'Card' },
  { value: 'FileText', label: 'Document' },
  { value: 'Wrench', label: 'Tools' },
  { value: 'Users', label: 'People' },
  { value: 'Package', label: 'Package' },
  { value: 'Globe', label: 'Globe' },
  { value: 'Phone', label: 'Phone' },
  { value: 'Zap', label: 'Energy' },
  { value: 'Heart', label: 'Health' },
  { value: 'Star', label: 'Star' },
  { value: 'MoreHorizontal', label: 'Other' },
] as const

export type CategoryIconValue = (typeof CATEGORY_ICONS)[number]['value']
