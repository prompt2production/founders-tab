'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { signupSchema, SignupInput } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Loader2, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface SignupFormProps {
  onSuccess?: () => void
}

interface PasswordStrength {
  hasMinLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
}

function getPasswordStrength(password: string): PasswordStrength {
  return {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  }
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = getPasswordStrength(password)
  const checks = [
    { key: 'hasMinLength', label: 'At least 8 characters' },
    { key: 'hasUppercase', label: 'One uppercase letter' },
    { key: 'hasLowercase', label: 'One lowercase letter' },
    { key: 'hasNumber', label: 'One number' },
  ] as const

  if (!password) return null

  return (
    <div className="mt-2 space-y-1">
      {checks.map(({ key, label }) => {
        const passed = strength[key]
        return (
          <div
            key={key}
            className={cn(
              'flex items-center gap-2 text-xs',
              passed ? 'text-green-500' : 'text-muted-foreground'
            )}
          >
            {passed ? (
              <Check className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
            <span>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const watchPassword = form.watch('password')

  async function onSubmit(data: SignupInput) {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Signup failed')
      }

      toast.success('Account created!', {
        description: 'Welcome to Founders Tab',
      })

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/')
      }
    } catch (error) {
      toast.error('Signup failed', {
        description:
          error instanceof Error ? error.message : 'Please try again',
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground">Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Your full name"
                  autoComplete="name"
                  className="bg-card-elevated border-border focus:border-primary focus:ring-primary h-12"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground">Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="bg-card-elevated border-border focus:border-primary focus:ring-primary h-12"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground">Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="Create a password"
                  autoComplete="new-password"
                  className="bg-card-elevated border-border focus:border-primary focus:ring-primary h-12"
                />
              </FormControl>
              <PasswordStrengthIndicator password={watchPassword} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground">
                Confirm Password
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  className="bg-card-elevated border-border focus:border-primary focus:ring-primary h-12"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>
    </Form>
  )
}
