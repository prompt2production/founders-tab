'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AuthProvider } from '@/components/auth/auth-provider'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

function HomePageContent() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/expenses')
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If authenticated, show nothing while redirecting
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Show marketing content for unauthenticated users
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 lg:px-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Brand Name with Gradient */}
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-red-600 bg-clip-text text-transparent">
          Founders Tab
        </h1>

        {/* Tagline */}
        <p className="text-lg text-muted-foreground">
          Track expenses before incorporation
        </p>

        {/* Value Proposition */}
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

        {/* CTA Buttons */}
        <div className="flex flex-col lg:flex-row gap-3 pt-4">
          <Button asChild className="w-full lg:w-auto lg:flex-1">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" className="w-full lg:w-auto lg:flex-1">
            <Link href="/login">Log In</Link>
          </Button>
        </div>

        {/* Supporting Text */}
        <p className="text-xs text-muted-foreground pt-4">
          Built for small founding teams who aren&apos;t incorporated yet
        </p>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <AuthProvider>
      <HomePageContent />
    </AuthProvider>
  )
}
