'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Wallet,
  Settings,
  Bell,
  Coffee,
  ShoppingBag,
  Car,
  Loader2,
  Pencil,
  Trash2,
  Home,
  Users,
  PieChart,
} from 'lucide-react'

export default function DesignPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLoadingClick = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Design System</h1>
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="px-4 lg:px-6 py-6 space-y-8 pb-24">
        {/* Colour Palette */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Colour Palette</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Core Colours</h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <div className="h-12 rounded-lg bg-background border border-border" />
                  <p className="text-xs text-muted-foreground">Background</p>
                </div>
                <div className="space-y-1">
                  <div className="h-12 rounded-lg bg-card border border-border" />
                  <p className="text-xs text-muted-foreground">Card</p>
                </div>
                <div className="space-y-1">
                  <div className="h-12 rounded-lg bg-card-elevated" />
                  <p className="text-xs text-muted-foreground">Elevated</p>
                </div>
                <div className="space-y-1">
                  <div className="h-12 rounded-lg bg-secondary" />
                  <p className="text-xs text-muted-foreground">Secondary</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Accent Gradient</h3>
              <div className="h-16 rounded-xl bg-gradient-to-br from-primary to-red-600" />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="space-y-1">
                  <div className="h-12 rounded-lg bg-primary" />
                  <p className="text-xs text-muted-foreground">Primary (Orange)</p>
                </div>
                <div className="space-y-1">
                  <div className="h-12 rounded-lg bg-destructive" />
                  <p className="text-xs text-muted-foreground">Destructive (Red)</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Semantic</h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <div className="h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-emerald-400 text-xs">Success</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <span className="text-amber-400 text-xs">Warning</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <span className="text-red-400 text-xs">Danger</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-400 text-xs">Info</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Typography */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Typography</h2>
          <div className="space-y-4">
            <div>
              <p className="text-4xl font-bold tabular-nums">$12,345.67</p>
              <p className="text-xs text-muted-foreground mt-1">Balance Display (text-4xl font-bold)</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">Page Title</p>
              <p className="text-xs text-muted-foreground mt-1">text-2xl font-semibold</p>
            </div>
            <div>
              <p className="text-lg font-semibold">Section Header</p>
              <p className="text-xs text-muted-foreground mt-1">text-lg font-semibold</p>
            </div>
            <div>
              <p className="text-base font-medium">Card Title</p>
              <p className="text-xs text-muted-foreground mt-1">text-base font-medium</p>
            </div>
            <div>
              <p className="text-sm">Body text - The quick brown fox jumps over the lazy dog.</p>
              <p className="text-xs text-muted-foreground mt-1">text-sm (default body)</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Caption / helper text</p>
              <p className="text-xs text-muted-foreground mt-1">text-xs text-muted-foreground</p>
            </div>
          </div>
        </section>

        <Separator />

        {/* Balance Card - Signature Component */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Balance Card</h2>
          <p className="text-sm text-muted-foreground mb-4">The signature gradient card component</p>

          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-red-600 p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-white/80">Your expenses</p>
                <p className="text-3xl font-bold text-white tabular-nums mt-1">
                  $3,200.00
                </p>
              </div>
              <div className="h-8 w-12 bg-white/20 rounded-md flex items-center justify-center">
                <div className="flex gap-0.5">
                  <div className="h-4 w-4 rounded-full bg-red-500/80" />
                  <div className="h-4 w-4 rounded-full bg-orange-400/80 -ml-2" />
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
                +$59.45
              </Badge>
              <span className="text-xs text-white/60">this week</span>
            </div>
          </div>
        </section>

        <Separator />

        {/* Buttons */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Buttons</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm text-muted-foreground mb-3">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-muted-foreground mb-3">Sizes</h3>
              <div className="flex items-center gap-3">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon" aria-label="Add">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-muted-foreground mb-3">With Icons</h3>
              <div className="flex flex-wrap gap-3">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
                <Button variant="secondary">
                  <Receipt className="mr-2 h-4 w-4" />
                  View All
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-muted-foreground mb-3">Loading State</h3>
              <Button onClick={handleLoadingClick} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Adding...' : 'Add Expense'}
              </Button>
            </div>

            <div>
              <h3 className="text-sm text-muted-foreground mb-3">Quick Action Grid</h3>
              <div className="grid grid-cols-4 gap-3">
                <Button variant="secondary" className="h-16 flex-col gap-1 rounded-xl">
                  <ArrowUpRight className="h-5 w-5" />
                  <span className="text-xs">Send</span>
                </Button>
                <Button variant="secondary" className="h-16 flex-col gap-1 rounded-xl">
                  <ArrowDownLeft className="h-5 w-5" />
                  <span className="text-xs">Request</span>
                </Button>
                <Button variant="secondary" className="h-16 flex-col gap-1 rounded-xl">
                  <Plus className="h-5 w-5" />
                  <span className="text-xs">Add</span>
                </Button>
                <Button variant="secondary" className="h-16 flex-col gap-1 rounded-xl">
                  <Wallet className="h-5 w-5" />
                  <span className="text-xs">Balance</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Cards */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Cards</h2>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>Card description text goes here</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Card content area with standard padding.</p>
              </CardContent>
            </Card>

            <Card className="bg-card-elevated border-0">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Elevated Card</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Slightly lighter background for elevated surfaces.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Transaction List */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Transaction List</h2>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Recent Expenses</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary">
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {/* Transaction Item */}
              <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                  <Coffee className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">Starbucks</p>
                  <p className="text-xs text-muted-foreground">2:30 PM</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">-$105.00</p>
                  <p className="text-xs text-muted-foreground">Business</p>
                </div>
              </div>

              <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">Office Supplies</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">-$214.40</p>
                  <p className="text-xs text-muted-foreground">Equipment</p>
                </div>
              </div>

              <div className="flex items-center gap-3 py-3">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                  <Car className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">Uber - Client Meeting</p>
                  <p className="text-xs text-muted-foreground">Monday</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">-$75.00</p>
                  <p className="text-xs text-muted-foreground">Travel</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Avatars & Users */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Avatars & Users</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm text-muted-foreground mb-3">Sizes</h3>
              <div className="flex items-center gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>SM</AvatarFallback>
                </Avatar>
                <Avatar className="h-10 w-10">
                  <AvatarFallback>MD</AvatarFallback>
                </Avatar>
                <Avatar className="h-12 w-12">
                  <AvatarFallback>LG</AvatarFallback>
                </Avatar>
                <Avatar className="h-16 w-16">
                  <AvatarFallback>XL</AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-muted-foreground mb-3">With Gradient</h3>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center text-white font-semibold">
                  JD
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  AS
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold">
                  MK
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-muted-foreground mb-3">Founders Row</h3>
              <div className="flex items-center gap-4">
                <button className="flex flex-col items-center gap-1 group">
                  <Avatar className="h-14 w-14 ring-2 ring-transparent group-hover:ring-primary transition-all">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-red-600 text-white">JD</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">John</span>
                </button>
                <button className="flex flex-col items-center gap-1 group">
                  <Avatar className="h-14 w-14 ring-2 ring-transparent group-hover:ring-primary transition-all">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">AS</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">Alice</span>
                </button>
                <button className="flex flex-col items-center gap-1 group">
                  <Avatar className="h-14 w-14 ring-2 ring-transparent group-hover:ring-primary transition-all">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">MK</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">Mike</span>
                </button>
                <button className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Badges */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Badges</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm text-muted-foreground mb-3">Variants</h3>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-muted-foreground mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-0">Travel</Badge>
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-0">Equipment</Badge>
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-0">Marketing</Badge>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-0">Software</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-muted-foreground mb-3">Status</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-0">Pending</Badge>
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-0">Approved</Badge>
                <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-0">Rejected</Badge>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Form Elements */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Form Elements</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  className="pl-7 bg-card-elevated border-border text-2xl font-bold h-14"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                className="bg-card-elevated border-border"
                placeholder="What was this expense for?"
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select>
                <SelectTrigger className="bg-card-elevated border-border">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full lg:w-auto h-12">Add Expense</Button>
          </div>
        </section>

        <Separator />

        {/* Dialogs */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Dialogs</h2>

          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button>Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                  <DialogDescription>
                    Log a business expense to your founders tab.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="dialog-amount">Amount</Label>
                    <Input id="dialog-amount" placeholder="$0.00" className="bg-card-elevated" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the expense from your records.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary">Open Sheet</Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl h-[85vh]">
                <SheetHeader>
                  <SheetTitle>New Expense</SheetTitle>
                  <SheetDescription>
                    Add a new expense to your founders tab
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-2xl">$</span>
                      <Input className="pl-10 bg-card-elevated text-3xl font-bold h-16" placeholder="0.00" />
                    </div>
                  </div>
                  <Button className="w-full lg:w-auto h-12">Add Expense</Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </section>

        <Separator />

        {/* Loading & Empty States */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Loading & Empty States</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm text-muted-foreground mb-3">Skeleton Loading</h3>
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 w-1/3 bg-secondary rounded animate-pulse" />
                  <div className="h-8 w-1/2 bg-secondary rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-secondary rounded animate-pulse" />
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-sm text-muted-foreground mb-3">Full-page Loading</h3>
              <div className="flex items-center justify-center h-32 bg-card rounded-xl">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </div>

            <div>
              <h3 className="text-sm text-muted-foreground mb-3">Empty State</h3>
              <Card>
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                      <Receipt className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">No expenses yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start tracking by adding your first expense
                    </p>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Expense
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Separator />

        {/* Charts */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Charts</h2>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Spending by Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Travel', value: 2442, percentage: 100 },
                { label: 'Equipment', value: 1650, percentage: 67 },
                { label: 'Software', value: 856, percentage: 35 },
                { label: 'Marketing', value: 420, percentage: 17 },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.label}</span>
                    <span className="tabular-nums font-medium">${item.value.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Icons */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Icons</h2>
          <p className="text-sm text-muted-foreground mb-4">Using lucide-react exclusively</p>

          <div className="grid grid-cols-6 gap-4">
            {[
              { icon: Plus, label: 'Plus' },
              { icon: Receipt, label: 'Receipt' },
              { icon: Wallet, label: 'Wallet' },
              { icon: ArrowUpRight, label: 'Send' },
              { icon: ArrowDownLeft, label: 'Receive' },
              { icon: Users, label: 'Users' },
              { icon: Settings, label: 'Settings' },
              { icon: Bell, label: 'Bell' },
              { icon: Pencil, label: 'Pencil' },
              { icon: Trash2, label: 'Trash' },
              { icon: Home, label: 'Home' },
              { icon: PieChart, label: 'Chart' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </section>
        </div>
      </div>

      {/* Bottom Navigation Example - Mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 lg:hidden z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-around">
          <button className="flex flex-col items-center gap-1 py-2 px-4 text-primary">
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 px-4 text-muted-foreground hover:text-foreground transition-colors">
            <Receipt className="h-5 w-5" />
            <span className="text-xs">Expenses</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 px-4 text-muted-foreground hover:text-foreground transition-colors">
            <Users className="h-5 w-5" />
            <span className="text-xs">Founders</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 px-4 text-muted-foreground hover:text-foreground transition-colors">
            <PieChart className="h-5 w-5" />
            <span className="text-xs">Analytics</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
