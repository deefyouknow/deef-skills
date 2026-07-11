# PostgreSQL + PgBouncer

## Connection Pooling Architecture

```
App instances (many)
  ↓  (app-side pool: 5-20 connections per process)
PgBouncer  (transaction mode)
  ↓  (server-side pool: 10-50 connections total)
PostgreSQL (max_connections: 100-300)
```

**Why two pools?**: App-side pool avoids the overhead of establishing connections to PgBouncer for every request. PgBouncer pool limits total connections to Postgres regardless of how many app instances scale up.

## PgBouncer Configuration

```ini
[databases]
mydb = host=postgres port=5432 dbname=mydb

[pgbouncer]
pool_mode = transaction          ; ← most efficient; use session only if you need SET/advisory locks
max_client_conn = 1000           ; how many app connections PgBouncer accepts
default_pool_size = 25           ; connections to actual Postgres per db/user combo
min_pool_size = 5
reserve_pool_size = 5            ; emergency connections for spikes
reserve_pool_timeout = 3

; Connection health
server_idle_timeout = 600        ; close idle server connections after 10 min
server_lifetime = 3600           ; recycle connections every hour (prevents long-lived conn issues)
client_idle_timeout = 0          ; keep client connections open
```

**Transaction mode caveat**: Cannot use `SET`, session-level advisory locks, `LISTEN/NOTIFY`, or `PREPARE` statements across requests. Use session mode only for those specific use cases and route them to a separate PgBouncer instance.

## App-Side Pool (Node.js example with `pg`)

```typescript
import { Pool } from 'pg';

export const db = new Pool({
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  
  // Pool config
  max: 10,                  // max connections per process
  min: 2,                   // keep alive minimum
  idleTimeoutMillis: 30000, // release idle connections after 30s
  connectionTimeoutMillis: 3000, // fail fast if can't connect
  maxUses: 7500,            // recycle connection after N uses (prevents memory leaks in pg driver)
});

// Always release connections — use try/finally or a helper
async function withDb<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await db.connect();
  try {
    return await fn(client);
  } finally {
    client.release(); // ← never skip this
  }
}
```

## Pool Sizing Formula

```
Connections per process = (avg query duration ms / 1000) * target RPS per process + headroom

Example: 5ms avg query, 100 RPS target → (0.005 * 100) + 5 headroom = 5.5 → use 10
```

Then: `total Postgres connections = pool_per_process * num_processes`
Ensure this is well below `max_connections` in postgresql.conf (leave 20% headroom for admin connections).

## Common Failure Modes

| Symptom | Root cause | Fix |
|---------|-----------|-----|
| "too many connections" error | App opens connection per request | Add PgBouncer + app-side pool |
| Connections stuck "idle in transaction" | Query timed out but connection not released | Set `idle_in_transaction_session_timeout = 30s` in postgres |
| Connection leaks over time | Missing `client.release()` on error path | Use `withDb()` helper with try/finally |
| Slow queries after deploy | Prepared statement cache mismatch after schema change | Set `prepared_statements = off` in PgBouncer (transaction mode anyway) |
| Pool exhausted during traffic spike | Pool too small or queries too slow | Increase pool size OR fix slow queries (check `pg_stat_activity`) |

## Monitoring Queries

```sql
-- See active connections by state
SELECT state, count(*) FROM pg_stat_activity GROUP BY state;

-- Find long-running queries (> 30 seconds)
SELECT pid, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > interval '30 seconds'
ORDER BY duration DESC;

-- Find missing indexes (sequential scans on large tables)
SELECT relname, seq_scan, idx_scan
FROM pg_stat_user_tables
WHERE seq_scan > idx_scan AND n_live_tup > 10000
ORDER BY seq_scan DESC;
```
