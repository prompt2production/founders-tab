'use client'

import { useState } from 'react'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DateRange {
  startDate?: Date
  endDate?: Date
}

interface DateRangeFilterProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

type PresetKey = 'today' | 'this-week' | 'this-month' | 'last-month' | 'this-year'

const presets: { key: PresetKey; label: string; getRange: () => DateRange }[] = [
  {
    key: 'today',
    label: 'Today',
    getRange: () => {
      const today = new Date()
      return { startDate: startOfDay(today), endDate: endOfDay(today) }
    },
  },
  {
    key: 'this-week',
    label: 'This Week',
    getRange: () => {
      const today = new Date()
      return { startDate: startOfWeek(today, { weekStartsOn: 1 }), endDate: endOfWeek(today, { weekStartsOn: 1 }) }
    },
  },
  {
    key: 'this-month',
    label: 'This Month',
    getRange: () => {
      const today = new Date()
      return { startDate: startOfMonth(today), endDate: endOfMonth(today) }
    },
  },
  {
    key: 'last-month',
    label: 'Last Month',
    getRange: () => {
      const lastMonth = subMonths(new Date(), 1)
      return { startDate: startOfMonth(lastMonth), endDate: endOfMonth(lastMonth) }
    },
  },
  {
    key: 'this-year',
    label: 'This Year',
    getRange: () => {
      const today = new Date()
      return { startDate: startOfYear(today), endDate: endOfYear(today) }
    },
  },
]

function getActivePreset(value: DateRange): PresetKey | null {
  if (!value.startDate || !value.endDate) return null

  for (const preset of presets) {
    const range = preset.getRange()
    if (
      range.startDate?.getTime() === value.startDate.getTime() &&
      range.endDate?.getTime() === value.endDate.getTime()
    ) {
      return preset.key
    }
  }
  return null
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const activePreset = getActivePreset(value)
  const hasValue = value.startDate || value.endDate

  const handlePresetClick = (preset: typeof presets[0]) => {
    onChange(preset.getRange())
  }

  const handleClear = () => {
    onChange({ startDate: undefined, endDate: undefined })
  }

  const formatDateRange = () => {
    if (!value.startDate && !value.endDate) return 'Select dates'
    if (value.startDate && value.endDate) {
      if (activePreset) {
        return presets.find(p => p.key === activePreset)?.label || 'Custom'
      }
      return `${format(value.startDate, 'MMM d')} - ${format(value.endDate, 'MMM d')}`
    }
    if (value.startDate) return `From ${format(value.startDate, 'MMM d')}`
    if (value.endDate) return `Until ${format(value.endDate, 'MMM d')}`
    return 'Select dates'
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'justify-start text-left font-normal w-[200px]',
              !hasValue && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 space-y-3">
            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.key}
                  variant={activePreset === preset.key ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Custom Range */}
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground mb-2">Custom range</p>
              <div className="flex gap-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Start</p>
                  <Calendar
                    mode="single"
                    selected={value.startDate}
                    onSelect={(date) => onChange({ ...value, startDate: date ? startOfDay(date) : undefined })}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">End</p>
                  <Calendar
                    mode="single"
                    selected={value.endDate}
                    onSelect={(date) => onChange({ ...value, endDate: date ? endOfDay(date) : undefined })}
                    disabled={(date) => date > new Date() || (value.startDate ? date < value.startDate : false)}
                  />
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {hasValue && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={handleClear}
          aria-label="Clear date filter"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
