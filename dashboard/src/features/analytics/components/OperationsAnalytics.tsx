import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartEmptyState from "@/components/charts/ChartEmptyState";
import ResponsiveChartContainer from "@/components/charts/ResponsiveChartContainer";
import ErrorState from "@/components/shared/ErrorState";
import Loading from "@/components/shared/Loading";

import type {
  AnalyticsOperations as AnalyticsOperationsData,
  AnalyticsOrderStatus,
  AnalyticsPaymentMethod,
  AnalyticsPaymentStatus,
} from "../types";
import {
  formatHour,
  formatLabel,
  formatNumber,
} from "../utils/analyticsFormatters";

interface OperationsAnalyticsProps {
  data: AnalyticsOperationsData | undefined;
  isLoading: boolean;
  isError: boolean;
}

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
  "var(--destructive)",
];

const orderStatuses: AnalyticsOrderStatus[] = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const paymentMethods: AnalyticsPaymentMethod[] = [
  "EASYPAISA",
  "JAZZCASH",
  "BANK_TRANSFER",
  "COD",
];

const paymentStatuses: AnalyticsPaymentStatus[] = [
  "PENDING_VERIFICATION",
  "UNPAID",
  "PAID",
];

interface DistributionEntry {
  label: string;
  orders: number;
}

function DistributionChart({
  title,
  entries,
}: {
  title: string;
  entries: DistributionEntry[];
}) {
  const chartData = entries.filter((entry) => entry.orders > 0);
  const total = entries.reduce((sum, entry) => sum + entry.orders, 0);

  return (
    <div className="min-w-0">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      {total === 0 ? (
        <ChartEmptyState title="No orders in this range" />
      ) : (
        <>
          <ResponsiveChartContainer ariaLabel={`${title} distribution chart`} className="h-[220px] sm:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="orders"
                  nameKey="label"
                  innerRadius="52%"
                  outerRadius="76%"
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={entry.label} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatNumber(Number(value ?? 0)), "Orders"]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </ResponsiveChartContainer>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {entries.map((entry) => (
              <div key={entry.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-muted-foreground">{entry.label}</span>
                <span className="shrink-0 font-medium text-foreground">{formatNumber(entry.orders)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function normalizeDistribution<T extends string>(
  values: T[],
  source: Array<{ key: T; orders: number }>,
) {
  const byKey = new Map(source.map((entry) => [entry.key, entry.orders]));

  return values.map((value) => ({
    label: formatLabel(value),
    orders: byKey.get(value) ?? 0,
  }));
}

export default function OperationsAnalytics({
  data,
  isLoading,
  isError,
}: OperationsAnalyticsProps) {
  const statusData = data
    ? normalizeDistribution(
        orderStatuses,
        data.orderStatusDistribution.map((entry) => ({
          key: entry.status,
          orders: entry.orders,
        })),
      )
    : [];
  const methodData = data
    ? normalizeDistribution(
        paymentMethods,
        data.paymentMethodDistribution.map((entry) => ({
          key: entry.paymentMethod,
          orders: entry.orders,
        })),
      )
    : [];
  const paymentStatusData = data
    ? normalizeDistribution(
        paymentStatuses,
        data.paymentStatusDistribution.map((entry) => ({
          key: entry.paymentStatus,
          orders: entry.orders,
        })),
      )
    : [];
  const peakHours = Array.from({ length: 24 }, (_, hour) => ({
    label: formatHour(hour),
    orders: data?.peakOrderingHours.find((entry) => entry.hour === hour)?.orders ?? 0,
  }));

  return (
    <section className="mt-6 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5" aria-labelledby="analytics-operations-heading">
      <div className="mb-4">
        <h2 id="analytics-operations-heading" className="text-lg font-semibold text-foreground">
          Operations analytics
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Order, payment, and restaurant-local ordering patterns.
        </p>
      </div>

      {isLoading ? <Loading /> : null}
      {!isLoading && isError ? (
        <ErrorState title="Unable to load operations analytics" description="Please try again shortly." />
      ) : null}
      {!isLoading && !isError && data ? (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <DistributionChart title="Order status" entries={statusData} />
            <DistributionChart title="Payment method" entries={methodData} />
            <DistributionChart title="Payment status" entries={paymentStatusData} />
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <h3 className="mb-1 text-sm font-semibold text-foreground">Peak ordering hours</h3>
            <p className="mb-3 text-sm text-muted-foreground">Hours are shown in restaurant local time.</p>
            <ResponsiveChartContainer ariaLabel="Peak ordering hours chart" className="h-[260px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHours} margin={{ top: 8, right: 4, left: 4, bottom: 24 }}>
                  <XAxis
                    dataKey="label"
                    interval={2}
                    angle={-35}
                    textAnchor="end"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                    height={48}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickFormatter={formatNumber}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    width={34}
                  />
                  <Tooltip formatter={(value) => [formatNumber(Number(value ?? 0)), "Orders"]} />
                  <Bar dataKey="orders" name="Orders" fill="var(--chart-3)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ResponsiveChartContainer>
          </div>
        </>
      ) : null}
    </section>
  );
}
