# Foodaji API Contracts

This document defines the API contract between the Foodaji Dashboard (Frontend) and the Backend API.

The frontend must always follow these contracts exactly.

---

# Base URL

```
/api/v1
```

Authentication uses JWT Bearer Tokens.

---

# WhatsApp Meta Webhooks

GET

```
/api/v1/meta/webhook
```

The GET endpoint independently verifies Meta's subscription challenge using the
configured `META_VERIFY_TOKEN`.

POST

```
/api/v1/meta/webhook
```

The POST endpoint requires the `X-Hub-Signature-256` header. The signature is
verified with the exact raw request body using the configured Meta App Secret
(`META_APP_SECRET`). Existing tenant `webhookSecret` settings are used as the
fallback when the global App Secret is not configured.

Each customer message must include a non-empty
`value.metadata.phone_number_id`. The phone number ID is resolved exactly to a
configured restaurant; missing or unknown IDs are ignored and never fall back
to an unconfigured restaurant.

Meta deliveries may contain multiple entries, changes, and messages. Every
valid customer message is processed using the metadata belonging to its own
change. Status-only changes are acknowledged without entering the customer
conversation flow.

Meta message IDs are database-backed idempotency keys. A duplicate delivery is
acknowledged without repeating customer, cart, order, statistics, or response
side effects. If processing fails before completion, a later delivery may
retry after the processing claim is released or expires.

---

# Authentication

## Login

POST

```
/auth/login
```

Request

```json
{
  "email": "owner@example.com",
  "password": "password123"
}
```

Response

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "...",
    "user": {
      "id": "",
      "name": "",
      "email": "",
      "role": "",
      "restaurantId": ""
    }
  }
}
```

---

## Current User

GET

```
/auth/me
```

Response

```json
{
  "success": true,
  "data": {
    "id": "",
    "name": "",
    "email": "",
    "role": "",
    "restaurantId": ""
  }
}
```

---

# Dashboard

## Summary

GET

```
/dashboard/summary
```

Response

```json
{
  "success": true,
  "message": "Dashboard summary fetched successfully.",
  "data": {
    "restaurant": {
      "name": "Demo Restaurant",
      "timezone": "Asia/Karachi",
      "isOpen": true,
      "openingTime": "10:00",
      "closingTime": "23:00",
      "orderAcceptanceEnabled": true
    },
    "today": {
      "orders": 0,
      "grossOrderValue": 0,
      "recognizedRevenue": 0,
      "averageOrderValue": 0,
      "deliveredOrders": 0,
      "cancelledOrders": 0,
      "newCustomers": 0
    },
    "liveOrders": {
      "pending": 0,
      "accepted": 0,
      "preparing": 0,
      "ready": 0,
      "outForDelivery": 0,
      "active": 0
    },
    "signals": {
      "pendingPaymentVerification": 0,
      "unavailableMenuItems": 0
    },
    "recentOrders": [
      {
        "id": "",
        "orderNumber": "ORD-260807-A1B2",
        "total": 0,
        "status": "PENDING",
        "paymentStatus": "UNPAID",
        "paymentMethod": "COD",
        "createdAt": "",
        "customer": {
          "id": "",
          "name": null,
          "whatsappId": ""
        }
      }
    ]
  }
}
```

Dashboard summary is the operational home-screen contract. It derives the
restaurant from the authenticated user's `restaurantId` and never accepts a
client-supplied restaurant ID.

Today's date range is interpreted in `restaurant.timezone` and converted to
UTC. Queries use an inclusive start boundary and an exclusive next-day boundary:
`createdAt >= startUtc` and `createdAt < endUtc`.

Definitions:

- `today.orders`: all orders created today, including cancelled orders.
- `today.grossOrderValue`: sum of totals for non-cancelled orders created today,
  regardless of payment status.
- `today.recognizedRevenue`: sum of totals for non-cancelled orders created
  today where `paymentStatus` is `PAID` or `PENDING_VERIFICATION`.
- `today.averageOrderValue`: `grossOrderValue` divided by the number of
  non-cancelled orders created today; zero when there are no non-cancelled
  orders.
- `today.deliveredOrders`: orders created today whose current status is
  `DELIVERED`.
- `today.cancelledOrders`: orders created today whose current status is
  `CANCELLED`.
- `today.newCustomers`: customers whose first-ever order for this restaurant
  was created today. The first order is determined regardless of its status,
  matching the canonical Analytics definition.
- `liveOrders.pending`: all current orders with status `PENDING`, regardless of
  creation date.
- `liveOrders.active`: all current orders with status `ACCEPTED`, `PREPARING`,
  `READY`, or `OUT_FOR_DELIVERY`; pending orders are excluded.
- The other `liveOrders` status counts represent current state regardless of
  creation date.
- `signals.pendingPaymentVerification`: current non-cancelled orders whose
  payment status is `PENDING_VERIFICATION` and therefore require manual
  payment verification.
- `signals.unavailableMenuItems`: restaurant menu items with
  `isAvailable = false`.

Dashboard monetary fields are serialized as JSON numbers rounded to two
decimal places. Recent order monetary values are also normalized to JSON
numbers. Customer names may be `null`.

The Analytics endpoints below remain the canonical contracts for historical
reporting and selectable date ranges.

---

# Analytics

All Analytics endpoints require:

```
Authorization: Bearer <JWT_TOKEN>
```

Allowed roles:

```
OWNER, MANAGER
```

The backend derives `restaurantId` from the authenticated user. Analytics
endpoints never accept a client-supplied restaurant ID.

## Analytics Date Ranges

All endpoints accept optional date range parameters:

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| from | YYYY-MM-DD | No | Start restaurant-local calendar date. |
| to | YYYY-MM-DD | No | End restaurant-local calendar date. |

Defaults:

- When both `from` and `to` are omitted, the range is the latest 30
  restaurant-local calendar days ending today.
- When only `to` is supplied, `from` defaults to 29 days before `to`.
- When only `from` is supplied, `to` defaults to today in the restaurant
  timezone.

Range rules:

- `from` and `to` are interpreted as calendar dates in
  `RestaurantSettings.timezone`.
- The backend converts the range to UTC before querying.
- Queries use `createdAt >= fromStartUtc` and `createdAt < dayAfterToStartUtc`.
- Ranges where `from` is after `to` are rejected with `400`.
- The maximum range is 366 days.
- Invalid date formats and invalid calendar dates return `400`.
- The implementation does not rely on server-local timezone.
- Unknown query parameters are ignored after validation. In particular,
  `restaurantId` supplied by a client is ignored and never controls scope.

## Analytics Revenue Definitions

Analytics revenue fields use these definitions:

- `grossOrderValue`: sum of non-cancelled order totals, regardless of payment
  status.
- `recognizedRevenue`: sum of non-cancelled order totals where
  `paymentStatus` is `PAID` or `PENDING_VERIFICATION`.

Analytics revenue excludes:

- `CANCELLED` orders.
- `UNPAID` orders from `recognizedRevenue`.

Payment verification is manual in this phase. `PENDING_VERIFICATION` is included
in recognized revenue because the customer selected a non-COD payment flow, but
the payment has not necessarily been verified automatically.

Analytics monetary fields are JSON numbers, not Prisma Decimal strings. They are
calculated from exact database numerics and serialized as numbers rounded to two
decimal places; JSON may omit trailing zeroes.

## Overview

GET

```
/analytics/overview?from=2026-08-01&to=2026-08-31
```

Response

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "orders": 0,
    "cancelledOrders": 0,
    "cancellationRate": 0,
    "grossOrderValue": 0,
    "recognizedRevenue": 0,
    "averageOrderValue": 0,
    "newCustomers": 0,
    "returningCustomers": 0
  }
}
```

