import { Prisma } from "@prisma/client";

import prisma from "../../database/prisma.js";

const RECOGNIZED_PAYMENT_STATUSES = ["PAID", "PENDING_VERIFICATION"];

const toNumber = (value) => Number(value ?? 0);

const categoryFilterSql = (categoryId) =>
  categoryId
    ? Prisma.sql`AND mi."categoryId" = ${categoryId}`
    : Prisma.empty;

export const getRestaurantTimezone = async (restaurantId) => {
  const settings = await prisma.restaurantSettings.findUnique({
    where: {
      restaurantId,
    },
    select: {
      timezone: true,
    },
  });

  return settings?.timezone ?? "Asia/Karachi";
};

export const getOverviewOrderSummary = async ({ restaurantId, startUtc, endUtc }) => {
  const where = {
    restaurantId,
    createdAt: {
      gte: startUtc,
      lt: endUtc,
    },
  };

  const [
    orders,
    cancelledOrders,
    nonCancelledOrders,
    grossOrderValue,
    recognizedRevenue,
  ] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.count({
      where: {
        ...where,
        status: "CANCELLED",
      },
    }),
    prisma.order.count({
      where: {
        ...where,
        status: {
          not: "CANCELLED",
        },
      },
    }),
    prisma.order.aggregate({
      where: {
        ...where,
        status: {
          not: "CANCELLED",
        },
      },
      _sum: {
        total: true,
      },
    }),
    prisma.order.aggregate({
      where: {
        ...where,
        status: {
          not: "CANCELLED",
        },
        paymentStatus: {
          in: RECOGNIZED_PAYMENT_STATUSES,
        },
      },
      _sum: {
        total: true,
      },
    }),
  ]);

  return {
    orders,
    cancelledOrders,
    nonCancelledOrders,
    grossOrderValue: toNumber(grossOrderValue._sum.total),
    recognizedRevenue: toNumber(recognizedRevenue._sum.total),
  };
};

export const getCustomerRangeClassification = async ({
  restaurantId,
  startUtc,
  endUtc,
}) => {
  const [summary] = await prisma.$queryRaw`
    WITH first_orders AS (
      SELECT
        o."customerId",
        MIN(o."createdAt") AS first_order_at
      FROM "orders" o
      WHERE o."restaurantId" = ${restaurantId}
      GROUP BY o."customerId"
    ),
    range_customers AS (
      SELECT DISTINCT o."customerId"
      FROM "orders" o
      WHERE o."restaurantId" = ${restaurantId}
        AND o."createdAt" >= ${startUtc}
        AND o."createdAt" < ${endUtc}
    )
    SELECT
      COUNT(*) FILTER (
        WHERE fo.first_order_at >= ${startUtc}
          AND fo.first_order_at < ${endUtc}
      )::int AS "newCustomers",
      COUNT(*) FILTER (
        WHERE fo.first_order_at < ${startUtc}
      )::int AS "returningCustomers"
    FROM range_customers rc
    INNER JOIN first_orders fo ON fo."customerId" = rc."customerId";
  `;

  return {
    newCustomers: toNumber(summary?.newCustomers),
    returningCustomers: toNumber(summary?.returningCustomers),
  };
};

export const getTrendBuckets = async ({
  restaurantId,
  startUtc,
  endUtc,
  from,
  to,
  timezone,
  groupBy,
}) => {
  const interval = {
    day: "1 day",
    week: "1 week",
    month: "1 month",
  }[groupBy];

  const rows = await prisma.$queryRaw`
    WITH buckets AS (
      SELECT generate_series(
        date_trunc(${groupBy}, ${from}::date)::date,
        date_trunc(${groupBy}, ${to}::date)::date,
        ${interval}::interval
      )::date AS period_start
    )
    SELECT
      to_char(b.period_start, 'YYYY-MM-DD') AS "period",
      COUNT(o.id)::int AS "orders",
      COUNT(o.id) FILTER (WHERE o.status = 'CANCELLED')::int AS "cancelledOrders",
      COALESCE(
        SUM(o.total) FILTER (WHERE o.status <> 'CANCELLED'),
        0
      )::numeric AS "grossOrderValue",
      COALESCE(
        SUM(o.total) FILTER (
          WHERE o.status <> 'CANCELLED'
            AND o."paymentStatus" IN ('PAID', 'PENDING_VERIFICATION')
        ),
        0
      )::numeric AS "recognizedRevenue",
      COUNT(o.id) FILTER (WHERE o.status <> 'CANCELLED')::int AS "nonCancelledOrders"
    FROM buckets b
    LEFT JOIN "orders" o
      ON date_trunc(
        ${groupBy},
        timezone(${timezone}, o."createdAt" AT TIME ZONE 'UTC')
      )::date = b.period_start
      AND o."restaurantId" = ${restaurantId}
      AND o."createdAt" >= ${startUtc}
      AND o."createdAt" < ${endUtc}
    GROUP BY b.period_start
    ORDER BY b.period_start ASC;
  `;

  return rows.map((row) => ({
    period: row.period,
    orders: toNumber(row.orders),
    cancelledOrders: toNumber(row.cancelledOrders),
    grossOrderValue: toNumber(row.grossOrderValue),
    recognizedRevenue: toNumber(row.recognizedRevenue),
    nonCancelledOrders: toNumber(row.nonCancelledOrders),
  }));
};

