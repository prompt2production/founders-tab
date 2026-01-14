'use client'

import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Check } from 'lucide-react'

interface RoleBadgeProps {
  role: 'FOUNDER' | 'MEMBER'
  userName: string
  userId: string
  isCurrentUserFounder: boolean
  isLastFounder: boolean
  onRoleChange: (userId: string, newRole: 'FOUNDER' | 'MEMBER') => void
}

export function RoleBadge({
  role,
  userName,
  userId,
  isCurrentUserFounder,
  isLastFounder,
  onRoleChange,
}: RoleBadgeProps) {
  // Non-founders see static badge
  if (!isCurrentUserFounder) {
    return (
      <Badge variant={role === 'FOUNDER' ? 'default' : 'secondary'}>
        {role}
      </Badge>
    )
  }

  // Founders see dropdown
  const canDemote = !(role === 'FOUNDER' && isLastFounder)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-full"
          aria-label={`Change role for ${userName}`}
        >
          <Badge
            variant={role === 'FOUNDER' ? 'default' : 'secondary'}
            className="cursor-pointer pr-1"
          >
            {role}
            <ChevronDown className="h-3 w-3 ml-0.5" />
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onRoleChange(userId, 'FOUNDER')}
          disabled={role === 'FOUNDER'}
          className="flex items-center justify-between gap-2"
        >
          <span>Founder</span>
          {role === 'FOUNDER' && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onRoleChange(userId, 'MEMBER')}
          disabled={role === 'MEMBER' || !canDemote}
          className="flex items-center justify-between gap-2"
          title={!canDemote ? 'Cannot demote the last founder' : undefined}
        >
          <span>Member</span>
          {role === 'MEMBER' && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