Definitions:

- `orders`: all orders created inside the selected range.
- `cancelledOrders`: orders inside the selected range with status `CANCELLED`.
- `cancellationRate`: `cancelledOrders / orders`, returned as a decimal ratio.
- `averageOrderValue`: `grossOrderValue / nonCancelledOrders`.
- `newCustomers`: customers whose first-ever order is inside the selected
  range.
- `returningCustomers`: customers with an order inside the selected range whose
  first-ever order was before the selected range.

Customer analytics are calculated from `Order` data. The backend does not use
`Customer.totalOrders` or `Customer.lifetimeSpend` for these metrics.

---

## Trends

GET

```
/analytics/trends?from=2026-08-01&to=2026-08-31&groupBy=day
```

Query parameters:

| Name | Type | Required | Default |
| ---- | ---- | -------- | ------- |
| groupBy | `day`, `week`, `month` | No | `day` |

Response

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "period": "2026-08-01",
      "orders": 0,
      "cancelledOrders": 0,
      "grossOrderValue": 0,
      "recognizedRevenue": 0,
      "averageOrderValue": 0
    }
  ]
}
```

Trend behavior:

- `period` is the restaurant-local period start date in `YYYY-MM-DD` format.
- Weekly buckets start Monday at 00:00, following PostgreSQL's
  `date_trunc('week', ...)` convention for the restaurant-local date.
- Monthly buckets use the first restaurant-local calendar date of the month.
- Missing periods are returned as zero-valued buckets.
- Buckets are returned in stable chronological order.

---

## Products

GET

```
/analytics/products?from=2026-08-01&to=2026-08-31&limit=10
```

Query parameters:

| Name | Type | Required | Default |
| ---- | ---- | -------- | ------- |
| limit | number, 1-50 | No | 10 |
| categoryId | CUID | No | none |

Response

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "topItems": [
      {
        "menuItemId": "",
        "name": "",
        "quantitySold": 0,
        "grossRevenue": 0,
        "recognizedRevenue": 0,
        "orderCount": 0
      }
    ],
    "topCategories": [
      {
        "categoryId": "",
        "name": "",
        "quantitySold": 0,
        "grossRevenue": 0,
        "recognizedRevenue": 0,
        "orderCount": 0
      }
    ]
  }
}
```

