'use client'

import { cn } from '@/lib/utils'

interface UserAvatarProps {
  name?: string
  initials?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

// Generate a consistent gradient based on the string
function getGradient(str: string): string {
  // Simple hash function to generate a consistent number from string
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  // Design system gradient pairs (warm tones to match the brand)
  const gradients = [
    'from-orange-500 to-red-600', // Primary brand gradient
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-red-500 to-rose-600',
    'from-orange-600 to-amber-500',
    'from-yellow-500 to-orange-500',
  ]

  const index = Math.abs(hash) % gradients.length
  return gradients[index]
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function UserAvatar({
  name,
  initials,
  size = 'md',
  className,
}: UserAvatarProps) {
  const displayInitials = initials || (name ? getInitials(name) : '??')
  const gradientKey = name || initials || 'default'
  const gradient = getGradient(gradientKey)

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white bg-gradient-to-br',
        gradient,
        sizeClasses[size],
        className
      )}
    >
      {displayInitials}
    </div>
  )
}
