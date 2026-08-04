import { randomUUID } from "node:crypto";

const RESTAURANT_ROOM_PREFIX = "restaurant:";

let socketServer = null;

const logRealtimeEvent = (...args) => {
  if (process.env.NODE_ENV === "development") {
    console.debug("[Realtime]", ...args);
  }
};

export const getRestaurantRoom = (restaurantId) =>
  `${RESTAURANT_ROOM_PREFIX}${restaurantId}`;

export const setSocketServer = (server) => {
  socketServer = server;
};

const buildBaseOrderEventPayload = ({ orderId, orderNumber, status }) => {
  const payload = {
    eventId: randomUUID(),
    orderId,
    orderNumber,
    status,
    occurredAt: new Date().toISOString(),
  };

  return payload;
};

const normalizeUpdatedAt = (updatedAt) => {
  if (!updatedAt) {
    return undefined;
  }

  if (updatedAt instanceof Date) {
    return updatedAt.toISOString();
  }

  return String(updatedAt);
};

const buildOrderUpdatedEventPayload = ({
  orderId,
  orderNumber,
  status,
  updatedAt,
}) => {
  const payload = buildBaseOrderEventPayload({
    orderId,
    orderNumber,
    status,
  });

  const normalizedUpdatedAt = normalizeUpdatedAt(updatedAt);

  if (normalizedUpdatedAt) {
    payload.updatedAt = normalizedUpdatedAt;
  }

  return payload;
};

const normalizeTotal = (total) => {
  if (total === null || total === undefined) {
    return null;
  }

  return String(total);
};

const buildOrderCreatedEventPayload = ({
  orderId,
  orderNumber,
  status,
  customerName,
  customerWhatsappId,
  total,
}) => ({
  ...buildBaseOrderEventPayload({ orderId, orderNumber, status }),
  customerName: customerName ?? null,
  customerWhatsappId: customerWhatsappId ?? null,
  total: normalizeTotal(total),
});

const publish = (eventName, restaurantId, payload, buildPayload) => {
  if (!socketServer) {
    console.warn(
      `[Realtime] Socket server is not initialized; skipped ${eventName}.`,
    );
    return false;
  }

  if (!restaurantId) {
    console.warn(
      `[Realtime] Missing restaurantId; skipped ${eventName} publication.`,
    );
    return false;
  }

  try {
    const room = getRestaurantRoom(restaurantId);
    const eventPayload = buildPayload(payload);

    socketServer.to(room).emit(eventName, eventPayload);

    logRealtimeEvent("emitted", {
      eventName,
      room,
      eventId: eventPayload.eventId,
      recipientCount:
        socketServer.sockets?.adapter?.rooms?.get(room)?.size ?? 0,
    });

    return true;
  } catch (error) {
    console.error(`[Realtime] Failed to publish ${eventName}.`, {
      restaurantId,
      error,
    });

    return false;
  }
};

export const publishOrderCreated = (restaurantId, payload) =>
  publish(
    "order:created",
    restaurantId,
    payload,
    buildOrderCreatedEventPayload,
  );

export const publishOrderUpdated = (restaurantId, payload) =>
  publish(
    "order:updated",
    restaurantId,
    payload,
    buildOrderUpdatedEventPayload,
  );
