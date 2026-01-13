# Founders Tab Design System

This document defines the visual and interaction patterns for Founders Tab. All UI development must adhere to these standards.

---

## Design Philosophy

**Mobile-first, dark mode by default** with vibrant orange/red accents. The design draws inspiration from premium finance apps - clean, modern, and trustworthy while feeling approachable. Large typography for monetary values ensures clarity at a glance.

---

## Brand & Colour Palette

### Core Colours

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#0D0D0F` | Page background, near-black |
| `--foreground` | `#FAFAFA` | Primary text |
| `--card` | `#1A1A1C` | Card backgrounds |
| `--card-elevated` | `#242426` | Elevated surfaces, inputs |

### Primary Accent (Orange-Red Gradient)

The signature look - a warm orange to red gradient used for balance cards, CTAs, and highlights.

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#F97316` | Orange - primary actions |
| `--primary-hover` | `#EA580C` | Darker orange on hover |
| `--primary-gradient-start` | `#F97316` | Gradient start (orange) |
| `--primary-gradient-end` | `#DC2626` | Gradient end (red) |
| `--primary-foreground` | `#FFFFFF` | Text on primary backgrounds |

**Gradient CSS:**
```css
background: linear-gradient(135deg, var(--primary-gradient-start), var(--primary-gradient-end));
```

### Secondary/Neutral

| Token | Value | Usage |
|-------|-------|-------|
| `--secondary` | `#2A2A2C` | Secondary buttons, inactive states |
| `--secondary-hover` | `#3A3A3C` | Hover state |
| `--secondary-foreground` | `#FAFAFA` | Text on secondary |
| `--muted` | `#3A3A3C` | Disabled, borders |
| `--muted-foreground` | `#A1A1AA` | Secondary text, placeholders |

### Semantic Colours

| Purpose | Background | Text | Border |
|---------|------------|------|--------|
| Success | `#052E16` | `#4ADE80` | `#166534` |
| Warning | `#422006` | `#FBBF24` | `#854D0E` |
| Danger | `#450A0A` | `#F87171` | `#991B1B` |
| Info | `#0C1929` | `#60A5FA` | `#1E40AF` |

### Chart Colours

For analytics and spending breakdowns:
| Purpose | Colour |
|---------|--------|
| Chart Primary | `#F97316` (orange) |
| Chart Secondary | `#6B7280` (grey) |
| Chart Tertiary | `#A1A1AA` (light grey) |
| Chart Accent | `#DC2626` (red) |

---

## Typography

### Font Stack
```css
font-family: var(--font-geist-sans), system-ui, -apple-system, sans-serif;
font-family-mono: var(--font-geist-mono), 'SF Mono', monospace;
```

### Scale

| Element | Class | Size | Weight |
|---------|-------|------|--------|
| Balance Display | `text-4xl font-bold` | 36px | 700 |
| Page Title | `text-2xl font-semibold` | 24px | 600 |
| Section Header | `text-lg font-semibold` | 18px | 600 |
| Card Title | `text-base font-medium` | 16px | 500 |
| Body | `text-sm` | 14px | 400 |
| Caption/Helper | `text-xs` | 12px | 400 |
| Monetary Large | `text-3xl font-bold tabular-nums` | 30px | 700 |
| Monetary Small | `text-sm font-medium tabular-nums` | 14px | 500 |

### Text Colours
- **Primary:** `text-foreground` (white)
- **Secondary:** `text-muted-foreground` (grey)
- **Accent:** `text-primary` (orange)
- **On gradient:** `text-white`

**Use `tabular-nums` for all monetary values** to ensure proper alignment.

---

## Spacing

Use Tailwind's spacing scale consistently:

| Size | Value | Usage |
|------|-------|-------|
| xs | `1` (4px) | Icon gaps |
| sm | `2` (8px) | Related items |
| md | `4` (16px) | Component padding |
| lg | `6` (24px) | Section gaps |
| xl | `8` (32px) | Page margins |

### Component Spacing
- **Card padding:** `p-4` (mobile) / `p-6` (desktop)
- **Form field gap:** `space-y-4`
- **Button gap in groups:** `gap-3`
- **List item spacing:** `space-y-3`
- **Page container padding:** `px-4` (mobile) / `px-6` (desktop)

---

## Border Radius

Generous rounded corners for a friendly, modern feel:

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 8px | Buttons, badges |
| `--radius` | 12px | Inputs, small cards |
| `--radius-lg` | 16px | Cards, modals |
| `--radius-xl` | 20px | Large cards, balance widgets |
| `--radius-full` | 9999px | Pills, avatars |

---

## Shadows & Elevation

Subtle shadows for depth on dark backgrounds:

