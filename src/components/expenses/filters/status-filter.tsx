'use client'

import { CheckCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface StatusFilterProps {
  value?: string
  onChange: (status: string | undefined) => void
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <Select
      value={value || 'all'}
      onValueChange={(val) => onChange(val === 'all' ? undefined : val)}
    >
      <SelectTrigger className="w-[180px]">
        <CheckCircle className="h-4 w-4 mr-2" />
        <SelectValue placeholder="All Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Status</SelectItem>
        <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
        <SelectItem value="APPROVED">Approved</SelectItem>
      </SelectContent>
    </Select>
  )
}
