# API Security

## JWT Design

### Access + Refresh Token Rotation

```
Client                    API                    DB/Cache
  │── POST /auth/login ──→│                         │
  │                       │── verify credentials ──→│
  │                       │←── user data ───────────│
  │←── { accessToken,     │                         │
  │      refreshToken } ──│── store refresh token ──→│
  │                       │                         │
  │── GET /api/data ──────→│ (Authorization: Bearer <accessToken>)
  │   (accessToken valid) │── verify JWT sig ────→  │
  │←── data ──────────────│                         │
  │                       │                         │
  │ (accessToken expired) │                         │
  │── POST /auth/refresh ─→│                         │
  │   (send refreshToken) │── validate refresh ────→│
  │                       │── issue NEW refreshToken→│ (rotate!)
  │←── { newAccessToken,  │── invalidate old ───────→│
  │      newRefreshToken } │                         │
```

**Access token**: Short-lived (15 min), stateless JWT, verified by signature only (no DB lookup).  
**Refresh token**: Long-lived (7-30 days), opaque random string, stored in DB, rotated on every use.

```typescript
// Token generation
const accessToken = jwt.sign(
  { sub: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '15m', issuer: 'api.myapp.com' }
);

const refreshToken = crypto.randomBytes(32).toString('hex');
await db.storeRefreshToken({
  token: hash(refreshToken), // store hash, not plaintext
  userId: user.id,
  expiresAt: addDays(new Date(), 30)
});
```

**Refresh token rotation**: Issue a new refresh token on every `/auth/refresh` call and immediately invalidate the old one. If a rotated (old) token is used, invalidate the **entire family** — this detects token theft.

## CORS Configuration

```typescript
// ✗ Too permissive
app.register(cors, { origin: '*' });

// ✓ Explicit allowlist
const allowedOrigins = new Set([
  'https://myapp.com',
  'https://www.myapp.com',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
].filter(Boolean));

app.register(cors, {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'), false);
    }
  },
  credentials: true,              // allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

## Injection Defense

### SQL Injection — Parameterized Queries Always

```typescript
// ✗ SQL injection vulnerability
const user = await db.query(`SELECT * FROM users WHERE email = '${email}'`);

// ✓ Parameterized
const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);

// ✓ ORM (Prisma/Drizzle handle parameterization automatically)
const user = await prisma.user.findUnique({ where: { email } });
```

### Input Validation at Every Boundary

```typescript
import { z } from 'zod';

const CreateOrderSchema = z.object({
  items: z.array(z.string().uuid()).min(1).max(100),
  shippingAddressId: z.string().uuid(),
  couponCode: z.string().regex(/^[A-Z0-9-]{4,20}$/).optional(),
});

app.post('/api/orders', async (req, reply) => {
  const input = CreateOrderSchema.safeParse(req.body);
  if (!input.success) {
    return reply.status(400).send({ errors: input.error.flatten() });
  }
  // input.data is now fully typed and safe
});
```

## Authorization — Preventing IDOR

IDOR (Insecure Direct Object Reference): User A requests `GET /orders/123` which belongs to User B.

```typescript
// ✗ No ownership check
app.get('/api/orders/:id', async (req) => {
  return db.findOrder(req.params.id);
});

// ✓ Always filter by authenticated user
app.get('/api/orders/:id', { preHandler: [authenticate] }, async (req) => {
  const order = await db.findOrder(req.params.id);
  
  if (!order) return reply.status(404).send();
  
  // Ownership check — critical
  if (order.userId !== req.user.id && req.user.role !== 'admin') {
    return reply.status(403).send(); // 403 not 404 (don't leak existence)
  }
  
  return order;
});
```

**Rule**: Every data fetch query should include the authenticated user's ID as a filter condition unless the user has explicit elevated permissions.

## Rate Limiting Strategy

```typescript
// Different limits for different endpoints
const rateLimits = {
  '/auth/login':   { requests: 5,   window: 60 },   // 5/min per IP — brute force protection
  '/auth/refresh': { requests: 10,  window: 60 },   // 10/min per token
  '/api/*':        { requests: 100, window: 60 },   // 100/min per user
  '/api/search':   { requests: 20,  window: 60 },   // stricter for expensive queries
};
```

**Rate limit headers** (return these so clients can back off):
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1720000000
Retry-After: 30  (only when 429 is returned)
```

## Security Headers

```typescript
app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // adjust for CSS-in-JS
      imgSrc: ["'self'", 'data:', 'https:'],
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
});
```