Product rules:

- Cancelled orders are excluded.
- `grossRevenue` is non-cancelled line-item revenue.
- `recognizedRevenue` is non-cancelled line-item revenue from `PAID` or
  `PENDING_VERIFICATION` orders.
- `orderCount` is the number of distinct non-cancelled orders containing the
  item or category.
- Queries are scoped through `Order.restaurantId`.
- Historical rows with missing menu/category relations are returned with a
  deleted-entity fallback name where possible.
- Results use stable secondary ordering by name and then entity ID.

---

## Operations

GET

```
/analytics/operations?from=2026-08-01&to=2026-08-31
```

Response

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "orderStatusDistribution": [
      {
        "status": "PENDING",
        "orders": 0
      }
    ],
    "paymentMethodDistribution": [
      {
        "paymentMethod": "COD",
        "orders": 0
      }
    ],
    "paymentStatusDistribution": [
      {
        "paymentStatus": "UNPAID",
        "orders": 0
      }
    ],
    "peakOrderingHours": [
      {
        "hour": 0,
        "orders": 0
      }
    ]
  }
}
```

Operations behavior:

- Distributions are calculated from all orders inside the selected range.
- `orderStatusDistribution` uses `PENDING`, `ACCEPTED`, `PREPARING`, `READY`,
  `OUT_FOR_DELIVERY`, `DELIVERED`, and `CANCELLED`.
- `paymentMethodDistribution` uses `EASYPAISA`, `JAZZCASH`, `BANK_TRANSFER`,
  and `COD`.
- `paymentStatusDistribution` uses `PENDING_VERIFICATION`, `UNPAID`, and
  `PAID`.
- Distribution entries with zero orders are omitted; the response includes only
  enum values present in the selected range.
- `peakOrderingHours` always returns 24 buckets, `0` through `23`.
- Hour buckets are interpreted in the restaurant timezone from
  `RestaurantSettings.timezone`.
- Zero-count hours are included.
- Average preparation time and average delivery time are not available in this
  phase because order status transition timestamps/history are not stored.

---

## Customers Analytics

GET

```
/analytics/customers?from=2026-08-01&to=2026-08-31&limit=10
```

Query parameters:

| Name | Type | Required | Default |
| ---- | ---- | -------- | ------- |
| limit | number, 1-50 | No | 10 |

Response

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "newCustomers": 0,
    "returningCustomers": 0,
    "topCustomersBySpend": [
      {
        "customerId": "",
        "name": null,
        "whatsappId": "",
        "orderCount": 0,
        "grossSpend": 0,
        "recognizedSpend": 0
      }
    ],
    "topCustomersByOrderCount": [
      {
        "customerId": "",
        "name": null,
        "whatsappId": "",
        "orderCount": 0,
        "grossSpend": 0,
        "recognizedSpend": 0
      }
    ]
  }
}
```

Customer rules:

- New and returning customers use the same first-ever order definitions as the
  Overview endpoint.
- First-ever order means the earliest order regardless of order status, so a
  customer whose only order is cancelled is still classified from that order.
- `orderCount` is all orders placed by the customer inside the selected range.
- `grossSpend` excludes cancelled orders.
- `recognizedSpend` excludes cancelled orders and includes only `PAID` or
  `PENDING_VERIFICATION` orders.
- Customer metrics are calculated from `Order` data, not denormalized customer
  counters.
- Results use stable secondary ordering by customer ID after the documented
  metric sort keys.

## Analytics Limitations

- Lifecycle timing metrics are not implemented yet.
- Average preparation time and average delivery time require new
  status-history or timestamp fields.
- Payment verification remains manual.
- No analytics-specific database indexes are added in this phase.
- Likely future indexes are `Order [restaurantId, createdAt]`,
  `OrderItem [orderId]`, and `OrderItem [menuItemId]`.

---

# Menu

All Menu endpoints require:

```
Authorization: Bearer <JWT_TOKEN>
```

Menu management endpoints are restaurant-scoped by the authenticated user's
`restaurantId`.

