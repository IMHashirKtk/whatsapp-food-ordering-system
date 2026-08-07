"use client";

import ErrorState from "@/components/shared/ErrorState";
import Loading from "@/components/shared/Loading";
import PageHeader from "@/components/shared/PageHeader";
import DashboardOperationalHeader from "@/features/dashboard/components/DashboardOperationalHeader";
import DashboardSignalsCard from "@/features/dashboard/components/DashboardSignalsCard";
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
    return (
      <ErrorState
        title="Unable to load dashboard"
        description="The restaurant summary could not be loaded. Please try again shortly."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Keep today’s orders moving and your restaurant ready to receive them."
      />

      <DashboardOperationalHeader restaurant={data.restaurant} />

      <DashboardStats today={data.today} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
        <OrderStatusCard liveOrders={data.liveOrders} today={data.today} />
        <DashboardSignalsCard signals={data.signals} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
        <RecentOrdersCard
          orders={data.recentOrders}
          timezone={data.restaurant.timezone}
        />
        <QuickActionsCard />
      </div>
    </div>
  );
}
