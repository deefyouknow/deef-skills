# CI/CD Pipeline Design

## Pipeline Stages (GitHub Actions)

```
Push / PR
  ↓
[lint + typecheck]  ← fast, < 1min, fail early
  ↓
[unit tests]        ← fast, < 2min
  ↓
[build]             ← compile, bundle
  ↓
[integration tests] ← testcontainers, < 5min
  ↓
main branch only:
  ↓
[docker build + push]
  ↓
[deploy staging]
  ↓
[smoke test staging]
  ↓
[deploy production]  ← manual approval or auto
```

## GitHub Actions Template

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:unit
      - run: npm run test:integration

  build:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: |
          docker build -t ${{ env.IMAGE_NAME }}:${{ github.sha }} .
      - name: Push to registry
        if: github.ref == 'refs/heads/main'
        run: |
          echo ${{ secrets.REGISTRY_PASSWORD }} | docker login -u ${{ secrets.REGISTRY_USER }} --password-stdin
          docker push ${{ env.IMAGE_NAME }}:${{ github.sha }}
          docker tag ${{ env.IMAGE_NAME }}:${{ github.sha }} ${{ env.IMAGE_NAME }}:latest
          docker push ${{ env.IMAGE_NAME }}:latest
```

## Dockerfile Best Practices

```dockerfile
# Multi-stage build — dev dependencies stay out of production image
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci                        # install ALL deps including devDependencies
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app  # non-root user
COPY package*.json ./
RUN npm ci --omit=dev             # production deps only
COPY --from=builder /app/dist ./dist

USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:3000/health/live || exit 1
CMD ["node", "dist/main.js"]
```

**Result**: Production image is ~3x smaller (no devDeps, no source TypeScript).

## Deployment Strategy

| Strategy | Zero-downtime | Rollback | Use when |
|----------|--------------|---------|----------|
| **Rolling** | ✓ | Hard (redeploy old) | Standard web services |
| **Blue/Green** | ✓ | Instant (switch LB) | High-traffic, risk-averse |
| **Canary** | ✓ | Instant | Feature flags, gradual rollout |

**Canary example (nginx)**:
```nginx
upstream app {
  server app-v2:3000 weight=10;   # 10% traffic to new version
  server app-v1:3000 weight=90;
}
```

## OTA Rollout for Embedded (ESP32)

```
v1.0.0 → Deploy to 5% fleet (canary)
  ↓ Monitor: crash rate, heap watermark, MQTT heartbeat loss
v1.0.0 → 25% if metrics OK after 24h
  ↓
v1.0.0 → 100%
```

Rollback: retain v0.x.x firmware binary, flash via OTA topic `devices/cmd/rollback`.

## Secret Management

Never commit secrets. Use:
- **GitHub Actions**: `secrets.MY_SECRET` (encrypted at rest)
- **Production**: Environment variables injected at runtime, or secret manager (Vault, AWS Secrets Manager)
- **Local dev**: `.env` file (in `.gitignore`) + `.env.example` with placeholder values committed

```yaml
# .env.example (committed)
DATABASE_URL=postgres://user:password@localhost:5432/mydb
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-me-in-production
```