Decimal money fields are serialized as JSON decimal values by the backend. The
dashboard must safely accept either string or number values for these fields.

## Read-Only Response Fields

The following fields are returned by read and/or mutation responses but are not
accepted in category, menu item, option group, or option create/update payloads:

- Shared entity fields: `id`, `createdAt`, `updatedAt`, and `restaurantId`.
- Category responses: `_count.menuItems` on category lists and `menuItems` on
  category details and category updates.
- Menu item responses: `category` and `optionGroups` when included by the
  endpoint. Option groups may include nested `options`.
- Option group responses: `menuItem` and `options` when included by the
  endpoint.
- Option responses: `optionGroup` when included by the endpoint.

The backend derives `restaurantId` from the authenticated user; it must never
be supplied by the dashboard.

## Category Object

```json
{
  "id": "",
  "name": "",
  "description": null,
  "image": null,
  "isActive": true,
  "sortOrder": 0,
  "createdAt": "",
  "updatedAt": "",
  "restaurantId": ""
}
```

Category list responses include:

```json
{
  "_count": {
    "menuItems": 0
  }
}
```

Category detail responses include:

```json
{
  "menuItems": []
}
```

## Get Categories

GET

```
/menu/categories
```

Allowed roles:

```
OWNER, MANAGER
```

Response

```json
{
  "success": true,
  "message": "Success",
  "data": []
}
```

---

## Get Category

GET

```
/menu/categories/:id
```

Response

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

---

## Create Category

POST

```
/menu/categories
```

Request

```json
{
  "name": "Burgers",
  "description": "Signature burgers",
  "image": "/uploads/category.jpg",
  "sortOrder": 0,
  "isActive": true
}
```

Response

```json
{
  "success": true,
  "message": "Category created successfully.",
  "data": {}
}
```

---

## Update Category

PUT

```
/menu/categories/:id
```

Request

```json
{
  "name": "Premium Burgers",
  "description": "Signature burgers",
  "image": "/uploads/category.jpg",
  "sortOrder": 1,
  "isActive": true
}
```

Response

```json
{
  "success": true,
  "message": "Category updated successfully.",
  "data": {}
}
```

---

## Delete Category

DELETE

```
/menu/categories/:id
```

Response

```json
{
  "success": true,
  "message": "Category deleted successfully.",
  "data": null
}
```

---

## Menu Item Object

```json
{
  "id": "",
  "categoryId": "",
  "name": "",
  "description": null,
  "image": null,
  "basePrice": "0.00",
  "isAvailable": true,
  "isFeatured": false,
  "preparationTime": 15,
  "sortOrder": 0,
  "createdAt": "",
  "updatedAt": "",
  "restaurantId": ""
}
```

Item read responses may include:

```json
{
  "category": {},
  "optionGroups": []
}
```

## Get Menu Items

GET

```
/menu/items
```

Response

```json
{
  "success": true,
  "message": "Success",
  "data": []
}
```

---

## Get Menu Item

GET

```
/menu/items/:id
```

Response

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

---

## Get Menu Items By Category

GET

```
/menu/items/category/:categoryId
```

Response

```json
{
  "success": true,
  "message": "Success",
  "data": []
}
```

---

## Create Menu Item

POST

```
/menu/items
```

Request

```json
{
  "categoryId": "",
  "name": "Classic Burger",
  "description": "Beef patty with sauce",
  "image": "/uploads/item.jpg",
  "basePrice": 499,
  "isAvailable": true,
  "isFeatured": false,
  "preparationTime": 15,
  "sortOrder": 0
}
```

Response

```json
{
  "success": true,
  "message": "Menu item created successfully.",
  "data": {}
}
```

---

## Update Menu Item

PUT

```
/menu/items/:id
```

Request

```json
{
  "categoryId": "",
  "name": "Classic Burger",
  "description": "Beef patty with sauce",
  "image": "/uploads/item.jpg",
  "basePrice": 499,
  "isAvailable": true,
  "isFeatured": false,
  "preparationTime": 15,
  "sortOrder": 0
}
```

Response

```json
{
  "success": true,
  "message": "Menu item updated successfully.",
  "data": {}
}
```

---

## Delete Menu Item

DELETE

```
/menu/items/:id
```

Response

```json
{
  "success": true,
  "message": "Menu item deleted successfully.",
  "data": null
}
```

---

## Option Group Object

```json
{
  "id": "",
  "menuItemId": "",
  "name": "",
  "isRequired": false,
  "minSelect": 0,
  "maxSelect": 1,
  "sortOrder": 0,
  "createdAt": "",
  "updatedAt": ""
}
```

Option group read responses may include:

