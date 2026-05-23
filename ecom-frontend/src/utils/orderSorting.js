const ORDER_STATUS_PRIORITY = {
  PENDING: 0,
  CONFIRMED: 1,
  SHIPPED: 2,
  CANCELLED: 3,
  DELIVERED: 4,
};

const getOrderStatusPriority = (status) => {
  const normalizedStatus = String(status || "").toUpperCase();
  return ORDER_STATUS_PRIORITY[normalizedStatus] ?? 99;
};

const getOrderTimestamp = (order) => {
  const fallback = 0;
  if (!order?.orderDate) {
    return fallback;
  }

  const timestamp = new Date(order.orderDate).getTime();
  return Number.isNaN(timestamp) ? fallback : timestamp;
};

export const sortOrdersByWorkflowPriority = (orders = []) =>
  [...orders].sort((left, right) => {
    const statusDifference =
      getOrderStatusPriority(left?.orderStatus) - getOrderStatusPriority(right?.orderStatus);

    if (statusDifference !== 0) {
      return statusDifference;
    }

    const timeDifference = getOrderTimestamp(right) - getOrderTimestamp(left);
    if (timeDifference !== 0) {
      return timeDifference;
    }

    return Number(right?.orderId || 0) - Number(left?.orderId || 0);
  });
