# Foodaji Architecture Decisions

This document records important architectural decisions made during the development of Foodaji.

The goal is to preserve the reasoning behind major technical choices so they are not revisited without good reason.

---

# ADR-001

## Feature-Based Architecture

### Status

Accepted

### Decision

The frontend uses a feature-based architecture.

Example:

```
features/

auth/
dashboard/
orders/
customers/
menu/
settings/
```

Each feature owns:

- components
- hooks
- services
- schemas
- types

### Why

Business logic stays isolated.

Features can evolve independently.

The project scales better than organizing by file type.

### Alternatives Considered

Folder-by-type

```
components/
pages/
hooks/
services/
```

Rejected because it becomes difficult to maintain as the project grows.

---

# ADR-002

## React Query for Server State

### Status

Accepted

### Decision

React Query manages all server state.

### Why

- Automatic caching
- Background refetching
- Optimistic updates
- Request deduplication
- Pagination support

### Alternatives

Redux

Rejected because the project does not require global server-state management.

---

# ADR-003

## Zustand for Client State

### Status

Accepted

### Decision

Zustand manages only client-side application state.

Examples

- Authentication
- Sidebar state
- Theme
- UI preferences

### React Query is NOT stored inside Zustand.

### Why

Avoid duplicated server state.

Each tool has a single responsibility.

---

# ADR-004

## Axios as the HTTP Client

### Status

Accepted

### Decision

All HTTP communication uses Axios.

### Why

- Interceptors
- JWT support
- Request/response transformation
- Better error handling

### Alternatives

Fetch API

Rejected because authentication and interceptors would require additional boilerplate.

---

# ADR-005

## Authentication Flow

### Status

Accepted

### Decision

Authentication follows this flow

```
Login

↓

Backend returns JWT

↓

Store token

↓

Axios interceptor

↓

AuthProvider restores session

↓

AuthGuard protects pages
```

### Why

Keeps authentication centralized and predictable.

---

# ADR-006

## API Layer

### Status

Accepted

### Decision

Components never communicate directly with the backend.

Flow

```
Component

↓

Hook

↓

Service

↓

Axios

↓

Backend
```

### Why

Keeps UI independent from networking.

Improves testing and maintainability.

---

# ADR-007

## Shared vs Feature Components

### Status

Accepted

### Decision

Reusable components belong inside

```
components/
```

Feature-specific UI belongs inside

```
features/<feature>/components/
```

### Why

Prevents feature leakage.

Encourages reuse.

---

# ADR-008

## TypeScript Strategy

### Status

Accepted

### Decision

Every feature owns its own TypeScript models.

```
features/orders/types.ts
```

Global types are only used when shared by multiple features.

### Why

Keeps ownership clear.

Avoids a massive global types folder.

---

# ADR-009

## Validation Strategy

### Status

Accepted

### Decision

Forms use

- React Hook Form
- Zod

Validation schemas live inside the feature.

```
schemas/
```

### Why

Validation stays close to the feature.

---

# ADR-010

## Production-First Development

### Status

Accepted

### Decision

Every module should be production-ready from the first implementation.

Temporary or "quick fix" code should be avoided whenever practical.

### Why

Reduces future refactoring.

Improves consistency.

---

# Future Decisions

When making major architectural changes, record:

- Date
- Decision
- Reason
- Alternatives
- Consequences

Do not change accepted decisions without documenting the reason.

Architecture evolves intentionally, not accidentally.