```json
{
  "menuItem": {},
  "options": []
}
```

## Get Option Groups

GET

```
/menu/option-groups
```

Response

```json
{
  "success": true,
  "message": "Success",
  "data": []
}
```

---

## Get Option Group

GET

```
/menu/option-groups/:id
```

Response

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

---

## Get Option Groups By Menu Item

GET

```
/menu/option-groups/menu-item/:menuItemId
```

Response

```json
{
  "success": true,
  "message": "Success",
  "data": []
}
```

---

## Create Option Group

POST

```
/menu/option-groups
```

Request

```json
{
  "menuItemId": "",
  "name": "Choose Sauce",
  "isRequired": true,
  "minSelect": 1,
  "maxSelect": 1,
  "sortOrder": 0
}
```

Validation:

- `minSelect` must be less than or equal to `maxSelect`.
- Required groups must have `minSelect` of at least `1`.

Response

```json
{
  "success": true,
  "message": "Option group created successfully.",
  "data": {}
}
```

---

## Update Option Group

PUT

```
/menu/option-groups/:id
```

Request

```json
{
  "menuItemId": "",
  "name": "Choose Sauce",
  "isRequired": true,
  "minSelect": 1,
  "maxSelect": 1,
  "sortOrder": 0
}
```

Response

```json
{
  "success": true,
  "message": "Option group updated successfully.",
  "data": {}
}
```

---

## Delete Option Group

DELETE

```
/menu/option-groups/:id
```

Response

```json
{
  "success": true,
  "message": "Option group deleted successfully.",
  "data": null
}
```

---

## Option Object

```json
{
  "id": "",
  "optionGroupId": "",
  "name": "",
  "extraPrice": "0.00",
  "isAvailable": true,
  "sortOrder": 0,
  "createdAt": "",
  "updatedAt": ""
}
```

Option read responses may include:

```json
{
  "optionGroup": {}
}
```

## Get Options

GET

```
/menu/options
```

Response

```json
{
  "success": true,
  "message": "Success",
  "data": []
}
```

---

## Get Option

GET

```
/menu/options/:id
```

Response

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

---

## Get Options By Group

GET

```
/menu/options/group/:optionGroupId
```

Response

```json
{
  "success": true,
  "message": "Success",
  "data": []
}
```

---

## Create Option

POST

```
/menu/options
```

Request

```json
{
  "optionGroupId": "",
  "name": "Extra Cheese",
  "extraPrice": 100,
  "isAvailable": true,
  "sortOrder": 0
}
```

Response

```json
{
  "success": true,
  "message": "Option created successfully.",
  "data": {}
}
```

---

## Update Option

PUT

```
/menu/options/:id
```

Request

```json
{
  "optionGroupId": "",
  "name": "Extra Cheese",
  "extraPrice": 100,
  "isAvailable": true,
  "sortOrder": 0
}
```

Response

```json
{
  "success": true,
  "message": "Option updated successfully.",
  "data": {}
}
```

---

## Delete Option

DELETE

```
/menu/options/:id
```

Response

```json
{
  "success": true,
  "message": "Option deleted successfully.",
  "data": null
}
```

---

# Customers

All customer endpoints require:

```
Authorization: Bearer <JWT_TOKEN>
```

Customer reads are available to `OWNER` and `MANAGER`. Customer deletion is
available to `OWNER` only. The backend derives `restaurantId` from the
authenticated user; it is never accepted from request bodies or query
parameters.

## Customer Object

Customer list and detail responses expose:

```json
{
  "id": "",
  "whatsappId": "",
  "name": null,
  "email": null,
  "address": null,
  "createdAt": "",
  "updatedAt": "",
  "lastOrderAt": null,
  "lifetimeSpend": "0.00",
  "totalOrders": 0
}
```

## Get Customers

GET

```
/customers?page=1&limit=20&search=92300
```

Search matches `name`, `whatsappId`, and `email` when present. Results are
restaurant-scoped and ordered by most recent order, then creation time.

Response

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

## Get Customer

GET

```
/customers/:id
```

Response

```json
{
  "success": true,
  "data": {
    "customer": {},
    "summary": {
      "pendingOrders": 0,
      "activeOrders": 0,
      "deliveredOrders": 0,
      "cancelledOrders": 0,
      "unpaidOrders": 0,
      "pendingVerificationOrders": 0,
      "paidOrders": 0,
      "averageOrderValue": "0.00"
    }
  }
}
```

The detail response does not embed order history.

`pendingOrders` counts orders with status `PENDING`. `activeOrders` counts
orders with status `ACCEPTED`, `PREPARING`, `READY`, or `OUT_FOR_DELIVERY` and
does not include pending orders.

## Create Customer

POST

```
/customers
```

