'use client'

import { forwardRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useCompanySettings } from '@/hooks/useCompanySettings'

interface AmountInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: number | string
  onChange?: (value: number | undefined) => void
  className?: string
}

export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  ({ value, onChange, className, onBlur, ...props }, ref) => {
    const { currencySymbol } = useCompanySettings()
    // Track display value separately for formatting
    const [displayValue, setDisplayValue] = useState(() => {
      if (value === undefined || value === '') return ''
      return String(value)
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value

      // Allow empty input
      if (input === '') {
        setDisplayValue('')
        onChange?.(undefined)
        return
      }

      // Only allow numbers and single decimal point
      const regex = /^\d*\.?\d*$/
      if (!regex.test(input)) return

      // Limit to 2 decimal places during typing
      const parts = input.split('.')
      if (parts[1] && parts[1].length > 2) return

      setDisplayValue(input)

      // Parse and emit numeric value
      const numValue = parseFloat(input)
      if (!isNaN(numValue)) {
        onChange?.(numValue)
      }
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Format to 2 decimal places on blur
      if (displayValue && displayValue !== '') {
        const numValue = parseFloat(displayValue)
        if (!isNaN(numValue)) {
          setDisplayValue(numValue.toFixed(2))
        }
      }
      onBlur?.(e)
    }

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-2xl font-bold">
          {currencySymbol}
        </span>
        <Input
          ref={ref}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            'pl-10 text-2xl font-bold h-14 bg-card-elevated border-border tabular-nums',
            className
          )}
          placeholder="0.00"
          {...props}
        />
      </div>
    )
  }
)

AmountInput.displayName = 'AmountInput'
