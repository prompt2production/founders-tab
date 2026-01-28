'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  updateCompanySettingsSchema,
  UpdateCompanySettingsInput,
  CURRENCY_OPTIONS,
  SupportedCurrency,
} from '@/lib/validations/company-settings'

interface CompanySettingsFormProps {
  onSubmit: (data: UpdateCompanySettingsInput) => Promise<void>
  defaultValues?: { name?: string; currency?: string }
  isReadOnly?: boolean
}

export function CompanySettingsForm({
  onSubmit,
  defaultValues,
  isReadOnly = false,
}: CompanySettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<UpdateCompanySettingsInput>({
    resolver: zodResolver(updateCompanySettingsSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      currency: (defaultValues?.currency as SupportedCurrency) ?? 'USD',
    },
  })

  async function handleSubmit(data: UpdateCompanySettingsInput) {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {isReadOnly && (
          <div className="flex items-start gap-2 rounded-lg bg-card-elevated border border-border p-3">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Only founders can edit company settings.
            </p>
          </div>
        )}

        {/* Company Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground">Company Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter company name"
                  className="bg-card-elevated border-border h-12"
                  disabled={isReadOnly}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Currency */}
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground">Currency</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isReadOnly}
              >
                <FormControl>
                  <SelectTrigger className="w-full bg-card-elevated border-border h-12">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.value} — {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        {!isReadOnly && (
          <Button
            type="submit"
            className="w-full lg:w-auto h-12"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        )}
      </form>
    </Form>
  )
}