Request

```json
{
  "whatsappId": "+923001234567",
  "name": "Ayesha Khan",
  "email": "ayesha@example.com",
  "address": "Lahore"
}
```

`whatsappId` and `name` are required. Blank nullable strings for `email` and
`address` are stored as `null`. Duplicate WhatsApp numbers within the same
restaurant return `409`.

## Update Customer

PATCH

```
/customers/:id
```

The request accepts any non-empty subset of `whatsappId`, `name`, `email`, and
`address`. Blank nullable strings are stored as `null`. `whatsappId` remains
unique within the restaurant.

## Get Customer Order History

GET

```
/customers/:id/orders?page=1&limit=20&status=DELIVERED&paymentStatus=PAID
```

The customer must belong to the authenticated user's restaurant before orders
are queried. Each order includes its `items`, each item's `menuItem`, and its
selected `options`.

Response

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

## Delete Customer

DELETE

```
/customers/:id
```

Deletion is `OWNER` only and is restaurant-scoped. Because the Prisma
relations use cascade deletes, deleting a customer also deletes related
orders, order items, messages, cart data, and conversation data. There is no
soft delete in this phase.

## Decimal Serialization

Prisma decimal fields such as `lifetimeSpend`, order totals, and
`averageOrderValue` are serialized as JSON decimal strings. Clients must
safely accept string values for monetary fields.

---

# Orders

## Get Orders

GET

```
/orders
```

Query Parameters

| Name   | Type        | Required |
| ------ | ----------- | -------- |
| page   | number      | No       |
| limit  | number      | No       |
| status | OrderStatus | No       |
| search | string      | No       |

Example

```
/orders?page=1&limit=20&status=PENDING&search=ORD-250805-A7F2
```

Response

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

## Get Order

GET

```
/orders/:id
```

Response

```json
{
  "success": true,
  "data": {}
}
```

---

## Update Order Status

PATCH

```
/orders/:id/status
```

Request

```json
{
  "status": "PREPARING"
}
```

For cancellation, send a reason of at least 3 characters:

```json
{
  "status": "CANCELLED",
  "cancellationReason": "Customer requested cancellation"
}
```

Response

```json
{
  "success": true,
  "message": "Order status updated successfully.",
  "data": {}
}
```

---

## Update Order Payment Status

PATCH

```
/orders/:id/payment-status
```

Authentication: required. Allowed roles: `OWNER`, `MANAGER`.

The order is scoped to the authenticated user's `restaurantId`; clients must
not send a restaurant ID.

Request

```json
{
  "paymentStatus": "PAID",
  "note": "Cash collected by rider"
}
```

Allowed transitions for this version:

- `UNPAID` -> `PAID`
- `PENDING_VERIFICATION` -> `PAID`

`PAID` is terminal. Transitions from `PAID` to another payment status are
rejected. Payment verification is independent of order status, including
`DELIVERED`.

The backend sets these audit fields; clients cannot provide them:

- `paymentVerifiedAt`: server timestamp
- `paymentVerifiedBy`: authenticated user ID
- `paymentVerificationNote`: trimmed optional note, maximum 500 characters

Response

```json
{
  "success": true,
  "message": "Payment status updated successfully.",
  "data": {}
}
```

Errors:

- `400` for invalid request data or unsupported target status
- `404` when the order is not found in the authenticated restaurant
- `409` when the payment is already verified or another update won the race

Analytics definitions are unchanged: `recognizedRevenue` continues to
include non-cancelled orders with `PAID` or `PENDING_VERIFICATION` payment
status and excludes `UNPAID` orders.

---

## Customer Orders

Deprecated. Use `GET /customers/:id/orders` for new clients. This route remains
for compatibility. With no query parameters it preserves the legacy response;
when `page`, `limit`, `status`, or `paymentStatus` is supplied, it returns the
paginated response contract below.

GET

```
/orders/customer/:customerId?page=1&limit=20&status=DELIVERED&paymentStatus=PAID
```

Response

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

When called without query parameters, the deprecated route preserves the
legacy response exactly:

```json
{
  "success": true,
  "data": []
}
```

---

# Pagination Contract

Every paginated endpoint must return

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

---

# Error Contract

Every API error returns

```json
{
  "success": false,
  "message": "Something went wrong.",
  "errors": null
}
```

Validation errors may include additional details inside the `errors` field.

---

# Authentication Header

Every authenticated request must include

```
Authorization: Bearer <JWT_TOKEN>
```

Axios automatically attaches the token.

Components must never manage tokens manually.

---

# Frontend Rules

Frontend components must never:

- Build API URLs manually
- Call Axios directly
- Parse JWT tokens
- Transform API contracts unnecessarily

