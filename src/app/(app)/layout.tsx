'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AuthProvider } from '@/components/auth/auth-provider'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Home, Users, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/team', icon: Users, label: 'Team' },
  { href: '/profile', icon: User, label: 'Profile' },
]

function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 md:hidden z-50">
      <div className="flex items-center justify-around">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[64px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <div className="min-h-screen bg-background pb-20 md:pb-0">
          {children}
          <BottomNav />
        </div>
      </AuthGuard>
    </AuthProvider>
  )
}
