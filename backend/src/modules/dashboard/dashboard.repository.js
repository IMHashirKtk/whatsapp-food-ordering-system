import prisma from "../../database/prisma.js";

const toNumber = (value) => Number(value ?? 0);
const toMoneyNumber = (value) => Number(toNumber(value).toFixed(2));
const DEFAULT_TIMEZONE = "Asia/Karachi";
const DEFAULT_ORDER_ACCEPTANCE_ENABLED = true;

export const getRestaurantContext = async (restaurantId) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: {
      id: restaurantId,
    },
    select: {
      name: true,
      isOpen: true,
      openingTime: true,
      closingTime: true,
      settings: {
        select: {
          timezone: true,
          orderAcceptanceEnabled: true,
        },
      },
    },
  });

  if (!restaurant) {
    return null;
  }

  const settings = restaurant.settings ?? {
    timezone: DEFAULT_TIMEZONE,
    orderAcceptanceEnabled: DEFAULT_ORDER_ACCEPTANCE_ENABLED,
  };

  return {
    name: restaurant.name,
    timezone: settings.timezone,
    isOpen: restaurant.isOpen,
    openingTime: restaurant.openingTime,
    closingTime: restaurant.closingTime,
    orderAcceptanceEnabled: settings.orderAcceptanceEnabled,
  };
};

export const getTodaySummary = async ({ restaurantId, startUtc, endUtc }) => {
  const [today, liveOrders, unavailableMenuItems, recentOrders] =
    await Promise.all([
      prisma.$queryRaw`
        SELECT
          COUNT(*)::int AS "orders",
          COUNT(*) FILTER (WHERE status <> 'CANCELLED')::int AS "nonCancelledOrders",
          COALESCE(
            SUM(total) FILTER (WHERE status <> 'CANCELLED'),
            0
          )::numeric AS "grossOrderValue",
          COALESCE(
            SUM(total) FILTER (
              WHERE status <> 'CANCELLED'
                AND "paymentStatus" IN ('PAID', 'PENDING_VERIFICATION')
            ),
            0
          )::numeric AS "recognizedRevenue",
          COUNT(*) FILTER (WHERE status = 'DELIVERED')::int AS "deliveredOrders",
          COUNT(*) FILTER (WHERE status = 'CANCELLED')::int AS "cancelledOrders"
        FROM "orders"
        WHERE "restaurantId" = ${restaurantId}
          AND "createdAt" >= ${startUtc}
          AND "createdAt" < ${endUtc};
      `,
      prisma.$queryRaw`
        SELECT
          COUNT(*) FILTER (WHERE status = 'PENDING')::int AS "pending",
          COUNT(*) FILTER (WHERE status = 'ACCEPTED')::int AS "accepted",
          COUNT(*) FILTER (WHERE status = 'PREPARING')::int AS "preparing",
          COUNT(*) FILTER (WHERE status = 'READY')::int AS "ready",
          COUNT(*) FILTER (WHERE status = 'OUT_FOR_DELIVERY')::int AS "outForDelivery",
          COUNT(*) FILTER (
            WHERE status IN ('ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY')
          )::int AS "active",
          COUNT(*) FILTER (
            WHERE "paymentStatus" = 'PENDING_VERIFICATION'
              AND status <> 'CANCELLED'
          )::int AS "pendingPaymentVerification"
        FROM "orders"
        WHERE "restaurantId" = ${restaurantId};
      `,
      prisma.menuItem.count({
        where: {
          restaurantId,
          isAvailable: false,
        },
      }),
      prisma.order.findMany({
        where: {
          restaurantId,
        },
        take: 10,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          paymentStatus: true,
          paymentMethod: true,
          createdAt: true,
          customer: {
            select: {
              id: true,
              name: true,
              whatsappId: true,
            },
          },
        },
      }),
    ]);

  const todaySummary = today[0] ?? {};
  const currentOrders = liveOrders[0] ?? {};

  return {
    today: {
      orders: toNumber(todaySummary.orders),
      nonCancelledOrders: toNumber(todaySummary.nonCancelledOrders),
      grossOrderValue: toMoneyNumber(todaySummary.grossOrderValue),
      recognizedRevenue: toMoneyNumber(todaySummary.recognizedRevenue),
      deliveredOrders: toNumber(todaySummary.deliveredOrders),
      cancelledOrders: toNumber(todaySummary.cancelledOrders),
    },
    liveOrders: {
      pending: toNumber(currentOrders.pending),
      accepted: toNumber(currentOrders.accepted),
      preparing: toNumber(currentOrders.preparing),
      ready: toNumber(currentOrders.ready),
      outForDelivery: toNumber(currentOrders.outForDelivery),
      active: toNumber(currentOrders.active),
    },
    signals: {
      pendingPaymentVerification: toNumber(
        currentOrders.pendingPaymentVerification,
      ),
      unavailableMenuItems,
    },
    recentOrders: recentOrders.map((order) => ({
      ...order,
      total: toMoneyNumber(order.total),
    })),
  };
};