Instead:

Component

↓

Hook

↓

Service

↓

Axios

↓

Backend

---

# Backend Rules

Backend is the source of truth.

The frontend must adapt to backend contracts.

Do not modify frontend models to compensate for backend inconsistencies.

Fix backend contracts instead.

---

# Versioning

Whenever an endpoint changes:

1. Update Backend
2. Update API_CONTRACTS.md
3. Update TypeScript types
4. Update services
5. Update hooks
6. Update UI if required

This document should always represent the current production API.

---

# Settings

Settings are scoped to the authenticated user's `restaurantId`. The API never
accepts a restaurant ID from the request body or URL for these endpoints.

## Get Settings

GET

```
/settings
```

Roles: `OWNER`, `MANAGER`

Response

```json
{
  "success": true,
  "data": {
    "restaurant": {
      "name": "Demo Restaurant",
      "description": null,
      "imageUrl": null,
      "address": "Pakistan",
      "phone": "+923001234567",
      "whatsappNumber": null,
      "email": "info@demo.com",
      "currency": "PKR",
      "taxRate": 0,
      "deliveryFee": 0,
      "openingTime": null,
      "closingTime": null,
      "isOpen": true
    },
    "orderConfig": {
      "freeDeliveryThreshold": 0,
      "minimumOrderAmount": 0,
      "estimatedPreparationTime": 30,
      "orderAcceptanceEnabled": true,
      "temporaryClosureMessage": null,
      "orderPrefix": "ORD",
      "autoAcceptOrders": false
    },
    "paymentMethods": {
      "codEnabled": true,
      "easypaisaEnabled": true,
      "easypaisaNumber": null,
      "jazzcashEnabled": true,
      "jazzcashNumber": null,
      "bankTransferEnabled": true,
      "bankName": null,
      "bankAccountTitle": null,
      "bankAccountNumber": null,
      "paymentInstructions": null
    },
    "receipt": {
      "receiptFooter": null
    },
    "notifications": {
      "statusNotificationsEnabled": true,
      "cancellationNotificationsEnabled": true
    },
    "localization": {
      "language": "en",
      "timezone": "Asia/Karachi",
      "currencySymbol": "Rs"
    },
    "ai": {
      "aiEnabled": true,
      "welcomeMessage": null,
      "orderConfirmation": null
    },
    "meta": {
      "metaPhoneNumberId": null,
      "metaDisplayPhone": null,
      "metaBusinessAccountId": null,
      "metaAccessToken": { "hasValue": false, "masked": null },
      "metaVerifyToken": { "hasValue": false, "masked": null },
      "webhookSecret": { "hasValue": false, "masked": null }
    }
  }
}
```

Payment account identifiers in this response are masked. A configured value is
returned as a suffix-preserving mask such as `••••••4567`; an unset value is
`null`. Meta credentials are also masked and expose only `hasValue` flags.

## Update Settings Sections

All endpoints below require `OWNER` or `MANAGER`, except where stated. Every
field is optional, omitted fields are preserved, and nullable fields can be
set to `null` to clear them. Each successful endpoint except Meta returns the
complete unified settings payload in `data` with the section-specific success
message. Meta returns only its safe masked status shape.

### Profile

PATCH

```
/settings/profile
```

```json
{
  "name": "Demo Restaurant",
  "description": "Fresh meals delivered locally.",
  "imageUrl": "https://example.com/logo.png",
  "address": "Pakistan",
  "phone": "+923001234567",
  "whatsappNumber": "+923001234567",
  "email": "info@demo.com",
  "currency": "PKR",
  "taxRate": 5,
  "deliveryFee": 150,
  "openingTime": "10:00",
  "closingTime": "23:00",
  "isOpen": true
}
```

### Order Configuration

PATCH

```
/settings/order-config
```

```json
{
  "freeDeliveryThreshold": 2500,
  "minimumOrderAmount": 500,
  "estimatedPreparationTime": 30,
  "orderAcceptanceEnabled": true,
  "temporaryClosureMessage": null,
  "orderPrefix": "ORD",
  "autoAcceptOrders": false
}
```

### Payment Methods

PATCH

```
/settings/payment-methods
```

```json
{
  "codEnabled": true,
  "easypaisaEnabled": true,
  "easypaisaNumber": "+923001234567",
  "jazzcashEnabled": false,
  "jazzcashNumber": null,
  "bankTransferEnabled": true,
  "bankName": "Example Bank",
  "bankAccountTitle": "Demo Restaurant",
  "bankAccountNumber": "00001234567890",
  "paymentInstructions": "Send the transfer receipt on WhatsApp."
}
```

