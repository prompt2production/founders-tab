'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AuthProvider } from '@/components/auth/auth-provider'
import { CompanySettingsProvider } from '@/components/company/company-settings-provider'
import { useAuth } from '@/hooks/useAuth'
import { UserAvatar } from '@/components/auth/user-avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { AddExpenseSheet } from '@/components/expenses/add-expense-sheet'
import { usePendingApprovalCount } from '@/hooks/usePendingApprovalCount'
import { Home, Receipt, Users, User, LogOut, Settings, Wallet, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Dashboard from './(app)/page'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/expenses', icon: Receipt, label: 'Expenses' },
  { href: '/balance', icon: Wallet, label: 'Balances' },
  { href: '/team', icon: Users, label: 'Team' },
  { href: '/settings', icon: Settings, label: 'Settings' },
  { href: '/profile', icon: User, label: 'Profile' },
]

function AppHeader({ onAddExpense }: { onAddExpense: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { count: pendingCount } = usePendingApprovalCount()

  async function handleLogout() {
    try {
      await logout()
      router.push('/login')
    } catch {
      toast.error('Failed to sign out')
    }
  }

  if (!user) return null

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-red-600 bg-clip-text text-transparent">
              Founders Tab
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(({ href, label }) => {
              const isActive = pathname === href
              const showBadge = href === '/expenses' && pendingCount > 0
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors relative',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  {label}
                  {showBadge && (
                    <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs">
                      {pendingCount}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              onClick={onAddExpense}
              size="sm"
              className="hidden lg:flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <UserAvatar
                    name={user.name}
                    initials={user.avatarInitials || undefined}
                    size="sm"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}

function BottomNav({ onAddExpense }: { onAddExpense: () => void }) {
  const pathname = usePathname()
  const { count: pendingCount } = usePendingApprovalCount()

  return (
    <>
      <Button
        onClick={onAddExpense}
        size="icon"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg lg:hidden z-50"
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Add Expense</span>
      </Button>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 lg:hidden z-50">
        <div className="flex items-center justify-around">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href
            const showBadge = href === '/expenses' && pendingCount > 0
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[64px] relative',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {showBadge && (
                    <Badge className="absolute -top-2 -right-3 h-4 min-w-4 flex items-center justify-center p-0 text-[10px]">
                      {pendingCount}
                    </Badge>
                  )}
                </div>
                <span className="text-xs">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

function AuthenticatedApp() {
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)

  return (
    <CompanySettingsProvider>
      <div className="min-h-screen bg-background pb-20 lg:pb-0">
        <AppHeader onAddExpense={() => setAddExpenseOpen(true)} />
        <div className="max-w-6xl mx-auto">
          <Dashboard />
        </div>
        <BottomNav onAddExpense={() => setAddExpenseOpen(true)} />
        <AddExpenseSheet
          open={addExpenseOpen}
          onOpenChange={setAddExpenseOpen}
        />
      </div>
    </CompanySettingsProvider>
  )
}

function MarketingPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 lg:px-6">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-red-600 bg-clip-text text-transparent">
          Founders Tab
        </h1>

        <p className="text-lg text-muted-foreground">
          Keep tabs on shared business spending
        </p>

        <ul className="space-y-3 text-sm text-muted-foreground text-left mx-auto max-w-xs">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Track who spent what for the business</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Maintain clear records for future reimbursement</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Transparency across all co-founders</span>
          </li>
        </ul>

        <div className="flex flex-col lg:flex-row gap-3 pt-4">
          <Button asChild className="w-full lg:w-auto lg:flex-1">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" className="w-full lg:w-auto lg:flex-1">
            <Link href="/login">Log In</Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground pt-4">
          Simple tracking until proper accounting takes over
        </p>
      </div>
    </div>
  )
}

function HomePageContent() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <AuthenticatedApp />
  }

  return <MarketingPage />
}

export default function HomePage() {
  return (
    <AuthProvider>
      <HomePageContent />
    </AuthProvider>
  )
}
