'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ChevronDown, Check } from 'lucide-react'

interface RoleBadgeProps {
  role: 'FOUNDER' | 'MEMBER'
  userName: string
  userId: string
  currentUserId: string
  isCurrentUserFounder: boolean
  isLastFounder: boolean
  onRoleChange: (userId: string, newRole: 'FOUNDER' | 'MEMBER') => void
}

export function RoleBadge({
  role,
  userName,
  userId,
  currentUserId,
  isCurrentUserFounder,
  isLastFounder,
  onRoleChange,
}: RoleBadgeProps) {
  const [pendingRole, setPendingRole] = useState<'FOUNDER' | 'MEMBER' | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

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
  const isSelf = userId === currentUserId

  const handleRoleSelect = (newRole: 'FOUNDER' | 'MEMBER') => {
    if (newRole === role) return
    setPendingRole(newRole)
    setDialogOpen(true)
  }

  const handleConfirm = () => {
    if (pendingRole) {
      onRoleChange(userId, pendingRole)
    }
    setDialogOpen(false)
    setPendingRole(null)
  }

  const handleCancel = () => {
    setDialogOpen(false)
    setPendingRole(null)
  }

  const getDialogContent = () => {
    if (!pendingRole) return { title: '', description: '' }

    if (pendingRole === 'FOUNDER') {
      return {
        title: `Promote ${userName} to Founder?`,
        description: `${userName} will be able to approve expenses and manage team invitations.`,
      }
    }

    if (isSelf) {
      return {
        title: 'Change your role to Member?',
        description: 'You will no longer be able to approve expenses or manage invitations.',
      }
    }

    return {
      title: `Change ${userName}'s role to Member?`,
      description: `${userName} will no longer be able to approve expenses or manage invitations.`,
    }
  }

  const { title, description } = getDialogContent()

  return (
    <>
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
            onClick={() => handleRoleSelect('FOUNDER')}
            disabled={role === 'FOUNDER'}
            className="flex items-center justify-between gap-2"
          >
            <span>Founder</span>
            {role === 'FOUNDER' && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleRoleSelect('MEMBER')}
            disabled={role === 'MEMBER' || !canDemote}
            className="flex items-center justify-between gap-2"
            title={!canDemote ? 'Cannot demote the last founder' : undefined}
          >
            <span>Member</span>
            {role === 'MEMBER' && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
