# Clean Code & Architecture

## SOLID Principles in Practice

### Single Responsibility Principle
One reason to change. A `UserService` that handles registration, authentication, AND email sending violates SRP. Split into `UserRegistrationService`, `AuthService`, `EmailService`.

**Red flag**: A class/module with more than ~200 lines or more than 3 injected dependencies.

### Open/Closed Principle
Open for extension, closed for modification. Use interfaces, not concrete classes, in function signatures. Adding a new payment provider should not require editing existing payment code.

```typescript
// ✗ Closed to extension
function processPayment(type: 'stripe' | 'paypal', amount: number) { ... }

// ✓ Open to extension
interface PaymentProvider { charge(amount: number): Promise<Receipt>; }
function processPayment(provider: PaymentProvider, amount: number) { ... }
```

### Dependency Inversion Principle
High-level modules should not depend on low-level modules. Both should depend on abstractions.

```typescript
// ✗ Direct dependency
class OrderService {
  private db = new PostgresDatabase(); // hard dependency
}

// ✓ Depends on abstraction
class OrderService {
  constructor(private db: DatabasePort) {} // injected
}
```

## Guard Clauses

Reject bad input at the boundary. Return early. Never nest happy-path logic inside conditions.

```typescript
// ✗ Arrow anti-pattern (deeply nested)
function processOrder(order: Order | null) {
  if (order) {
    if (order.items.length > 0) {
      if (order.payment) {
        // actual logic buried 3 levels deep
      }
    }
  }
}

// ✓ Guard clauses
function processOrder(order: Order | null) {
  if (!order) throw new Error('Order is required');
  if (order.items.length === 0) throw new Error('Order must have items');
  if (!order.payment) throw new Error('Order must have payment');

  // actual logic at top level, no nesting
}
```

## Folder / Module Layout

Follow domain-first, not layer-first organization:

```
src/
  orders/          ← everything about orders
    order.entity.ts
    order.service.ts
    order.repository.ts
    order.controller.ts
    order.dto.ts
  payments/        ← everything about payments
    ...
  shared/          ← cross-cutting: logger, db connection, config
    ...
```

Avoid layer-first (`controllers/`, `services/`, `models/` at the root) — it forces you to jump across the codebase to understand one feature.

## Documentation & JSDoc Conventions

Document the **why**, not the **what**. The code says what — comments say why.

```typescript
/**
 * Fetches user by email. Returns null (not throws) when not found,
 * because callers distinguish "not found" from errors differently.
 * Throws only on database connectivity failure.
 */
async function findUserByEmail(email: string): Promise<User | null> { ... }
```

Rule: every exported function/class gets a JSDoc. Internal helpers only if the logic is non-obvious.

## Refactoring Heuristics

- **Extract till you drop**: if you need to comment a block, extract it to a named function.
- **Replace magic numbers**: `if (retries > 3)` → `if (retries > MAX_RETRIES)`
- **Remove boolean parameters**: `send(email, true)` — what does `true` mean? Use an options object or separate functions.
- **Prefer composition over inheritance**: mixins and interface composition over deep class hierarchies.
