---
name: system-architecture-guide
description: Deep-dive engineering reference for fast, low-resource, maintainable systems. Covers clean code/SOLID/guard clauses, backend server design (Rust/Axum, Go, Node/Fastify), PostgreSQL pooling with PgBouncer transaction mode, Redis caching (cache stampede prevention, rate-limit algorithms), frontend Atomic Design + design tokens for React/Next.js, ESP32/Arduino embedded firmware (memory, power, connectivity, OTA), testing strategy (testcontainers, hardware-in-loop), CI/CD pipeline design, and API security (JWT rotation, CORS, IDOR, injection defense). Use whenever designing, reviewing, or refactoring architecture, structuring a codebase, choosing DB/cache strategy, building ESP32/Arduino/IoT firmware, setting up tests or CI/CD, or hardening API auth/security, even for one narrow piece like "how do I pool DB connections" or "is my JWT setup secure", since these choices interact with the rest of the stack.
---

# System Architecture Guide

Reference set for designing systems that are **fast, maintainable, and resource-efficient** — from application code down to embedded firmware. This is a curated, opinionated engineering reference, not a tutorial; use it to make concrete decisions and cite trade-offs, not just as background reading.

## How to use this skill

Read this file first for the checklist and decision map, then open the specific reference file(s) that match the user's question. Don't load every reference file for every question — pick the ones relevant to what's being discussed.

| Reference file | Load when the user asks about... |
|---|---|
| `references/clean-code-architecture.md` | Code structure, SOLID, guard clauses, refactoring, folder/module layout, documentation/JSDoc conventions |
| `references/backend-server.md` | Choosing/comparing backend runtime (Rust/Axum, Go, Node+Fastify), server architecture, middleware, concurrency model |
| `references/postgres-pgbouncer.md` | Database connection handling, "connections keep dying", pool sizing, PgBouncer, prepared statements, connection leaks |
| `references/redis-caching.md` | Caching strategy, Redis data structures, cache stampede/thundering herd, rate limiting algorithms, TTL design |
| `references/frontend-atomic-design.md` | Frontend component structure, design system, theming, React/Next.js architecture |
| `references/embedded-esp32-arduino.md` | ESP32/Arduino firmware, embedded/IoT hardware projects, sensor/microcontroller code |
| `references/testing-strategy.md` | Test strategy, unit vs integration vs E2E, testcontainers, hardware-in-loop testing for firmware, flaky tests |
| `references/cicd-pipeline.md` | CI/CD pipeline design, GitHub Actions, Docker build, deployment strategy, OTA rollout strategy |
| `references/api-security.md` | Auth/JWT design, refresh token rotation, CORS config, injection defense, rate limiting for abuse prevention, authorization/IDOR |

## Core cross-cutting principles (apply everywhere, every layer)

1. **Fail fast, fail loud, fail cheap.** Guard clauses at every boundary (function input, API request, sensor read) — reject bad state immediately instead of letting it propagate.
2. **Single Source of Truth.** One place owns each piece of truth: one place for theme tokens, one place for a DB pool config, one place for a firmware's WiFi credentials — never duplicate.
3. **Resource pooling over ad-hoc connections.** Never let application code open raw connections/sockets per request — always go through a managed, bounded pool (PgBouncer, Redis pool, HTTP keep-alive pool, or a firmware's single persistent MQTT connection).
4. **Design for partial failure.** Every external dependency (DB, cache, network, sensor) WILL fail sometimes — the system must degrade gracefully, not cascade. This is the single most commonly skipped principle in the user's own draft and deserves explicit design in every layer (see stampede/circuit-breaker patterns in the Redis and Postgres references).
5. **Measure before optimizing.** Add tracing/metrics (or, for firmware, serial/flash logging + heap watermarks) before guessing where the bottleneck is.

## Quick-reference decision table

| Concern | Recommended default | Why |
|---|---|---|
| DB connection handling | PgBouncer in **transaction mode**, app-side pool small (5-20), idle_timeout + max_lifetime set | Turns thousands of app connections into a handful of real Postgres backends without losing throughput |
| Cache invalidation | Cache-aside + TTL with jitter, write-through for hot writes | Prevents both stale reads and stampede-on-expiry |
| Rate limiting | Token Bucket via Redis + Lua (atomic) | Best balance of burst tolerance and resource use |
| Frontend components | Atomic Design (atoms→molecules→organisms→templates→pages), tokens in one file | One place to change theme; no drift between components |
| Embedded control flow | Non-blocking state machine (millis()-based) or FreeRTOS tasks, never `delay()` in shared loop | Keeps the MCU responsive to sensors/network while "waiting" |
| Embedded connectivity | MQTT with QoS 1 + LWT, exponential-backoff reconnect | Survives flaky WiFi without hammering the broker or losing state visibility |

Each reference file below expands these with concrete config values, code shape, and the failure modes each pattern is defending against.
