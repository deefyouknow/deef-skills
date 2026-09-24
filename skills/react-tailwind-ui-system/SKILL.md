---
name: react-tailwind-ui-system
description: Build and maintain accessible React interfaces with Tailwind using a consistent reusable design system. Use when creating or changing React and Tailwind UI.
---

# Skill: Tailwind Design System UI Builder

## Objective
Create and maintain React + Tailwind UI components using a centralized design system.
Do not create one-off UI styles for each page.
All UI must be reusable, consistent, accessible, and responsive.

This skill acts as a **contract for code generation**, not just a style guide — outputs should be deterministic and consistent across generations.

## Scope
Use this skill when asked to create or modify:
- Buttons
- Inputs
- Fields
- Cards
- Layout sections
- Grids
- Stacks
- Modals
- Badges
- Alerts
- Animations
- UI components for a React + Tailwind app

## Core Rules
1. Use React component-based design.
2. Use PascalCase component names.
   - Good: Button, Input, Card, Section, Stack
   - Bad: button_all, mybutton, special_ui
3. Do not use lowercase or snake_case JSX tags.
4. Use Tailwind utility classes.
5. Avoid arbitrary values unless absolutely necessary.
   - Bad: w-[317px], h-[41px], px-[13px]
   - Good: w-full, h-10, px-4, gap-4
6. Use semantic variants instead of random style props.
   - Good: variant="primary", size="md"
   - Bad: red, big, shadow, glow
7. Reuse existing components before creating new ones.
8. Do not duplicate similar UI styles across pages.
9. Separate UI from business logic. Actions passed via props (onClick, onChange, onSubmit).
10. Components must support common states: default, hover, focus, active, disabled, loading, error (when relevant).
11. **Use `export const ComponentName = ...` (named exports) for all components.** No default exports.
12. **Merge classes with a `cn()` utility (`clsx` + `tailwind-merge`).** Never concatenate class strings manually or use template literals for conditional classes.
   ```ts
   // src/lib/cn.ts
   import { clsx, type ClassValue } from "clsx";
   import { twMerge } from "tailwind-merge";

   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs));
   }
   ```
13. **Components that wrap a single native element** (Button, Input, Card, Stack, etc.) **must extend that element's native attributes interface**, not redeclare them.
   - Bad: manually listing `disabled`, `onClick`, `type`, `children`, etc.
   - Good:
   ```ts
   interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
     variant?: "primary" | "secondary" | "destructive" | "ghost";
     size?: "sm" | "md" | "lg";
     loading?: boolean;
   }
   ```
   This ensures components always accept standard native props (`aria-label`, `name`, `form`, `value`, etc.) without the skill having to anticipate every case.

   **Composite components** that don't map to one native element (Field, Modal, etc.) may define a custom prop API instead — but must still not redeclare props that already exist on whatever native element they render internally (e.g. don't add a custom `children` or `className` prop that shadows the real one).
14. **Components using `forwardRef` must set `displayName`.**
   ```ts
   export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
     (props, ref) => { ... }
   );
   Button.displayName = "Button";
   ```

## File Structure
Place reusable UI components in:

```
src/components/ui/
  button.tsx
  input.tsx
  field.tsx
  card.tsx
  layout.tsx
  badge.tsx
  alert.tsx
src/lib/
  cn.ts
```

## Design Tokens

Use semantic color tokens bound to CSS variables (defined once in `globals.css` or `tailwind.config`), not raw Tailwind colors (`bg-blue-600`) and not `dark:` variants scattered in components. Swapping the `.dark` class on `<html>` changes the variable value; components stay the same.

### Core semantic token vocabulary
```
background / foreground
card / card-foreground
primary / primary-foreground
secondary / secondary-foreground
muted / muted-foreground
accent / accent-foreground
destructive / destructive-foreground
border
input
ring
```

**Rule: Do not introduce a new semantic token for a single component or page.** Reuse an existing token unless the new token represents a role that recurs across the design system. If a component seems to need a new token, stop and flag it rather than inventing one silently (e.g. `bg-accent-primary`, `bg-card-muted`).

## Component Requirements

### Button

```ts
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}
```

Rules:
- Use a real `<button>` element.
- Default `type="button"` when not specified.
- Use `inline-flex items-center justify-center`.
- Include `focus-visible` styles.
- Include disabled styles.
- **Loading semantics:**
  - Derive once near the top of the component: `const isDisabled = disabled || loading;` — then use `isDisabled` everywhere (the `<button disabled>` attribute, any interaction guards), rather than repeating `disabled || loading` in multiple places.
  - `aria-busy={loading || undefined}`
  - Keep the button's label/children rendered (don't swap text out) so width doesn't jump; show a spinner alongside or over the content instead of replacing it.
- Do not put business logic inside the button component.
- `forwardRef` + `displayName` required.

Usage (shown in output, not committed inside the component file):
```tsx
<Button variant="primary" onClick={handleSave}>
  บันทึก
</Button>
```

### Input

```ts
type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
```
(If custom props are ever needed, switch this back to an `interface ... extends ...`.)

Rules:
- Use a real `<input>` element.
- `w-full rounded-lg border`.
- Include focus state.
- Include disabled state.
- **Input does not own an `error` string prop.** It only reflects invalid state via the native `aria-invalid` attribute, styled with:
  ```
  aria-[invalid=true]:border-destructive
  ```
