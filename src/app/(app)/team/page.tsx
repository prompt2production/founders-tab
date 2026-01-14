'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/useAuth'
import { UserAvatar } from '@/components/auth/user-avatar'
import { RoleBadge } from '@/components/team/role-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { createInvitationSchema, CreateInvitationInput } from '@/lib/validations/invitation'
import { Loader2, UserPlus, X, Mail, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface TeamMember {
  id: string
  name: string
  email: string
  avatarInitials: string | null
  role: 'FOUNDER' | 'MEMBER'
  createdAt: string
}

interface Invitation {
  id: string
  email: string
  message: string | null
  status: string
  expiresAt: string
  createdAt: string
}

function InviteMemberForm({ onSuccess }: { onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateInvitationInput>({
    resolver: zodResolver(createInvitationSchema),
    defaultValues: {
      email: '',
      message: '',
    },
  })

  async function onSubmit(data: CreateInvitationInput) {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send invitation')
      }

      toast.success('Invitation sent!', {
        description: `Invitation sent to ${data.email}`,
      })
      form.reset()
      onSuccess()
    } catch (error) {
      toast.error('Failed to send invitation', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground">Email Address</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="colleague@example.com"
                  className="bg-card-elevated border-border h-12"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground">
                Message (optional)
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Join us on Founders Tab!"
                  className="bg-card-elevated border-border h-12"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full lg:w-auto h-12" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Send Invitation
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}

export default function TeamPage() {
  const { user, refreshUser } = useAuth()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false)
  const [founderCount, setFounderCount] = useState(0)

  const isFounder = user?.role === 'FOUNDER'

  async function fetchData() {
    try {
      const [membersRes, invitationsRes] = await Promise.all([
        fetch('/api/team'),
        isFounder ? fetch('/api/invitations') : Promise.resolve(null),
      ])

      if (membersRes.ok) {
        const membersData = await membersRes.json()
        setMembers(membersData)
        // Count founders for isLastFounder check
        const founders = membersData.filter((m: TeamMember) => m.role === 'FOUNDER')
        setFounderCount(founders.length)
      }

      if (invitationsRes && invitationsRes.ok) {
        const invitationsData = await invitationsRes.json()
        setInvitations(invitationsData.filter((i: Invitation) => i.status === 'PENDING'))
      }
    } catch (error) {
      console.error('Failed to fetch team data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [isFounder])

  async function cancelInvitation(id: string) {
    try {
      const response = await fetch(`/api/invitations/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to cancel invitation')
      }

      setInvitations((prev) => prev.filter((i) => i.id !== id))
      toast.success('Invitation cancelled')
    } catch {
      toast.error('Failed to cancel invitation')
    }
  }

  async function handleRoleChange(userId: string, newRole: 'FOUNDER' | 'MEMBER') {
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update role')
      }

      const updatedUser = await response.json()

      toast.success('Role updated', {
        description: `${updatedUser.name} is now a ${newRole.toLowerCase()}`,
      })

      // Refresh the team list
      await fetchData()

      // If the current user changed their own role, refresh user context
      if (userId === user?.id) {
        refreshUser()
      }
    } catch (error) {
      toast.error('Failed to update role', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      {/* Page Header with Invite Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Team</h1>
        {isFounder && (
          <Sheet open={inviteSheetOpen} onOpenChange={setInviteSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader>
                <SheetTitle>Invite Team Member</SheetTitle>
                <SheetDescription>
                  Send an invitation to join your team on Founders Tab.
                </SheetDescription>
              </SheetHeader>
              <div className="px-4 py-4">
                <InviteMemberForm
                  onSuccess={() => {
                    setInviteSheetOpen(false)
                    fetchData()
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Team Members */}
      <Card className="bg-card border-border rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 py-2">
              <UserAvatar
                name={member.name}
                initials={member.avatarInitials || undefined}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {member.email}
                </p>
              </div>
              <RoleBadge
                role={member.role}
                userName={member.name}
                userId={member.id}
                currentUserId={user?.id || ''}
                isCurrentUserFounder={isFounder}
                isLastFounder={founderCount <= 1}
                onRoleChange={handleRoleChange}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pending Invitations (Founders only) */}
      {isFounder && invitations.length > 0 && (
        <Card className="bg-card border-border rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Pending Invitations ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center gap-3 py-2"
              >
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{invitation.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Expires{' '}
                    {new Date(invitation.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => cancelInvitation(invitation.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
