# Foodaji Development Guide

## Project

Foodaji is a production-ready WhatsApp Food Ordering SaaS.

Frontend:

- Next.js 15
- React 19
- TypeScript
- App Router
- React Query
- Zustand
- Axios
- Tailwind CSS
- shadcn/ui
- Zod

Backend:

- Express
- Prisma
- PostgreSQL

---

# Architecture Rules

Use Feature-Based Architecture.

Example:

src/features/orders/

    components/
    hooks/
    schemas/
    services/
    types.ts

Business logic belongs inside services and hooks.

Components should remain as presentational as possible.

Never call Axios directly inside components.

Always use React Query hooks.

Never duplicate code.

Reuse shared components whenever possible.

---

# Folder Rules

Global reusable components:

src/components

Feature-specific components:

src/features/<feature>/components

Global hooks:

src/hooks

Feature hooks:

src/features/<feature>/hooks

---

# API Rules

Always use:

src/lib/axios.ts

Never hardcode API URLs.

Always use:

src/config/queryKeys.ts

for React Query keys.

---

# TypeScript Rules

Avoid any.

Prefer explicit interfaces.

Strongly type requests and responses.

Match backend contracts exactly.

---

# React Query Rules

Components

↓

Hooks

↓

Services

↓

Axios

Never skip layers.

---

# Forms

Use React Hook Form.

Validate with Zod.

---

# UI

Prefer existing shared components.

Keep UI consistent.

Avoid unnecessary wrappers.

---

# Imports

Use aliases.

Example:

import axiosClient from "@/lib/axios";

Avoid long relative imports.

---

# General

Production-first.

Readable.

Maintainable.

No overengineering.

No duplicate logic.

Keep files focused on one responsibility.