```css
/* Subtle card shadow */
shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);

/* Card elevation */
shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);

/* Modal/popup */
shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.5);

/* Glow effect for accent elements */
shadow-glow: 0 0 20px rgba(249, 115, 22, 0.3);
```

---

## Layout

### Mobile-First with Centered Desktop Container

The app is designed mobile-first, with a centered container on larger screens for a more comfortable reading experience.

**Mobile (default):**
- Full-width layout with `px-4` page padding
- Single column layout
- Bottom navigation (fixed)
- Touch-friendly tap targets (min 44px)

**Desktop (`lg:` and up):**
- Centered container with `max-w-6xl` (~1152px)
- Auto margins (`mx-auto`) for centering
- Increased horizontal padding (`px-6`)
- Bottom navigation hidden, consider sidebar for future

### Container Pattern

Use the `AppContainer` pattern for consistent page layouts:

```tsx
// Container wrapper for centered desktop layout
<div className="min-h-screen bg-background">
  <div className="max-w-6xl mx-auto">
    {/* Page content goes here */}
  </div>
</div>
```

### Page Structure

```tsx
// Mobile-first page layout with centered container
<div className="min-h-screen bg-background">
  <div className="max-w-6xl mx-auto">
    {/* Header - spans full container width */}
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Page Title</h1>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>

    {/* Content */}
    <div className="px-4 lg:px-6 py-6 space-y-6">
      {/* Cards and content */}
    </div>
  </div>

  {/* Bottom Navigation - Mobile only */}
  <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 lg:hidden z-50">
    {/* Nav items */}
  </nav>
</div>
```

---

## Components

### Balance Card (Signature Component)

The gradient balance card is the signature UI element.

```tsx
<div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-red-600 p-5">
  <div className="flex justify-between items-start">
    <div>
      <p className="text-sm text-white/80">Your expenses</p>
      <p className="text-3xl font-bold text-white tabular-nums mt-1">
        $3,200.00
      </p>
    </div>
    <div className="h-8 w-12 bg-white/20 rounded-md" /> {/* Card chip */}
  </div>
  <div className="mt-4 flex items-center gap-2">
    <Badge className="bg-white/20 text-white border-0">
      +$59.45
    </Badge>
    <span className="text-xs text-white/60">this week</span>
  </div>
</div>
```

### Buttons

**Variants:**
| Variant | Usage | Style |
|---------|-------|-------|
| `default` | Primary actions | Orange background |
| `secondary` | Secondary actions | Dark grey background |
| `ghost` | Subtle actions | Transparent, hover shows background |
| `outline` | Tertiary actions | Border only |
| `destructive` | Dangerous actions | Red background |

**Sizes:**
- `sm` - Compact (h-8)
- `default` - Standard (h-10)
- `lg` - Large (h-12)
- `icon` - Square icon button (h-10 w-10)

**Responsive Width:**
Buttons should be full-width on mobile for easy tap targets, but auto-width on desktop for a cleaner look:

```tsx
// Standard form button - full width on mobile, auto on desktop
<Button className="w-full lg:w-auto">
  Save Changes
</Button>

// For button groups, wrap in a flex container
<div className="flex flex-col lg:flex-row gap-3">
  <Button className="w-full lg:w-auto">Primary Action</Button>
  <Button variant="secondary" className="w-full lg:w-auto">Secondary</Button>
</div>
```

- Use `w-full lg:w-auto` for form submit buttons
- Buttons are left-aligned by default on desktop (follows form flow)
- For right-aligned buttons, wrap in `<div className="flex justify-end">`

**Quick Action Button Pattern:**
```tsx
// Grid of quick action buttons (like in inspiration)
<div className="grid grid-cols-4 gap-3">
  <Button variant="secondary" className="h-14 flex-col gap-1 rounded-xl">
    <ArrowUpRight className="h-5 w-5" />
    <span className="text-xs">Send</span>
  </Button>
  {/* ... more buttons */}
</div>
```

### Cards

```tsx
<Card className="bg-card border-border rounded-xl">
  <CardHeader className="pb-2">
    <CardTitle className="text-base font-medium">Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Transaction/Expense List Item

```tsx
<div className="flex items-center gap-3 py-3">
  {/* Icon/Logo */}
  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
    <Coffee className="h-5 w-5 text-muted-foreground" />
  </div>

  {/* Details */}
  <div className="flex-1 min-w-0">
    <p className="font-medium truncate">Starbucks</p>
    <p className="text-xs text-muted-foreground">2:30 PM</p>
  </div>

  {/* Amount */}
  <div className="text-right">
    <p className="font-semibold tabular-nums">-$105.00</p>
    <p className="text-xs text-muted-foreground">Business</p>
  </div>
</div>
```

### Avatar & User Chips

```tsx
// User avatar
<div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center text-white font-medium">
  JD
