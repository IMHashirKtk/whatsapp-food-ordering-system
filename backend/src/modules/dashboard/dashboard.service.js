import * as repository from "./dashboard.repository.js";

export const getDashboard = async () => {
  const stats = await repository.getStats();
  const recentOrders = await repository.getRecentOrders();

  return {
    stats,
    recentOrders,
  };
};
