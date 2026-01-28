'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'

interface ResponsiveDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface ResponsiveDrawerContentProps {
  children: React.ReactNode
  className?: string
}

interface ResponsiveDrawerHeaderProps {
  children: React.ReactNode
  className?: string
}

interface ResponsiveDrawerTitleProps {
  children: React.ReactNode
  className?: string
}

interface ResponsiveDrawerDescriptionProps {
  children: React.ReactNode
  className?: string
}

interface ResponsiveDrawerBodyProps {
  children: React.ReactNode
  className?: string
}

const ResponsiveDrawerContext = React.createContext<{
  isDesktop: boolean
}>({
  isDesktop: false,
})

function ResponsiveDrawer({ open, onOpenChange, children }: ResponsiveDrawerProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  return (
    <ResponsiveDrawerContext.Provider value={{ isDesktop }}>
      {isDesktop ? (
        <Dialog open={open} onOpenChange={onOpenChange}>
          {children}
        </Dialog>
      ) : (
        <Sheet open={open} onOpenChange={onOpenChange}>
          {children}
        </Sheet>
      )}
    </ResponsiveDrawerContext.Provider>
  )
}

function ResponsiveDrawerContent({ children, className }: ResponsiveDrawerContentProps) {
  const { isDesktop } = React.useContext(ResponsiveDrawerContext)

  if (isDesktop) {
    return (
      <DialogContent
        className={cn(
          'max-h-[90vh] overflow-y-auto sm:max-w-lg md:max-w-xl',
          className
        )}
      >
        {children}
      </DialogContent>
    )
  }

  return (
    <SheetContent side="bottom" className={cn('rounded-t-2xl max-h-[90vh] overflow-y-auto', className)}>
      {children}
    </SheetContent>
  )
}

function ResponsiveDrawerHeader({ children, className }: ResponsiveDrawerHeaderProps) {
  const { isDesktop } = React.useContext(ResponsiveDrawerContext)

  if (isDesktop) {
    return <DialogHeader className={className}>{children}</DialogHeader>
  }

  return <SheetHeader className={className}>{children}</SheetHeader>
}

function ResponsiveDrawerTitle({ children, className }: ResponsiveDrawerTitleProps) {
  const { isDesktop } = React.useContext(ResponsiveDrawerContext)

  if (isDesktop) {
    return <DialogTitle className={className}>{children}</DialogTitle>
  }

  return <SheetTitle className={className}>{children}</SheetTitle>
}

function ResponsiveDrawerDescription({ children, className }: ResponsiveDrawerDescriptionProps) {
  const { isDesktop } = React.useContext(ResponsiveDrawerContext)

  if (isDesktop) {
    return <DialogDescription className={className}>{children}</DialogDescription>
  }

  return <SheetDescription className={className}>{children}</SheetDescription>
}

function ResponsiveDrawerBody({ children, className }: ResponsiveDrawerBodyProps) {
  return <div className={cn('px-4 pb-4 space-y-4', className)}>{children}</div>
}

export {
  ResponsiveDrawer,
  ResponsiveDrawerContent,
  ResponsiveDrawerHeader,
  ResponsiveDrawerTitle,
  ResponsiveDrawerDescription,
  ResponsiveDrawerBody,
}