export const getProductAnalytics = async ({
  restaurantId,
  startUtc,
  endUtc,
  limit,
  categoryId,
}) => {
  const categoryWhere = categoryFilterSql(categoryId);

  const [topItems, topCategories] = await Promise.all([
    prisma.$queryRaw`
      SELECT
        oi."menuItemId" AS "menuItemId",
        COALESCE(mi.name, 'Deleted menu item') AS "name",
        COALESCE(SUM(oi.quantity), 0)::int AS "quantitySold",
        COALESCE(SUM(oi."totalPrice"), 0)::numeric AS "grossRevenue",
        COALESCE(
          SUM(oi."totalPrice") FILTER (
            WHERE o."paymentStatus" IN ('PAID', 'PENDING_VERIFICATION')
          ),
          0
        )::numeric AS "recognizedRevenue",
        COUNT(DISTINCT o.id)::int AS "orderCount"
      FROM "order_items" oi
      INNER JOIN "orders" o ON o.id = oi."orderId"
      LEFT JOIN "menu_items" mi
        ON mi.id = oi."menuItemId"
        AND mi."restaurantId" = o."restaurantId"
      WHERE o."restaurantId" = ${restaurantId}
        AND o."createdAt" >= ${startUtc}
        AND o."createdAt" < ${endUtc}
        AND o.status <> 'CANCELLED'
        ${categoryWhere}
      GROUP BY oi."menuItemId", mi.name
      ORDER BY
        "quantitySold" DESC,
        "grossRevenue" DESC,
        "name" ASC,
        "menuItemId" ASC
      LIMIT ${limit};
    `,
    prisma.$queryRaw`
      SELECT
        COALESCE(c.id, mi."categoryId", 'deleted-category') AS "categoryId",
        COALESCE(c.name, 'Deleted category') AS "name",
        COALESCE(SUM(oi.quantity), 0)::int AS "quantitySold",
        COALESCE(SUM(oi."totalPrice"), 0)::numeric AS "grossRevenue",
        COALESCE(
          SUM(oi."totalPrice") FILTER (
            WHERE o."paymentStatus" IN ('PAID', 'PENDING_VERIFICATION')
          ),
          0
        )::numeric AS "recognizedRevenue",
        COUNT(DISTINCT o.id)::int AS "orderCount"
      FROM "order_items" oi
      INNER JOIN "orders" o ON o.id = oi."orderId"
      LEFT JOIN "menu_items" mi
        ON mi.id = oi."menuItemId"
        AND mi."restaurantId" = o."restaurantId"
      LEFT JOIN "categories" c
        ON c.id = mi."categoryId"
        AND c."restaurantId" = o."restaurantId"
      WHERE o."restaurantId" = ${restaurantId}
        AND o."createdAt" >= ${startUtc}
        AND o."createdAt" < ${endUtc}
        AND o.status <> 'CANCELLED'
        ${categoryWhere}
      GROUP BY COALESCE(c.id, mi."categoryId", 'deleted-category'), c.name
      ORDER BY
        "quantitySold" DESC,
        "grossRevenue" DESC,
        "name" ASC,
        "categoryId" ASC
      LIMIT ${limit};
    `,
  ]);

  return {
    topItems: topItems.map((item) => ({
      menuItemId: item.menuItemId,
      name: item.name,
      quantitySold: toNumber(item.quantitySold),
      grossRevenue: toNumber(item.grossRevenue),
      recognizedRevenue: toNumber(item.recognizedRevenue),
      orderCount: toNumber(item.orderCount),
    })),
    topCategories: topCategories.map((category) => ({
      categoryId: category.categoryId,
      name: category.name,
      quantitySold: toNumber(category.quantitySold),
      grossRevenue: toNumber(category.grossRevenue),
      recognizedRevenue: toNumber(category.recognizedRevenue),
      orderCount: toNumber(category.orderCount),
    })),
  };
};

