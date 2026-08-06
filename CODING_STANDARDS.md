# Foodaji Coding Standards

This document defines the coding conventions used throughout the Foodaji project.

These standards ensure consistency, maintainability, and production-quality code.

---

# General Principles

- Write readable code.
- Prefer clarity over cleverness.
- Follow existing architecture before introducing new patterns.
- Avoid duplication.
- Every file should have a single responsibility.

---

# TypeScript

## Never use

```ts
any;
```

Use proper interfaces or types.

---

Prefer

```ts
interface Order {
  id: string;
}
```

instead of

```ts
type Order = {
  id: string;
};
```

Use `type` only for:

- Union types
- Utility types
- Function signatures
- Mapped types

---

Always type:

- Props
- API responses
- Requests
- Hook return values
- Service return values

Avoid implicit types for exported code.

---

# Naming Conventions

## Components

PascalCase

```
OrderTable.tsx
LoginForm.tsx
DashboardStats.tsx
```

---

## Hooks

Always start with "use"

```
useOrders.ts
useDashboard.ts
useLogin.ts
```

---

## Services

```
order.service.ts
dashboard.service.ts
auth.service.ts
```

---

## Schemas

```
login.schema.ts
order.schema.ts
```

---

## Types

Each feature owns its own

```
types.ts
```

---

## Stores

```
auth.store.ts
ui.store.ts
```

---

# React Components

Components should:

- Receive props
- Render UI
- Call hooks

Components should NOT:

- Call Axios
- Build API payloads
- Perform business logic
- Store duplicated API state

---

# Hooks

Hooks contain:

- React Query
- Mutations
- Queries
- Feature business logic

Hooks should never contain UI.

---

# Services

Services:

- Call APIs
- Transform API requests if necessary
- Return typed responses

Services should not contain UI logic.

---

# API

Always use:

```ts
axiosClient;
```

Never use

```ts
fetch();
```

unless specifically required.

Never hardcode URLs.

Always use

```ts
src / lib / axios.ts;
```

---

# React Query

Always use centralized query keys.

Correct:

```ts
queryKeys.orders.list(params);
```

Incorrect:

```ts
["orders"];
```

---

# Imports

Prefer aliases.

Correct:

```ts
import axiosClient from "@/lib/axios";
```

Avoid:

```ts
../../../lib/axios
```

---

# Exports

Prefer named exports.

Example:

```ts
export function useOrders() {}
```

Default exports are allowed only for:

- Next.js pages
- Next.js layouts
- React components where appropriate

---

# File Size

Target:

Components

- 50–200 lines

Hooks

- 30–150 lines

Services

- 20–150 lines

If a file grows beyond ~300 lines, consider splitting it.

---

# Folder Rules

Global reusable code:

```
components/
hooks/
services/
```

Feature-specific code:

```
features/orders/
features/menu/
features/customers/
```

Never place feature-specific code in global folders.

---

# Styling

Use Tailwind CSS.

Avoid inline styles.

Prefer reusable UI components.

---

# Forms

Use:

- React Hook Form
- Zod

Validation belongs inside:

```
schemas/
```

---

# Error Handling

Never ignore errors.

Use React Query error handling.

Display shared components:

- ErrorState
- EmptyState
- Loading

instead of custom implementations.

---

# Comments

Avoid unnecessary comments.

Bad:

```ts
// increment i
i++;
```

Good:

Explain WHY, not WHAT.

---

# Constants

Avoid magic values.

Bad:

```ts
limit = 20;
```

Good:

```ts
DEFAULT_PAGE_SIZE;
```

or

```ts
config.DEFAULT_PAGE_SIZE;
```

---

# Performance

Avoid unnecessary:

- useMemo
- useCallback
- memo()

Only optimize when there is measurable benefit.

Prefer simple code first.

---

# Code Reviews

Before committing, verify:

- No duplicate code
- Strong typing
- Uses existing architecture
- Uses centralized query keys
- No hardcoded API URLs
- No business logic inside components
- No unnecessary re-renders
- Imports are clean
- Feature isolation is maintained

---

# Development Philosophy

Every new feature should feel like it was written by the same developer.

Consistency is more valuable than cleverness.

Prefer maintainability over premature optimization.

When in doubt:

- Reuse existing patterns.
- Keep the solution simple.
- Build for production.
