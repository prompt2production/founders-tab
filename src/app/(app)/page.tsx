'use client'

import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserAvatar } from '@/components/auth/user-avatar'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, Users } from 'lucide-react'

export default function HomePage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Home</h1>
          <UserAvatar
            name={user.name}
            initials={user.avatarInitials || undefined}
            size="sm"
          />
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Welcome Card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-red-600 p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-white/80">Welcome back,</p>
              <p className="text-2xl font-bold text-white mt-1">{user.name}</p>
              <Badge className="bg-white/20 text-white border-0 mt-2">
                {user.role}
              </Badge>
            </div>
            <UserAvatar
              name={user.name}
              initials={user.avatarInitials || undefined}
              size="lg"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card border-border rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Your Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tabular-nums">$0.00</p>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Team Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tabular-nums">$0.00</p>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Ready for Expenses Feature */}
        <Card className="bg-card border-border rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Welcome to Founders Tab! This is your dashboard for tracking
              expenses with your co-founders. The expenses feature will be
              available soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