Managers may update method toggles and `paymentInstructions`. Only owners may
write `easypaisaNumber`, `jazzcashNumber`, `bankName`, `bankAccountTitle`, or
`bankAccountNumber`.

At least one payment method must remain enabled. Masked payment identifiers
cannot be submitted back as values; omit them to preserve the stored value or
send `null` to clear them.

### Availability

PATCH

```
/settings/availability
```

```json
{
  "openingTime": "10:00",
  "closingTime": "23:00",
  "isOpen": true,
  "orderAcceptanceEnabled": true,
  "temporaryClosureMessage": null
}
```

Times use 24-hour `HH:mm` format.

Profile phone fields use international format (`+` followed by 8-15 digits).

### Receipt

PATCH

```
/settings/receipt
```

```json
{
  "receiptFooter": "Thank you for ordering with us."
}
```

### Notifications

PATCH

```
/settings/notifications
```

```json
{
  "statusNotificationsEnabled": true,
  "cancellationNotificationsEnabled": true
}
```

### Localization

PATCH

```
/settings/localization
```

```json
{
  "language": "en",
  "timezone": "Asia/Karachi",
  "currencySymbol": "Rs"
}
```

### AI

PATCH

```
/settings/ai
```

```json
{
  "aiEnabled": true,
  "welcomeMessage": "Welcome to Demo Restaurant.",
  "orderConfirmation": "Thank you for your order."
}
```

## Meta Configuration

PATCH

```
/settings/meta
```

Role: `OWNER` only

```json
{
  "metaPhoneNumberId": "123456789",
  "metaDisplayPhone": "+923001234567",
  "metaBusinessAccountId": "987654321",
  "metaAccessToken": "new-token",
  "metaVerifyToken": "new-verify-token",
  "webhookSecret": "new-webhook-secret"
}
```

Sensitive fields are write-only in the practical sense: omitted values are
preserved and `null` clears them. Empty strings are normalized to `null`.
Masked placeholders are rejected so they cannot overwrite stored credentials.
The response never contains raw values. The same masked Meta shape is included
in the unified GET response and returned by this PATCH endpoint:

```json
{
  "success": true,
  "message": "Meta settings updated successfully.",
  "data": {
    "metaPhoneNumberId": "123456789",
    "metaDisplayPhone": "+923001234567",
    "metaBusinessAccountId": "987654321",
    "metaAccessToken": { "hasValue": true, "masked": "••••••oken" },
    "metaVerifyToken": { "hasValue": true, "masked": "••••••oken" },
    "webhookSecret": { "hasValue": true, "masked": "••••••cret" }
  }
}
```

## Settings Errors

The settings endpoints use the common error contract. Validation errors return
HTTP `400` with `message: "Validation failed."` and Zod details in `errors`.
Missing authentication returns `401`, insufficient role or restricted fields
return `403`, and an unknown restaurant/settings record returns `404`. Monetary
fields reject negative values and blank strings; omitted fields are preserved
for partial PATCH requests.

## WhatsApp Checkout Settings Behavior

The WhatsApp checkout flow reads the restaurant-scoped operational settings
directly on the backend. It does not use the dashboard-facing masked settings
response.

- Only enabled and fully configured payment methods are shown.
- COD requires `codEnabled: true`.
- Easypaisa requires `easypaisaEnabled: true` and `easypaisaNumber`.
- JazzCash requires `jazzcashEnabled: true` and `jazzcashNumber`.
- Bank transfer requires `bankTransferEnabled: true`, `bankName`,
  `bankAccountTitle`, and `bankAccountNumber`.
- Disabled or misconfigured methods are rejected again during order creation.
- If no usable payment method exists, checkout stops without defaulting to COD.
- Non-COD payments remain `PENDING_VERIFICATION`; the existing manual
  verification process is preserved. No payment proof upload or automatic
  verification is performed.
- Checkout is rejected when `Restaurant.isOpen` or
  `RestaurantSettings.orderAcceptanceEnabled` is false.
- Checkout is rejected when the subtotal is below
  `RestaurantSettings.minimumOrderAmount`.
- Tax is calculated from `Restaurant.taxRate`.
- Delivery uses `Restaurant.deliveryFee` until the subtotal reaches
  `RestaurantSettings.freeDeliveryThreshold`. A threshold of `0` disables the
  free-delivery threshold.
- The order total is `subtotal + tax + deliveryFee`.
- `RestaurantSettings.orderPrefix` is normalized to an uppercase alphanumeric
  prefix (maximum 20 characters) and used in the human-readable order number
  format `<prefix>-YYMMDD-XXXX`, where `XXXX` is four uppercase hexadecimal
  characters. The database unique constraint and collision retry preserve
  uniqueness. `estimatedPreparationTime` is stored on the created order.
