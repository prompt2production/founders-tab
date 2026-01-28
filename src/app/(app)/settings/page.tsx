'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { CompanySettingsForm } from '@/components/settings/company-settings-form'
import { Card, CardContent } from '@/components/ui/card'
import { UpdateCompanySettingsInput } from '@/lib/validations/company-settings'
import { toast } from 'sonner'

interface CompanySettings {
  id: string
  name: string
  currency: string
  createdAt: string
  updatedAt: string
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<CompanySettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/company-settings')
        if (!response.ok) throw new Error('Failed to fetch settings')
        const data = await response.json()
        setSettings(data)
      } catch {
        toast.error('Failed to load company settings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  async function handleSubmit(data: UpdateCompanySettingsInput) {
    try {
      const response = await fetch('/api/company-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update settings')
      }

      const updated = await response.json()
      setSettings(updated)
      toast.success('Company settings updated')
    } catch (error) {
      toast.error('Failed to update settings', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
      throw error
    }
  }

  const isReadOnly = user?.role !== 'FOUNDER'

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Company Settings</h1>

      <Card className="bg-card border-border rounded-xl">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-secondary rounded animate-pulse" />
                <div className="h-12 w-full bg-secondary rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-20 bg-secondary rounded animate-pulse" />
                <div className="h-12 w-full bg-secondary rounded animate-pulse" />
              </div>
              <div className="h-12 w-full lg:w-32 bg-secondary rounded animate-pulse" />
            </div>
          ) : settings ? (
            <CompanySettingsForm
              onSubmit={handleSubmit}
              defaultValues={{
                name: settings.name,
                currency: settings.currency,
              }}
              isReadOnly={isReadOnly}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
