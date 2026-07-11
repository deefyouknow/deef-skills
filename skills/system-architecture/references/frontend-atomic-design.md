# Frontend Atomic Design

## Component Hierarchy

```
atoms/        → HTML elements + single purpose: Button, Input, Icon, Badge, Spinner
molecules/    → Atoms grouped with logic: SearchBar (Input + Button), FormField (Label + Input + Error)
organisms/    → Complete UI sections: Navbar, ProductCard, CommentThread, DataTable
templates/    → Page layouts without data: DashboardLayout, AuthLayout
pages/        → Templates with real data injected (route-level components)
```

**Rule**: Organisms don't import other organisms. If you need to, extract a new template layer or rethink the structure.

## Design Tokens — Single Source of Truth

```typescript
// tokens.ts — one file, everything references this
export const tokens = {
  color: {
    primary: { 50: '#eff6ff', 500: '#3b82f6', 900: '#1e3a8a' },
    neutral: { 50: '#f9fafb', 500: '#6b7280', 900: '#111827' },
    error: '#ef4444',
    success: '#22c55e',
  },
  spacing: {
    xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', '2xl': '48px'
  },
  font: {
    size: { sm: '14px', base: '16px', lg: '20px', xl: '24px', '2xl': '30px' },
    weight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
    family: { sans: 'Inter, system-ui, sans-serif', mono: 'JetBrains Mono, monospace' }
  },
  radius: { sm: '4px', md: '8px', lg: '12px', full: '9999px' },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
    lg: '0 10px 15px rgba(0,0,0,0.10)'
  }
} as const;
```

**Never** hardcode `#3b82f6` in a component — always reference `tokens.color.primary[500]`. Theme changes become one-line edits.

## React Component Pattern

```typescript
// atoms/Button/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(styles.base, styles[variant], styles[size])}
      disabled={isLoading || rest.disabled}
      {...rest}
    >
      {isLoading ? <Spinner size="sm" /> : children}
    </button>
  );
}
```

**Principles**:
- Props have sensible defaults
- Loading/disabled states built-in (not added later)
- Spread `...rest` for native HTML props passthrough
- No business logic inside atoms/molecules

## State Architecture

| State type | Location | Tool |
|------------|----------|------|
| UI state (modal open, tab selected) | Component local | `useState` |
| Server state (fetched data, mutations) | Query cache | TanStack Query |
| Global client state (auth, theme, cart) | Global store | Zustand |
| URL state (filters, pagination) | URL params | `useSearchParams` |
| Form state | Form-local | React Hook Form |

**Anti-pattern**: Putting server state in Zustand. Server state has its own lifecycle (loading, error, stale, refetch) — TanStack Query handles this correctly.

## Next.js Architecture

```
app/
  (auth)/          ← route group, no URL segment
    login/
    register/
  (dashboard)/
    layout.tsx     ← shared dashboard layout
    page.tsx       ← /
    orders/
      page.tsx     ← /orders
      [id]/
        page.tsx   ← /orders/:id
  api/
    orders/
      route.ts     ← API routes, thin handlers only
components/
  ui/              ← atoms + molecules (no data fetching)
  features/        ← organisms (may fetch data via hooks)
lib/
  api/             ← API client functions
  hooks/           ← shared hooks
  utils/           ← pure functions, no React
```

**Server vs Client Components**:
- Default: Server Component (renders on server, zero JS to client)
- Add `'use client'` only when: uses `useState`, `useEffect`, browser APIs, event handlers
- Data fetching: Server Components fetch directly (`await db.query()`), no useEffect needed
