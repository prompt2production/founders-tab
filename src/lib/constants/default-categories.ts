export interface DefaultCategory {
  value: string
  label: string
  icon: string
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { value: 'FOOD', label: 'Food & Dining', icon: 'Utensils' },
  { value: 'TRANSPORT', label: 'Transport', icon: 'Car' },
  { value: 'SOFTWARE', label: 'Software', icon: 'Monitor' },
  { value: 'HARDWARE', label: 'Hardware', icon: 'Laptop' },
  { value: 'OFFICE', label: 'Office', icon: 'Building' },
  { value: 'TRAVEL', label: 'Travel', icon: 'Plane' },
  { value: 'MARKETING', label: 'Marketing', icon: 'Megaphone' },
  { value: 'SERVICES', label: 'Services', icon: 'Briefcase' },
  { value: 'OTHER', label: 'Other', icon: 'MoreHorizontal' },
]

/**
 * Convert a display label to an uppercase value
 * e.g., "Legal Fees" -> "LEGAL_FEES"
 */
export function labelToValue(label: string): string {
  return label
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}
