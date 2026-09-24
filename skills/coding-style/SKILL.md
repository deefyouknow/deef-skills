---
name: coding-style
description: Apply consistent, maintainable coding standards across languages, including modular design, explicit dependencies, error handling, and readable implementation. Use when writing or reviewing code.
---

# 🧠 UNIVERSAL CODING STANDARDS

You are a senior software engineer. When writing code in ANY language, follow these rules strictly.

---

## 1. CORE PRINCIPLES

- **Modular**: Each feature lives in its own folder. Everything related to it stays inside.
- **Composition > Inheritance**: Compose small pieces. Avoid deep class hierarchies.
- **Explicit > Implicit**: No global state. No hidden dependencies. Pass everything explicitly.
- **Fail-Fast**: Validate early. Throw/return errors at the boundary, not deep inside.
- **Single Responsibility**: One function/class does one thing.

---

## 2. FOLDER STRUCTURE (Principle-Based)

For every new feature, create a dedicated folder. Inside, organize by **responsibility**, not by fixed names:

```
/features/{feature_name}/
├── (public interface / entry point)    ← What other modules call
├── (internal logic)                    ← Business logic, state, algorithms
├── (types / contracts)                 ← Models, DTOs, interfaces
├── (tests)                             ← Unit/integration tests
└── (utils)                             ← Helpers specific to THIS feature only
```

### Naming follows language convention:
- **React**: `components/`, `hooks/`, `types.ts`, `index.ts`
- **Backend**: `service/`, `repository/`, `controller/`, `types.py`
- **CLI**: `commands/`, `parser/`, `types.go`
- **Game (Roblox)**: `server/`, `client/`, `shared/`, `types.luau`

### Rules:
- ✅ Feature can import from `/shared` or `/core`
- ❌ `/shared` or `/core` MUST NOT import back into any feature
- ❌ Never scatter feature files outside its own folder
- ❌ Never put feature-specific logic in `/shared`

---

## 3. SHARED CODE RULES (When to Move to /shared)

### ✅ Move to /shared when:
- **≥ 2 features** need the exact same logic
- The code is **stable** (won't change often)
- It has **no feature-specific business logic**
- It's a foundational building block (e.g., HTTP client, DB connector, UI kit, core utils)

### ❌ Do NOT move to /shared when:
- Only **1 feature** uses it → keep it in that feature
- "Might be useful later" → wait until it's actually needed (YAGNI)
- It contains feature-specific business rules
- It's still evolving or unstable

### Principle:
> "Shared code is the foundation of the system. It rarely changes. Feature code changes often."

---

## 4. CODE STYLE

### 4.1 Guard Clause (Early Return)
Flatten nested conditions:

```
❌ BAD:
function process(order):
    if order != null:
        if order.isValid():
            if order.hasItems():
                return calculate(order)
            else: throw EmptyError
        else: throw InvalidError
    else: throw NullError

✅ GOOD:
function process(order):
    if order == null: throw NullError
    if !order.isValid(): throw InvalidError
    if !order.hasItems(): throw EmptyError
    return calculate(order)
```

### 4.2 Naming
Names must reveal intent. Not too short. Not absurdly long.

```
❌ calcTotDiscVIP()          ← ย่อจนอ่านไม่ออก
❌ x, d, tmp, data, info     ← ไม่มีความหมาย
✅ calculateVIPDiscount()     ← กระชับ + สื่อ
✅ totalDiscountForVIPUser    ← ยาวขึ้นก็ OK ถ้าชัด
```

### 4.3 Function Size
- One function = one responsibility
- Aim for 20-30 lines max
- If longer → extract sub-functions with meaningful names
- But don't over-split into micro-functions that hurt readability

### 4.4 Error Handling
```
❌ BAD:
try { riskyOp() } catch { /* silent */ }

✅ GOOD:
try { riskyOp() }
catch (SpecificError e) {
    log(e)
    throw  // or handle explicitly
}
```

---

## 5. ANTI-PATTERNS (NEVER DO)

| ❌ Don't | ✅ Do Instead |
|---------|--------------|
| Global mutable state | Pass via parameters / dependency injection |
| Inheritance deeper than 2 levels | Use composition or interfaces |
| Functions longer than 50 lines | Extract meaningful sub-functions |
| Empty catch / swallow errors | Log + re-raise or handle explicitly |
| Magic numbers/strings | Use named constants |
| Comments explaining unreadable code | Rewrite the code to be readable |
| Move code to /shared "just in case" | Wait until ≥ 2 features need it |

---

## 6. WORKFLOW & DEFINITION OF DONE

### Small tasks (fix bug, add 1 function, touch < 3 files):
→ Write code directly. No planning needed.

### Large tasks (new feature, refactor, ≥ 3 files):

**Step 1 — Plan** (before writing code):
```
📋 Plan:
- Create: [list of files + paths]
- Modify: [list of files + paths]
- Dependencies: [libraries needed]
- Complexity: [low/medium/high]
```

**Step 2 — Execute**: Write code file-by-file, prefix each with:
```
// File: /features/{feature_name}/{file_name}
```

**Step 3 — Verify & Done Checklist** (code is complete only when):
- [ ] Folder structure follows the principle (public interface, internal logic, types, tests, utils)
- [ ] No circular dependencies (feature → shared ✅, shared → feature ❌)
- [ ] No global mutable state
- [ ] All public functions have type annotations
- [ ] All errors handled explicitly (no silent failures)
- [ ] Guard clauses used instead of nested ifs
- [ ] Names reveal intent (not too short, not absurdly long)
- [ ] Passes the language's linter/formatter
- [ ] Comments only for truly complex logic

### Modifying existing code (bug fix, refactor, change behavior):

Before changing ANY function, method, or type:

1. **Read first** — Read ALL files in the feature folder
2. **Trace impact** — Find every caller/consumer of what you're changing
3. **List affected files** — State: "Changing X will affect: [file1, file2]"
4. **Change all affected spots** — Don't fix one place and leave others broken

❌ NEVER: Jump straight to editing without reading the surrounding code
✅ ALWAYS: Read → Trace → List impact → Then edit all affected files

---

## 7. LANGUAGE-SPECIFIC RULES

Follow the **idiomatic conventions** of the target language:
- Naming style (snake_case, camelCase, PascalCase, etc.)
- Module system (imports, exports, packages)
- Error model (exceptions, Result types, error returns)
- Type system (static, dynamic, gradual)

→ But the **folder structure principles and rules above stay the same** across all languages.

---

**Remember**:
- Good code is code that another developer understands immediately, without asking you.
- Shared code is the foundation — rarely changes. Feature code changes often — keep it isolated.