- `forwardRef` + `displayName` required.
- Input does not know or render error messages — that's `Field`'s job (see below).

Usage:
```tsx
<Input id="username" aria-invalid aria-describedby="username-error" />
```

### Field

```ts
interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  errorId?: string;
  children: ReactNode;
}
```

Rules:
- Renders the `<label>`, the child control, and the error message (if `error` is provided).
- **Does not auto-inject accessibility props via `cloneElement` or Context.** The wiring between `Field` and its child `Input` is explicit — the caller passes matching `id`/`htmlFor` and `aria-describedby`/`errorId` themselves. (A Context-based version can be introduced later as a deliberate architecture decision, not assumed by default.)
- Vertical flex layout.
- Error message uses small text, tied visually and via `errorId` to the input.
- **When `error` is provided and the input uses `aria-describedby`, `errorId` must also be provided and must match the `id` of the rendered error element.** Don't render an error message without a matching, connected id.

Usage:
```tsx
<Field label="ชื่อผู้ใช้" htmlFor="username" error="กรุณากรอกชื่อผู้ใช้" errorId="username-error">
  <Input id="username" aria-invalid aria-describedby="username-error" />
</Field>
```

### Card

```ts
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: React.ReactNode;
}
```
(Use `heading`, not `title` — `title` is already a native HTML attribute with tooltip semantics, so reusing it would collide.)

Rules:
- Rounded border and subtle shadow.
- Optional header for title.
- Content area has padding.
- Do not force fixed height.

### Layout Components

Components: `Section`, `Center`, `Stack`, `Grid`

Rules:
- `Section` provides page spacing.
- `Center` uses `flex items-center justify-center`.
- `Grid` uses responsive grid columns.
- Avoid fixed widths.

**Stack gap is deterministic, not free-form:**
```ts
type StackGap = "sm" | "md" | "lg";

const gapMap: Record<StackGap, string> = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
};

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: StackGap; // default: "md"
}
```

## Animation Rules
1. Define reusable animations centrally (Tailwind config `keyframes`/`animation`), not per-component.
2. Use subtle durations (~150–250ms), `ease-out` for enter animations.
3. Avoid excessive animation unless requested.
4. For non-essential animations, consider `motion-reduce:*` or an equivalent reduced-motion strategy when practical. This is a recommendation, not a hard requirement — don't rebuild every animation to satisfy it unless asked.

Recommended animation names: `fadeIn`, `slideUp`, `scaleIn`.

## Responsive Rules
1. Components must not break when resized.
2. Avoid fixed width/height for main containers.
3. Use flex, grid, min-width, max-width, and responsive classes.
4. Mentally check at least: 360px, 768px, 1024px, 1280px.

## Accessibility Rules
1. Buttons use `<button>`, not `<div>`.
2. Inputs have associated labels (via `Field`).
3. Disabled elements are visually clear.
4. Loading buttons prevent interaction (via a derived `isDisabled` state) and announce state (`aria-busy`).
5. Focus states must be visible.
6. Invalid inputs use `aria-invalid`; error text is linked via `aria-describedby` → the `Field`'s error element `id`.

## Guard Clause & State Validation Rules
1. Validate or normalize conflicting runtime props before rendering.
2. Prefer early returns and derived state over deeply nested JSX conditionals.
3. Compute repeated state once (e.g. `const isDisabled = disabled || loading;`) instead of repeating the same condition in multiple places.
4. Do not add runtime guards for constraints already guaranteed by TypeScript.
5. Do not silently invent behavior for contradictory props.
6. For developer misuse that can't be represented cleanly in types, prefer a development warning or an explicit documented fallback over crashing the UI.
7. Keep guard clauses and derived state near the top of the component, before class composition and JSX.

## Output Requirements
When generating code, provide:
1. Component implementation.
2. TypeScript interfaces/types (this is the prop documentation — do not also write prose explaining each prop).
3. One concise usage example shown alongside the output. **Do not embed demo/example code inside the production component file**, and don't create a separate docs file or Storybook story unless explicitly requested.
4. Any required shared utility or config changes (e.g. new `cn.ts`, new CSS variable, Tailwind config addition).
5. Warnings if the request violates maintainability (e.g. asks for a one-off token, arbitrary pixel value, or duplicate of an existing component).

## Forbidden Patterns
Do not generate:
- Lowercase/snake_case JSX component tags
- Manually redeclared native HTML props instead of `extends React.*HTMLAttributes<...>`
- `error` as a string prop on `Input` (belongs on `Field`)
- New semantic color tokens for a single component/page
- `cloneElement`/Context-based prop injection between `Field` and `Input` unless explicitly requested as an architecture change
- Arbitrary pixel values for main layout
- Duplicated button/input styles across files
- Components mixing significant business logic
- Demo/example components left inside production source files
- Default exports

## Definition of Done
A UI component is complete when:
- It is reusable and follows the design system.
- Its props extend the relevant native HTML attributes interface.
- It supports relevant states (default/hover/focus/active/disabled/loading/error).
- It uses `cn()` for class merging.
- It uses only tokens from the core semantic vocabulary (or flags the need for a new one).
- It's responsive and accessible per the rules above.
- It does not duplicate an existing component.
- `forwardRef` components have `displayName`.
