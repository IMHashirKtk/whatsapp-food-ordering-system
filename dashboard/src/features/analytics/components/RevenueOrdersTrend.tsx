import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ErrorState from "@/components/shared/ErrorState";
import Loading from "@/components/shared/Loading";
import ResponsiveChartContainer from "@/components/charts/ResponsiveChartContainer";
import ChartEmptyState from "@/components/charts/ChartEmptyState";

import type { AnalyticsGroupBy, AnalyticsTrend } from "../types";
import {
  formatAnalyticsPeriod,
  formatNumber,
  formatPkr,
} from "../utils/analyticsFormatters";

interface RevenueOrdersTrendProps {
  data: AnalyticsTrend[] | undefined;
  isLoading: boolean;
  isError: boolean;
  timezone: string;
  groupBy: AnalyticsGroupBy;
}

export default function RevenueOrdersTrend({
  data,
  isLoading,
  isError,
  timezone,
  groupBy,
}: RevenueOrdersTrendProps) {
  const hasValues = data?.some(
    (point) =>
      point.recognizedRevenue > 0 ||
      point.grossOrderValue > 0 ||
      point.orders > 0 ||
      point.cancelledOrders > 0,
  );

  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-labelledby="analytics-trends-heading">
      <div className="mb-4">
        <h2 id="analytics-trends-heading" className="text-lg font-semibold text-slate-900">
          Revenue and order trends
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Revenue uses PKR; order series use the right axis.
        </p>
      </div>

      {isLoading ? <Loading /> : null}
      {!isLoading && isError ? (
        <ErrorState title="Unable to load trends" description="Please try again shortly." />
      ) : null}
      {!isLoading && !isError && (!data || !hasValues) ? <ChartEmptyState /> : null}
      {!isLoading && !isError && data && hasValues ? (
        <ResponsiveChartContainer ariaLabel="Revenue and orders trend chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 8 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="period"
                tickFormatter={(period: string) => formatAnalyticsPeriod(period, timezone, groupBy)}
                minTickGap={24}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              />
              <YAxis
                yAxisId="money"
                tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                width={42}
              />
              <YAxis
                yAxisId="count"
                orientation="right"
                allowDecimals={false}
                tickFormatter={formatNumber}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                width={34}
              />
              <Tooltip
                labelFormatter={(period) => formatAnalyticsPeriod(String(period), timezone, groupBy)}
                formatter={(value, name) => {
                  const label = String(name);
                  const numericValue = Number(value ?? 0);
                  const formatted = label.includes("Revenue") || label.includes("Value")
                    ? formatPkr(numericValue)
                    : formatNumber(numericValue);
                  return [formatted, label];
                }}
                contentStyle={{
                  borderRadius: "0.5rem",
                  borderColor: "var(--border)",
                  backgroundColor: "var(--card)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line yAxisId="money" type="monotone" dataKey="recognizedRevenue" name="Recognized revenue" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
              <Line yAxisId="money" type="monotone" dataKey="grossOrderValue" name="Gross order value" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
              <Line yAxisId="count" type="monotone" dataKey="orders" name="Orders" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
              <Line yAxisId="count" type="monotone" dataKey="cancelledOrders" name="Cancelled orders" stroke="var(--destructive)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ResponsiveChartContainer>
      ) : null}
    </section>
  );
}
