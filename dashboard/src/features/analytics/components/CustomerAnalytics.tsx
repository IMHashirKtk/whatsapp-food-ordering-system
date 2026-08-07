import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import ChartEmptyState from "@/components/charts/ChartEmptyState";
import ResponsiveChartContainer from "@/components/charts/ResponsiveChartContainer";
import ErrorState from "@/components/shared/ErrorState";
import Loading from "@/components/shared/Loading";

import type {
  AnalyticsCustomerRow,
  AnalyticsCustomers,
} from "../types";
import {
  formatNumber,
  formatPkr,
  getCustomerDisplayName,
} from "../utils/analyticsFormatters";

interface CustomerAnalyticsProps {
  data: AnalyticsCustomers | undefined;
  isLoading: boolean;
  isError: boolean;
}

const customerChartColors = ["var(--chart-2)", "var(--chart-4)"];

function CustomerTable({
  title,
  rows,
  primaryColumn,
}: {
  title: string;
  rows: AnalyticsCustomerRow[];
  primaryColumn: "spend" | "orders";
}) {
  return (
    <div className="min-w-0">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      {rows.length === 0 ? (
        <ChartEmptyState title="No customer data" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-3 font-semibold">Customer</th>
                <th className="px-3 py-3 font-semibold">Orders</th>
                <th className="px-3 py-3 font-semibold">Gross spend</th>
                <th className="px-3 py-3 font-semibold">Recognized spend</th>
                <th className="px-3 py-3 font-semibold">Ranking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.customerId}>
                  <td className="max-w-[180px] px-3 py-3 break-words">
                    <p className="font-medium text-foreground">
                      {getCustomerDisplayName(row.name, row.whatsappId)}
                    </p>
                    {row.name ? <p className="mt-1 text-xs text-muted-foreground">{row.whatsappId}</p> : null}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{formatNumber(row.orderCount)}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{formatPkr(row.grossSpend)}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{formatPkr(row.recognizedSpend)}</td>
                  <td className="px-3 py-3 font-medium text-foreground">
                    {primaryColumn === "spend" ? formatPkr(row.grossSpend) : `${formatNumber(row.orderCount)} orders`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function CustomerAnalytics({
  data,
  isLoading,
  isError,
}: CustomerAnalyticsProps) {
  const customerMix = data
    ? [
        { label: "New customers", value: data.newCustomers },
        { label: "Returning customers", value: data.returningCustomers },
      ]
    : [];
  const hasCustomerMix = customerMix.some((entry) => entry.value > 0);

  return (
    <section className="mt-6 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5" aria-labelledby="analytics-customers-heading">
      <div className="mb-4">
        <h2 id="analytics-customers-heading" className="text-lg font-semibold text-foreground">
          Customer analytics
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Customer mix and the highest-value customers in the selected range.
        </p>
      </div>

      {isLoading ? <Loading /> : null}
      {!isLoading && isError ? (
        <ErrorState title="Unable to load customer analytics" description="Please try again shortly." />
      ) : null}
      {!isLoading && !isError && data ? (
        <>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:items-center">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-foreground">New versus returning</h3>
              {hasCustomerMix ? (
                <ResponsiveChartContainer ariaLabel="New versus returning customers chart" className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customerMix}
                        dataKey="value"
                        nameKey="label"
                        innerRadius="52%"
                        outerRadius="76%"
                        paddingAngle={2}
                      >
                        {customerMix.map((entry, index) => (
                          <Cell key={entry.label} fill={customerChartColors[index]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatNumber(Number(value ?? 0)), "Customers"]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </ResponsiveChartContainer>
              ) : (
                <ChartEmptyState title="No customers in this range" />
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">New customers</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{formatNumber(data.newCustomers)}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Returning customers</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{formatNumber(data.returningCustomers)}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 border-t border-border pt-6 xl:grid-cols-2">
            <CustomerTable title="Top customers by spend" rows={data.topCustomersBySpend} primaryColumn="spend" />
            <CustomerTable title="Top customers by order count" rows={data.topCustomersByOrderCount} primaryColumn="orders" />
          </div>
        </>
      ) : null}
    </section>
  );
}
