'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { SignupForm } from '@/components/auth/signup-form'
import { Loader2 } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 py-12">
      <div className="w-full max-w-sm mx-auto space-y-8">
        {/* Logo/App Name */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-red-600 bg-clip-text text-transparent">
            Founders Tab
          </h1>
          <p className="mt-2 text-muted-foreground">
            Start tracking expenses with your co-founders
          </p>
        </div>

        {/* Signup Form */}
        <div className="space-y-6">
          <SignupForm onSuccess={() => router.push('/')} />

          {/* Links */}
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
