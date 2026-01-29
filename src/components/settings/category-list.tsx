'use client'

import { useState, useCallback } from 'react'
import { Loader2, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { CategoryIcon } from '@/components/expenses/category-icon'
import { AddCategoryDialog } from './add-category-dialog'
import { useCompanyCategories, CompanyCategory } from '@/hooks/useCompanyCategories'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface CategoryListProps {
  isReadOnly?: boolean
}

export function CategoryList({ isReadOnly = false }: CategoryListProps) {
  const { categories, isLoading, refetch } = useCompanyCategories()
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<CompanyCategory | null>(null)

  // Use active categories from hook and display them
  const displayCategories = categories.map((c: CompanyCategory) => ({ ...c, isActive: true }))

  const handleToggleActive = async (category: CompanyCategory & { isActive: boolean }) => {
    setUpdatingId(category.id)
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !category.isActive }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update category')
      }

      toast.success(category.isActive ? 'Category disabled' : 'Category enabled')
      refetch()
    } catch (error) {
      toast.error('Failed to update category', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deletingCategory) return

    setUpdatingId(deletingCategory.id)
    try {
      const response = await fetch(`/api/categories/${deletingCategory.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete category')
      }

      toast.success('Category deleted')
      refetch()
    } catch (error) {
      toast.error('Failed to delete category', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    } finally {
      setUpdatingId(null)
      setDeletingCategory(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!isReadOnly && (
        <div className="flex justify-end">
          <AddCategoryDialog onCategoryAdded={refetch} />
        </div>
      )}

      <div className="space-y-2">
        {displayCategories.map((category: CompanyCategory & { isActive: boolean }) => (
          <div
            key={category.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
          >
            <div className="text-muted-foreground">
              <GripVertical className="h-4 w-4" />
            </div>

            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
              <CategoryIcon icon={category.icon} size="md" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{category.label}</p>
              <p className="text-xs text-muted-foreground">
                {category.value === 'OTHER'
                  ? 'Required for custom entries'
                  : category.isDefault
                    ? 'Default category'
                    : 'Custom category'}
              </p>
            </div>

            {!isReadOnly && (
              <div className="flex items-center gap-2">
                {updatingId === category.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {/* OTHER category cannot be disabled - it's required for custom entries */}
                    {category.value !== 'OTHER' && (
                      <Switch
                        checked={category.isActive}
                        onCheckedChange={() => handleToggleActive(category)}
                        disabled={updatingId !== null}
                      />
                    )}
                    {!category.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingCategory(category)}
                        disabled={updatingId !== null}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {displayCategories.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No categories found
        </div>
      )}

      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deletingCategory?.label}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