</div>

// Quick transfer row (like inspiration)
<div className="flex items-center gap-3">
  {users.map(user => (
    <button key={user.id} className="flex flex-col items-center gap-1">
      <Avatar className="h-12 w-12 ring-2 ring-transparent hover:ring-primary transition-all">
        <AvatarImage src={user.avatar} />
        <AvatarFallback>{user.initials}</AvatarFallback>
      </Avatar>
      <span className="text-xs text-muted-foreground">{user.name}</span>
    </button>
  ))}
  <button className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
    <Plus className="h-5 w-5" />
  </button>
</div>
```

### Forms

**Input styling for dark mode:**
```tsx
<Input
  className="bg-card-elevated border-border focus:border-primary focus:ring-primary"
  placeholder="Enter amount"
/>
```

**Form pattern:**
```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField
      control={form.control}
      name="amount"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-muted-foreground">Amount</FormLabel>
          <FormControl>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                {...field}
                className="pl-7 bg-card-elevated text-2xl font-bold h-14"
                placeholder="0.00"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit" className="w-full h-12">
      Add Expense
    </Button>
  </form>
</Form>
```

### Dialogs/Sheets

For mobile, prefer **Sheet** (bottom drawer) over Dialog:

```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button>Add Expense</Button>
  </SheetTrigger>
  <SheetContent side="bottom" className="rounded-t-2xl">
    <SheetHeader>
      <SheetTitle>New Expense</SheetTitle>
    </SheetHeader>
    {/* Form content */}
  </SheetContent>
</Sheet>
```

### Toasts (Sonner)

```tsx
// Success
toast.success('Expense added', {
  description: '$45.00 logged to your account'
})

// Error
toast.error('Failed to add expense', {
  description: 'Please try again'
})
```

**Setup:**
```tsx
<Toaster
  position="top-center"
  richColors
  theme="dark"
  toastOptions={{
    className: 'bg-card border-border'
  }}
/>
```

### Charts

For spending analytics, use simple bar charts:

```tsx
// Simple bar chart representation
<div className="space-y-2">
  {data.map(item => (
    <div key={item.label} className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{item.label}</span>
        <span className="tabular-nums">${item.value}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full"
          style={{ width: `${item.percentage}%` }}
        />
      </div>
    </div>
  ))}
</div>
```

---

## Loading States

### Button Loading
```tsx
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Adding...' : 'Add Expense'}
</Button>
```

### Skeleton
```tsx
// Card skeleton
<div className="rounded-xl bg-card p-4 space-y-3">
  <div className="h-4 w-1/3 bg-secondary rounded animate-pulse" />
  <div className="h-8 w-1/2 bg-secondary rounded animate-pulse" />
</div>
```

### Full-page loading
```tsx
<div className="flex items-center justify-center min-h-[200px]">
  <Loader2 className="h-8 w-8 animate-spin text-primary" />
</div>
```

---

## Empty States

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
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
```

---

## Icons

Use `lucide-react` exclusively. Common icons for this app:

| Purpose | Icon |
|---------|------|
| Add | `Plus` |
| Expense | `Receipt` |
| Money | `DollarSign`, `Wallet` |
| Send | `ArrowUpRight` |
| Receive | `ArrowDownLeft` |
| User | `User`, `Users` |
| Settings | `Settings` |
| Filter | `SlidersHorizontal` |
| Category | `Tag` |
| Date | `Calendar` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| Loading | `Loader2` |

**Size convention:**
- In buttons: `h-4 w-4`
- Navigation: `h-5 w-5`
- Empty states: `h-8 w-8`

---

## Accessibility

### Requirements
- All interactive elements keyboard accessible
- Touch targets minimum 44px on mobile
- ARIA labels on icon-only buttons
- Sufficient colour contrast (WCAG AA)
- Focus visible states

### Pattern
```tsx
// Icon button with aria-label
<Button variant="ghost" size="icon" aria-label="Add new expense">
  <Plus className="h-5 w-5" />
</Button>
```

---

## Animation

Subtle, performant animations:

```css
/* Default transition */
transition: all 150ms ease;

/* For modals/sheets */
transition: transform 300ms cubic-bezier(0.32, 0.72, 0, 1);

/* Hover scale for buttons */
hover:scale-105 active:scale-95 transition-transform
```

---

## Do's and Don'ts

### Do
- Use the gradient accent sparingly for emphasis
- Keep monetary values large and prominent
- Use `tabular-nums` for all numbers
- Maintain generous spacing on mobile
- Test on actual mobile devices
- Use Sheet instead of Dialog on mobile

### Don't
- Overuse the orange gradient
- Use light mode elements
- Forget empty/loading states
- Mix icon libraries
- Use arbitrary Tailwind values
- Modify `components/ui/` files
