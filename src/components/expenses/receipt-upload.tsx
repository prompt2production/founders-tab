'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Loader2, FileText, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ReceiptUploadProps {
  value?: string
  onChange: (url: string | undefined) => void
  className?: string
}

export function ReceiptUpload({ value, onChange, className }: ReceiptUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = useCallback(
    async (file: File) => {
      setIsUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        const { url } = await response.json()
        onChange(url)
        toast.success('Receipt uploaded')
      } catch (error) {
        toast.error('Upload failed', {
          description: error instanceof Error ? error.message : 'Please try again',
        })
      } finally {
        setIsUploading(false)
      }
    },
    [onChange]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleRemove = () => {
    onChange(undefined)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const isPDF = value?.endsWith('.pdf')

  if (value) {
    return (
      <div className={cn('relative', className)}>
        <div className="relative rounded-lg border border-border bg-card overflow-hidden">
          {isPDF ? (
            <div className="flex items-center justify-center h-32 bg-secondary">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
          ) : (
            <img
              src={value}
              alt="Receipt"
              className="w-full h-32 object-cover"
            />
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={isUploading}
        className={cn(
          'w-full h-32 flex flex-col items-center justify-center gap-2',
          'rounded-lg border-2 border-dashed transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-secondary/50',
          isUploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            <span className="text-sm text-muted-foreground">Uploading...</span>
          </>
        ) : (
          <>
            <div className="flex gap-2">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">
              Click or drag to upload receipt
            </span>
            <span className="text-xs text-muted-foreground/60">
              JPEG, PNG, WebP, or PDF (max 5MB)
            </span>
          </>
        )}
      </button>
    </div>
  )
}
