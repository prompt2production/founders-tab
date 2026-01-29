'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { AmountInput } from './amount-input'
import { CategoryPicker } from './category-picker'
import { ReceiptUpload } from './receipt-upload'
import { createExpenseSchema, CreateExpenseInput } from '@/lib/validations/expense'
import { useCompanyCategories } from '@/hooks/useCompanyCategories'
import { cn } from '@/lib/utils'

interface ExpenseFormProps {
  onSubmit: (data: CreateExpenseInput) => Promise<void>
  defaultValues?: Partial<CreateExpenseInput>
  submitLabel?: string
}

export function ExpenseForm({ onSubmit, defaultValues, submitLabel = 'Add Expense' }: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showNotes, setShowNotes] = useState(!!defaultValues?.notes)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [customCategoryName, setCustomCategoryName] = useState('')
  const { createCategory } = useCompanyCategories()

  const form = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      date: defaultValues?.date || new Date(),
      amount: defaultValues?.amount,
      description: defaultValues?.description || '',
      category: defaultValues?.category || '',
      receiptUrl: defaultValues?.receiptUrl || '',
      notes: defaultValues?.notes || '',
    },
  })

  async function handleSubmit(data: CreateExpenseInput) {
    setIsSubmitting(true)
    try {
      let categoryValue = data.category

      // If "Other" is selected and a custom name is provided, create the new category
      if (data.category === 'OTHER' && customCategoryName.trim()) {
        try {
          const newCategory = await createCategory(customCategoryName.trim())
          categoryValue = newCategory.value
        } catch (error) {
          // If category creation fails (e.g., already exists), try to use the generated value
          const generatedValue = customCategoryName
            .trim()
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
          categoryValue = generatedValue || 'OTHER'
        }
      }

      await onSubmit({ ...data, category: categoryValue })
      setCustomCategoryName('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground">Amount</FormLabel>
              <FormControl>
                <AmountInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground">Description</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="What was this expense for?"
                  className="bg-card-elevated border-border h-12"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground">Category</FormLabel>
              <FormControl>
                <CategoryPicker
                  value={field.value}
                  onChange={field.onChange}
                  onCustomCategoryName={setCustomCategoryName}
                  customCategoryName={customCategoryName}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground">Date</FormLabel>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full h-12 justify-start text-left font-normal bg-card-elevated border-border',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value instanceof Date ? field.value : new Date(field.value)}
                    onSelect={(date) => {
                      if (date) {
                        field.onChange(date)
                        setCalendarOpen(false)
                      }
                    }}
                    disabled={(date) => date > new Date() || date < new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Receipt Upload */}
        <FormField
          control={form.control}
          name="receiptUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground">Receipt (optional)</FormLabel>
              <FormControl>
                <ReceiptUpload
                  value={field.value || undefined}
                  onChange={(url) => field.onChange(url || '')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes (collapsible) */}
        <div>
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showNotes ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            Add notes (optional)
          </button>
          {showNotes && (
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="mt-2">
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Additional notes..."
                      className="bg-card-elevated border-border min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Submit */}
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
            submitLabel
          )}
        </Button>
      </form>
    </Form>
  )
}
