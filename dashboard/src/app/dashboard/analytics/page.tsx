"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import ErrorState from "@/components/shared/ErrorState";
import Loading from "@/components/shared/Loading";
import PageHeader from "@/components/shared/PageHeader";
import { useSettings } from "@/features/settings/hooks/useSettings";
import { useAnalyticsCustomers } from "@/features/analytics/hooks/useAnalyticsCustomers";
import { useAnalyticsOperations } from "@/features/analytics/hooks/useAnalyticsOperations";
import { useAnalyticsOverview } from "@/features/analytics/hooks/useAnalyticsOverview";
import { useAnalyticsProducts } from "@/features/analytics/hooks/useAnalyticsProducts";
import { useAnalyticsTrends } from "@/features/analytics/hooks/useAnalyticsTrends";
import AnalyticsFilters from "@/features/analytics/components/AnalyticsFilters";
import CustomerAnalytics from "@/features/analytics/components/CustomerAnalytics";
import OperationsAnalytics from "@/features/analytics/components/OperationsAnalytics";
import AnalyticsOverviewCards from "@/features/analytics/components/AnalyticsOverviewCards";
import ProductPerformance from "@/features/analytics/components/ProductPerformance";
import RevenueOrdersTrend from "@/features/analytics/components/RevenueOrdersTrend";
import type { AnalyticsFilterState } from "@/features/analytics/types";
import {
  createDefaultFilterState,
  DEFAULT_ANALYTICS_TIMEZONE,
} from "@/features/analytics/utils/analyticsFormatters";

export default function AnalyticsPage() {
  const settingsQuery = useSettings();
  const timezone =
    settingsQuery.data?.localization.timezone ?? DEFAULT_ANALYTICS_TIMEZONE;
  const [filters, setFilters] = useState<AnalyticsFilterState>(() =>
    createDefaultFilterState(DEFAULT_ANALYTICS_TIMEZONE),
  );
  const hasAppliedFilters = useRef(false);

  useEffect(() => {
    if (!settingsQuery.data?.localization.timezone || hasAppliedFilters.current) {
      return;
    }

    setFilters(createDefaultFilterState(settingsQuery.data.localization.timezone));
  }, [settingsQuery.data?.localization.timezone]);

  const handleApplyFilters = useCallback((nextFilters: AnalyticsFilterState) => {
    hasAppliedFilters.current = true;
    setFilters(nextFilters);
  }, []);

  const analyticsEnabled = true;
  const dateRange = filters
    ? { from: filters.from, to: filters.to }
    : undefined;
  const trendsParams = {
    ...dateRange,
    groupBy: filters?.groupBy ?? "day",
  } as const;

  const overviewQuery = useAnalyticsOverview(dateRange, analyticsEnabled);
  const trendsQuery = useAnalyticsTrends(trendsParams, analyticsEnabled);
  const productsQuery = useAnalyticsProducts(
    filters ? { ...dateRange, limit: 10 } : undefined,
    analyticsEnabled,
  );
  const operationsQuery = useAnalyticsOperations(dateRange, analyticsEnabled);
  const customersQuery = useAnalyticsCustomers(
    filters ? { ...dateRange, limit: 10 } : undefined,
    analyticsEnabled,
  );

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Understand revenue, orders, operations, and customer behavior."
      />

      <AnalyticsFilters
        timezone={timezone}
        value={filters}
        onApply={handleApplyFilters}
      />

      {overviewQuery.isLoading ? <Loading /> : null}
      {!overviewQuery.isLoading && overviewQuery.isError ? (
        <ErrorState
          title="Unable to load overview"
          description="The overview metrics could not be loaded. Other analytics sections remain available."
        />
      ) : null}
      {!overviewQuery.isLoading && !overviewQuery.isError && overviewQuery.data ? (
        <AnalyticsOverviewCards data={overviewQuery.data} />
      ) : null}

      <RevenueOrdersTrend
        data={trendsQuery.data}
        isLoading={trendsQuery.isLoading}
        isError={trendsQuery.isError}
        timezone={timezone}
        groupBy={filters.groupBy}
      />
      <ProductPerformance
        data={productsQuery.data}
        isLoading={productsQuery.isLoading}
        isError={productsQuery.isError}
      />
      <OperationsAnalytics
        data={operationsQuery.data}
        isLoading={operationsQuery.isLoading}
        isError={operationsQuery.isError}
      />
      <CustomerAnalytics
        data={customersQuery.data}
        isLoading={customersQuery.isLoading}
        isError={customersQuery.isError}
      />
    </>
  );
}