export const getOperationsAnalytics = async ({
  restaurantId,
  startUtc,
  endUtc,
  timezone,
}) => {
  const where = {
    restaurantId,
    createdAt: {
      gte: startUtc,
      lt: endUtc,
    },
  };

  const [
    orderStatusDistribution,
    paymentMethodDistribution,
    paymentStatusDistribution,
    peakOrderingHours,
  ] = await Promise.all([
    prisma.order.groupBy({
      by: ["status"],
      where,
      _count: {
        _all: true,
      },
    }),
    prisma.order.groupBy({
      by: ["paymentMethod"],
      where,
      _count: {
        _all: true,
      },
    }),
    prisma.order.groupBy({
      by: ["paymentStatus"],
      where,
      _count: {
        _all: true,
      },
    }),
    prisma.$queryRaw`
      WITH hours AS (
        SELECT generate_series(0, 23) AS hour
      )
      SELECT
        h.hour::int AS "hour",
        COUNT(o.id)::int AS "orders"
      FROM hours h
      LEFT JOIN "orders" o
        ON EXTRACT(
          HOUR FROM timezone(${timezone}, o."createdAt" AT TIME ZONE 'UTC')
        )::int = h.hour
        AND o."restaurantId" = ${restaurantId}
        AND o."createdAt" >= ${startUtc}
        AND o."createdAt" < ${endUtc}
      GROUP BY h.hour
      ORDER BY h.hour ASC;
    `,
  ]);

  return {
    orderStatusDistribution,
    paymentMethodDistribution,
    paymentStatusDistribution,
    peakOrderingHours,
  };
};

export const getCustomerAnalytics = async ({
  restaurantId,
  startUtc,
  endUtc,
  limit,
}) => {
  const [classification, topCustomersBySpend, topCustomersByOrderCount] =
    await Promise.all([
      getCustomerRangeClassification({
        restaurantId,
        startUtc,
        endUtc,
      }),
      prisma.$queryRaw`
        SELECT
          c.id AS "customerId",
          c.name AS "name",
          c."whatsappId" AS "whatsappId",
          COUNT(o.id)::int AS "orderCount",
          COALESCE(
            SUM(o.total) FILTER (WHERE o.status <> 'CANCELLED'),
            0
          )::numeric AS "grossSpend",
          COALESCE(
            SUM(o.total) FILTER (
              WHERE o.status <> 'CANCELLED'
                AND o."paymentStatus" IN ('PAID', 'PENDING_VERIFICATION')
            ),
            0
          )::numeric AS "recognizedSpend"
        FROM "orders" o
        INNER JOIN "Customer" c
          ON c.id = o."customerId"
          AND c."restaurantId" = o."restaurantId"
        WHERE o."restaurantId" = ${restaurantId}
          AND o."createdAt" >= ${startUtc}
          AND o."createdAt" < ${endUtc}
        GROUP BY c.id, c.name, c."whatsappId"
        ORDER BY
          "grossSpend" DESC,
          "recognizedSpend" DESC,
          "orderCount" DESC,
          "customerId" ASC
        LIMIT ${limit};
      `,
      prisma.$queryRaw`
        SELECT
          c.id AS "customerId",
          c.name AS "name",
          c."whatsappId" AS "whatsappId",
          COUNT(o.id)::int AS "orderCount",
          COALESCE(
            SUM(o.total) FILTER (WHERE o.status <> 'CANCELLED'),
            0
          )::numeric AS "grossSpend",
          COALESCE(
            SUM(o.total) FILTER (
              WHERE o.status <> 'CANCELLED'
                AND o."paymentStatus" IN ('PAID', 'PENDING_VERIFICATION')
            ),
            0
          )::numeric AS "recognizedSpend"
        FROM "orders" o
        INNER JOIN "Customer" c
          ON c.id = o."customerId"
          AND c."restaurantId" = o."restaurantId"
        WHERE o."restaurantId" = ${restaurantId}
          AND o."createdAt" >= ${startUtc}
          AND o."createdAt" < ${endUtc}
        GROUP BY c.id, c.name, c."whatsappId"
        ORDER BY
          "orderCount" DESC,
          "grossSpend" DESC,
          "recognizedSpend" DESC,
          "customerId" ASC
        LIMIT ${limit};
      `,
    ]);

  const normalizeCustomer = (customer) => ({
    customerId: customer.customerId,
    name: customer.name,
    whatsappId: customer.whatsappId,
    orderCount: toNumber(customer.orderCount),
    grossSpend: toNumber(customer.grossSpend),
    recognizedSpend: toNumber(customer.recognizedSpend),
  });

  return {
    ...classification,
    topCustomersBySpend: topCustomersBySpend.map(normalizeCustomer),
    topCustomersByOrderCount: topCustomersByOrderCount.map(normalizeCustomer),
  };
};
