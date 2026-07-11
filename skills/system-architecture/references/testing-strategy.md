# Testing Strategy

## Test Pyramid

```
        E2E (few, slow, expensive)
       /  Playwright, Cypress
      /
   Integration (moderate)
  /  API tests, DB tests with testcontainers
 /
Unit Tests (many, fast, cheap)
  Pure functions, business logic
```

**Rule of thumb**: 70% unit / 20% integration / 10% E2E. Invest in integration tests first if you have time for only one level — they catch the bugs that matter most (DB queries, API contracts).

## Unit Tests — What to Test

Test **behavior**, not **implementation**:

```typescript
// ✗ Tests implementation (brittle — breaks on refactor)
it('should call db.findUser once', () => {
  expect(mockDb.findUser).toHaveBeenCalledTimes(1);
});

// ✓ Tests behavior (robust — survives refactors)
it('should return null when user does not exist', async () => {
  mockDb.findUser.mockResolvedValue(null);
  const result = await userService.getUser('nonexistent-id');
  expect(result).toBeNull();
});
```

**What deserves unit tests**:
- Domain logic (pricing calculations, state transitions, validation rules)
- Pure utility functions
- Edge cases that are hard to trigger in integration tests

## Integration Tests with Testcontainers

```typescript
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { GenericContainer } from 'testcontainers';

describe('OrderRepository', () => {
  let container: StartedPostgreSqlContainer;
  let db: Pool;

  beforeAll(async () => {
    // Spin up real PostgreSQL in Docker
    container = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('testdb')
      .start();

    db = new Pool({ connectionString: container.getConnectionUri() });
    await runMigrations(db); // run your actual migration files
  }, 30000); // allow 30s for container startup

  afterAll(async () => {
    await db.end();
    await container.stop();
  });

  it('should persist and retrieve an order', async () => {
    const repo = new OrderRepository(db);
    const order = await repo.create({ userId: 'u1', total: 99.99 });
    
    expect(order.id).toBeDefined();
    
    const found = await repo.findById(order.id);
    expect(found?.total).toBe(99.99);
  });
});
```

**Redis testcontainer**:
```typescript
const redisContainer = await new GenericContainer('redis:7-alpine')
  .withExposedPorts(6379)
  .start();
const redisUrl = `redis://localhost:${redisContainer.getMappedPort(6379)}`;
```

## API Integration Tests (Fastify)

```typescript
describe('POST /api/orders', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp(); // no .listen() — uses inject()
    await app.ready();
  });

  afterAll(() => app.close());

  it('should return 401 without auth token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/orders',
      payload: { items: ['item-1'] }
    });
    expect(res.statusCode).toBe(401);
  });

  it('should create order for authenticated user', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/orders',
      headers: { authorization: `Bearer ${testToken}` },
      payload: { items: ['item-1'] }
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({ id: expect.any(String) });
  });
});
```

## Hardware-in-Loop Testing (Embedded)

For ESP32/Arduino:
1. **Unit test firmware logic on desktop** using PlatformIO's native environment + Unity test framework. No hardware needed.
2. **Hardware-in-loop**: Flash to real device, automated serial monitor asserts expected output.
3. **Smoke test**: After OTA deploy, verify MQTT heartbeat within 60s.

```ini
; platformio.ini
[env:native]
platform = native
build_flags = -DUNIT_TEST
test_framework = unity
```

```cpp
// test/test_sensor/test_main.cpp
#include <unity.h>
#include "sensor.h"

void test_temperature_conversion() {
  // Test pure conversion logic without hardware
  TEST_ASSERT_FLOAT_WITHIN(0.01, 25.0, rawToTemperature(8192));
}

int main() {
  UNITY_BEGIN();
  RUN_TEST(test_temperature_conversion);
  return UNITY_END();
}
```

## Preventing Flaky Tests

Most common causes and fixes:

| Flaky cause | Fix |
|-------------|-----|
| Race condition in async code | Use `await` everywhere; never `setTimeout` in tests |
| Shared state between tests | `beforeEach` cleanup; never share mutable module state |
| Order-dependent tests | Each test must be fully independent (DAMP, not DRY for setup) |
| Real network calls | Mock at the boundary (HTTP client, not internal service) |
| Hardcoded timestamps | Use a clock mock (`vi.useFakeTimers()` in Vitest) |
| Container startup timing | Use `waitForLog` or health check instead of `setTimeout` |
