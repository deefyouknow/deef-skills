# Redis Caching

## Cache-Aside Pattern (Standard Default)

```typescript
async function getProduct(id: string): Promise<Product> {
  const cacheKey = `product:${id}`;
  
  // 1. Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // 2. Cache miss — fetch from source
  const product = await db.findProduct(id);
  if (!product) throw new NotFoundError();
  
  // 3. Write to cache with TTL + jitter (prevents stampede on mass expiry)
  const ttl = 300 + Math.floor(Math.random() * 60); // 5min ± 1min
  await redis.setEx(cacheKey, ttl, JSON.stringify(product));
  
  return product;
}
```

**TTL jitter is mandatory**: Without it, cached items set at the same time expire simultaneously → thundering herd to your database.

## Cache Stampede Prevention

When a popular key expires, many concurrent requests all miss cache and hit the database simultaneously.

**Solution — Probabilistic Early Recomputation (XFetch)**:

```typescript
async function getCachedWithXFetch(key: string, compute: () => Promise<any>, ttl: number) {
  const raw = await redis.get(key);
  
  if (raw) {
    const { value, expiresAt, delta } = JSON.parse(raw);
    // Probabilistically recompute before expiry based on compute time
    const shouldRecompute = (Date.now() / 1000) - delta * Math.log(Math.random()) >= expiresAt;
    if (!shouldRecompute) return value;
  }
  
  // Recompute
  const start = Date.now();
  const value = await compute();
  const delta = (Date.now() - start) / 1000;
  const expiresAt = Date.now() / 1000 + ttl;
  
  await redis.setEx(key, ttl + 60, JSON.stringify({ value, expiresAt, delta }));
  return value;
}
```

**Simpler alternative — distributed lock**:
```typescript
const lockKey = `lock:${cacheKey}`;
const lock = await redis.set(lockKey, '1', { NX: true, EX: 10 });
if (!lock) {
  // Another process is recomputing — wait briefly and retry
  await sleep(100);
  return getCached(key);
}
try {
  const value = await compute();
  await redis.setEx(cacheKey, ttl, JSON.stringify(value));
  return value;
} finally {
  await redis.del(lockKey);
}
```

## Rate Limiting — Token Bucket via Lua (Atomic)

```lua
-- token_bucket.lua
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])   -- tokens per second
local now = tonumber(ARGV[3])           -- unix timestamp ms
local requested = tonumber(ARGV[4])

local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
local tokens = tonumber(bucket[1]) or capacity
local last_refill = tonumber(bucket[2]) or now

-- Refill tokens based on elapsed time
local elapsed = math.max(0, now - last_refill) / 1000
tokens = math.min(capacity, tokens + elapsed * refill_rate)

if tokens >= requested then
  tokens = tokens - requested
  redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
  redis.call('EXPIRE', key, math.ceil(capacity / refill_rate) * 2)
  return 1  -- allowed
else
  redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
  return 0  -- denied
end
```

```typescript
async function isRateLimited(identifier: string, capacity = 100, ratePerSec = 10): Promise<boolean> {
  const key = `ratelimit:${identifier}`;
  const result = await redis.eval(TOKEN_BUCKET_SCRIPT, [key], [capacity, ratePerSec, Date.now(), 1]);
  return result === 0; // 0 = denied
}
```

## Redis Data Structure Selection

| Use case | Structure | Why |
|----------|-----------|-----|
| Simple cache (JSON) | String + setEx | Simplest |
| Leaderboard | Sorted Set (ZADD/ZRANGE) | O(log N) rank operations |
| Unique visitor count | HyperLogLog | Probabilistic, uses ~12KB regardless of set size |
| Recent activity feed | List (LPUSH + LTRIM) | O(1) push, bounded size |
| Feature flags per user | Set (SADD/SISMEMBER) | O(1) membership check |
| Session data | Hash (HSET/HGET) | Field-level updates without deserializing entire value |
| Pub/Sub | Pub/Sub or Streams | Streams preferred: persistent, consumer groups, replay |

## Eviction Policy Selection

```
maxmemory-policy:
  allkeys-lru    → general cache (evict least-recently-used from all keys)
  volatile-lru   → mixed cache+persistent (only evict keys with TTL set)
  allkeys-lfu    → frequently accessed data (evict least-frequently-used)
  noeviction     → NEVER for cache; only for queues where losing data is unacceptable
```

**Default recommendation**: `allkeys-lru` for pure cache, `volatile-lru` if Redis is shared between cache and persistent data.
