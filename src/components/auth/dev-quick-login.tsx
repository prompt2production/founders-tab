'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Code2 } from 'lucide-react'
import { toast } from 'sonner'

interface DevQuickLoginProps {
  onSuccess?: () => void
}

interface DevUser {
  name: string
  email: string
  password: string
}

const DEV_USERS: DevUser[] = [
  { name: 'Chris', email: 'chris@founderstab.com', password: 'Password123!' },
  { name: 'Candice', email: 'candice@founderstab.com', password: 'Password123!' },
  { name: 'Adrian', email: 'adrian@founderstab.com', password: 'Password123!' },
]

export function DevQuickLogin({ onSuccess }: DevQuickLoginProps) {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string>('')

  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  async function handleQuickLogin(email: string) {
    const user = DEV_USERS.find((u) => u.email === email)
    if (!user) return

    setIsLoading(true)
    try {
      await login(user.email, user.password)
      onSuccess?.()
    } catch (error) {
      toast.error('Quick login failed', {
        description:
          error instanceof Error ? error.message : 'Could not log in as this user',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-8 pt-6 border-t border-dashed border-muted-foreground/30">
      <div className="flex items-center gap-2 mb-3">
        <Code2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">Dev Quick Login</span>
      </div>
      <div className="flex gap-2">
        <Select
          value={selectedUser}
          onValueChange={setSelectedUser}
          disabled={isLoading}
        >
          <SelectTrigger className="flex-1 bg-card-elevated border-border h-10">
            <SelectValue placeholder="Select a user..." />
          </SelectTrigger>
          <SelectContent>
            {DEV_USERS.map((user) => (
              <SelectItem key={user.email} value={user.email}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="secondary"
          size="default"
          disabled={!selectedUser || isLoading}
          onClick={() => handleQuickLogin(selectedUser)}
          className="h-10"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Login'
          )}
        </Button>
      </div>
    </div>
  )
}
