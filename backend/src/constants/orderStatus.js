export const ORDER_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  PREPARING: "PREPARING",
  READY: "READY",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

export const ORDER_STATUS_FLOW = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.ACCEPTED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.DELIVERED,
];

export const CANCELLABLE_ORDER_STATUSES = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.ACCEPTED,
];

const nextOrderStatus = new Map(
  ORDER_STATUS_FLOW.map((status, index) => [
    status,
    ORDER_STATUS_FLOW[index + 1] ?? null,
  ]),
);

export const getNextOrderStatus = (status) =>
  nextOrderStatus.get(status) ?? null;

export const canTransitionOrderStatus = (currentStatus, nextStatus) =>
  getNextOrderStatus(currentStatus) === nextStatus;

export const canCancelOrderStatus = (status) =>
  CANCELLABLE_ORDER_STATUSES.includes(status);
