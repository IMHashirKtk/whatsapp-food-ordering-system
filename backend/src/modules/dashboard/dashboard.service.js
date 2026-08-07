import AppError from "../../utils/AppError.js";
import * as analyticsRepository from "../analytics/analytics.repository.js";
import { resolveDateRangeForTimezone } from "../analytics/analytics.service.js";
import * as repository from "./dashboard.repository.js";

const calculateAverageOrderValue = (grossOrderValue, orderCount) => {
  if (orderCount === 0) {
    return 0;
  }

  return Number((grossOrderValue / orderCount).toFixed(2));
};

export const getSummary = async (restaurantId) => {
  const restaurant = await repository.getRestaurantContext(restaurantId);

  if (!restaurant) {
    throw new AppError("Restaurant settings not found.", 404);
  }

  const range = resolveDateRangeForTimezone(restaurant.timezone, {});
  const [summary, customerSummary] = await Promise.all([
    repository.getTodaySummary({
      restaurantId,
      startUtc: range.startUtc,
      endUtc: range.endUtc,
    }),
    analyticsRepository.getCustomerRangeClassification({
      restaurantId,
      startUtc: range.startUtc,
      endUtc: range.endUtc,
    }),
  ]);

  return {
    restaurant,
    today: {
      orders: summary.today.orders,
      grossOrderValue: summary.today.grossOrderValue,
      recognizedRevenue: summary.today.recognizedRevenue,
      averageOrderValue: calculateAverageOrderValue(
        summary.today.grossOrderValue,
        summary.today.nonCancelledOrders,
      ),
      deliveredOrders: summary.today.deliveredOrders,
      cancelledOrders: summary.today.cancelledOrders,
      newCustomers: customerSummary.newCustomers,
    },
    liveOrders: summary.liveOrders,
    signals: summary.signals,
    recentOrders: summary.recentOrders,
  };
};
