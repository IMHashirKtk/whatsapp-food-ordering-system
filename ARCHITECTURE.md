# Foodaji Architecture

## Overview

Foodaji is a production-ready SaaS that allows restaurants to receive and manage WhatsApp food orders.

The application consists of:

- Frontend Dashboard (Next.js)
- Backend API (Express + Prisma)
- PostgreSQL Database

The dashboard communicates exclusively with the REST API.

---

# Frontend Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- React Query
- Zustand
- Axios
- Zod
- React Hook Form

---

# Backend Stack

- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication

---

# Project Structure

```
src/

app/
components/
config/
features/
hooks/
lib/
providers/
services/
store/
types/
```

---

# Feature Structure

Every business feature follows the same structure.

```
features/

orders/
    components/
    hooks/
    schemas/
    services/
    types.ts
```

Rules:

- Components are UI only.
- Hooks contain React Query.
- Services call APIs.
- Schemas contain Zod validation.
- types.ts contains TypeScript models.

---

# Data Flow

Every request follows this flow:

```
UI Component

↓

React Query Hook

↓

Feature Service

↓

Axios Client

↓

Backend API
```

Components must never call Axios directly.

---

# Authentication Flow

Login

↓

Backend returns JWT

↓

Store token in Zustand + localStorage

↓

Axios attaches Bearer Token

↓

AuthProvider restores session

↓

AuthGuard protects routes

---

# Dashboard Flow

Dashboard Page

↓

useDashboard()

↓

dashboard.service.ts

↓

GET /dashboard/summary

↓

Dashboard Components

---

# Orders Flow

Orders Page

↓

useOrders()

↓

order.service.ts

↓

GET /orders

↓

OrderTable

Updating status:

OrderRowActions

↓

useUpdateOrderStatus()

↓

PATCH /orders/:id/status

---

# State Management

Global state:

- Authentication
- UI

Feature data:

React Query

Do not duplicate API data inside Zustand.

---

# React Query

Every feature has its own hooks.

Example:

```
useOrders()

↓

order.service.ts

↓

axios.ts
```

Never call services directly from components.

---

# Query Keys

All query keys are centralized.

Location:

```
src/config/queryKeys.ts
```

Never hardcode query keys.

---

# Shared Components

Reusable UI belongs inside:

```
components/
```

Feature-specific UI belongs inside:

```
features/<feature>/components/
```

---

# Styling

Tailwind CSS only.

Prefer reusable components.

Avoid duplicated styles.

---

# Error Handling

API errors are handled inside React Query.

Shared UI components:

- ErrorState
- EmptyState
- Loading

---

# API Responses

Standard response:

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

Paginated response:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

# Development Principles

- Production-first
- Strong typing
- Single responsibility
- Reusable components
- No duplicate logic
- Feature isolation
- Clean architecture
- Readable code
- Predictable folder structure

When extending the application, follow existing patterns before introducing new ones.
