"use client";
import PageHeader from "@/components/shared/PageHeader";
import ErrorState from "@/components/shared/ErrorState";
import Loading from "@/components/shared/Loading";

import DashboardStats from "@/features/dashboard/components/DashboardStats";
import OrderStatusCard from "@/features/dashboard/components/OrderStatusCard";
import QuickActionsCard from "@/features/dashboard/components/QuickActionsCard";
import RecentOrdersCard from "@/features/dashboard/components/RecentOrdersCard";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !data) {
    return <ErrorState />;
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's what's happening today."
      />

      <DashboardStats stats={data.stats} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentOrdersCard orders={data.recentOrders} />
        </div>

        <div className="space-y-6">
          <OrderStatusCard orderStatus={data.orderStatus} />

          <QuickActionsCard />
        </div>
      </div>
    </>
  );
}
