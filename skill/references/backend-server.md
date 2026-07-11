# Backend Server Design

## Runtime Selection Decision Table

| Runtime | Choose when... | Avoid when... |
|---------|---------------|---------------|
| **Rust + Axum** | CPU-bound work, latency SLA < 5ms p99, memory budget < 50MB, long-running service | Team unfamiliar with lifetimes, rapid prototype, heavy JSON transformations |
| **Go** | Network-heavy I/O, straightforward concurrency, ops-friendly binaries, team knows Go | Need generics-heavy abstractions (pre-1.18 patterns still common in codebases) |
| **Node.js + Fastify** | JS/TS team, rapid iteration, I/O-bound only, ecosystem matters | CPU-intensive paths, memory-sensitive environments |

**Rule of thumb**: For most web APIs — Node+Fastify first, Go if concurrency patterns become complex, Rust only when you have measurable latency or memory requirements that Node/Go can't meet.

## Fastify Server Architecture

```typescript
// server.ts — app factory pattern (testable)
import Fastify from 'fastify';
import { ordersPlugin } from './orders/orders.plugin.js';
import { authPlugin } from './auth/auth.plugin.js';

export function buildApp(opts = {}) {
  const app = Fastify({ logger: true, ...opts });
  
  // Register plugins in dependency order
  app.register(authPlugin);
  app.register(ordersPlugin, { prefix: '/api/v1/orders' });
  
  return app;
}

// main.ts — only does I/O, no logic
const app = buildApp();
await app.listen({ port: 3000, host: '0.0.0.0' });
```

**Key**: `buildApp()` returns the app without starting it — this makes integration tests trivial (inject `app.inject()`).

## Middleware Ordering

Order matters. Standard order:
1. Request ID injection (first, so all logs carry it)
2. Rate limiting (before auth, fail-fast on abuse)
3. Authentication (verify token)
4. Authorization (check permissions)
5. Input validation (reject malformed early)
6. Business logic handlers
7. Error handler (last, catches everything above)

## Concurrency Model

### Node.js — Event Loop Awareness
Never block the event loop. Offload CPU work:

```typescript
// ✗ Blocks event loop for all other requests during computation
app.get('/report', async () => {
  return computeHeavyReport(); // synchronous CPU work
});

// ✓ Offload to worker thread
import { runInWorker } from './worker-pool.js';
app.get('/report', async () => {
  return runInWorker('computeHeavyReport', {});
});
```

### Go — Goroutine Patterns
Use `errgroup` for concurrent fan-out with error propagation:

```go
g, ctx := errgroup.WithContext(ctx)
g.Go(func() error { return fetchUser(ctx, userID) })
g.Go(func() error { return fetchOrders(ctx, userID) })
if err := g.Wait(); err != nil { ... }
```

### Rust/Axum — State Sharing
Use `Arc<T>` for shared state, `tokio::sync::RwLock` only when needed:

```rust
#[derive(Clone)]
struct AppState {
    db: Arc<PgPool>,          // cheap to clone, pool manages connections
    cache: Arc<RedisPool>,
}
```

## Health Checks

Always implement two health endpoints:

```typescript
// /health/live — am I running? (for liveness probe)
app.get('/health/live', () => ({ status: 'ok' }));

// /health/ready — can I serve traffic? (for readiness probe)
app.get('/health/ready', async () => {
  await db.query('SELECT 1'); // verify DB connectivity
  return { status: 'ok', db: 'connected' };
});
```
