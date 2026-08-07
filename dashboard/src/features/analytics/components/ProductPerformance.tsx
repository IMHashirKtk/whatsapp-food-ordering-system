import ChartEmptyState from "@/components/charts/ChartEmptyState";
import ErrorState from "@/components/shared/ErrorState";
import Loading from "@/components/shared/Loading";

import type {
  AnalyticsCategoryRow,
  AnalyticsProductRow,
  AnalyticsProducts,
} from "../types";
import {
  formatNumber,
  formatPkr,
} from "../utils/analyticsFormatters";

interface ProductPerformanceProps {
  data: AnalyticsProducts | undefined;
  isLoading: boolean;
  isError: boolean;
}

const getContribution = (
  value: number,
  rows: Array<AnalyticsProductRow | AnalyticsCategoryRow>,
) => {
  const total = rows.reduce((sum, row) => sum + row.grossRevenue, 0);
  return total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "0.0%";
};

function RankingTable({
  title,
  rows,
  entityLabel,
}: {
  title: string;
  rows: Array<AnalyticsProductRow | AnalyticsCategoryRow>;
  entityLabel: string;
}) {
  return (
    <div className="min-w-0">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      {rows.length === 0 ? (
        <ChartEmptyState title={`No ${entityLabel} data`} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-3 font-semibold">Name</th>
                <th className="px-3 py-3 font-semibold">Quantity sold</th>
                <th className="px-3 py-3 font-semibold">Orders</th>
                <th className="px-3 py-3 font-semibold">Gross revenue</th>
                <th className="px-3 py-3 font-semibold">Recognized revenue</th>
                <th className="px-3 py-3 font-semibold">Listed gross share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={"menuItemId" in row ? row.menuItemId : row.categoryId}>
                  <td className="max-w-[180px] px-3 py-3 font-medium text-foreground break-words">
                    {row.name}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{formatNumber(row.quantitySold)}</td>
                  <td className="px-3 py-3 text-muted-foreground">{formatNumber(row.orderCount)}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{formatPkr(row.grossRevenue)}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{formatPkr(row.recognizedRevenue)}</td>
                  <td className="px-3 py-3 text-muted-foreground">{getContribution(row.grossRevenue, rows)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ProductPerformance({
  data,
  isLoading,
  isError,
}: ProductPerformanceProps) {
  return (
    <section className="mt-6 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5" aria-labelledby="analytics-products-heading">
      <div className="mb-4">
        <h2 id="analytics-products-heading" className="text-lg font-semibold text-foreground">
          Product performance
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Revenue and order contribution for the highest-performing entities.
        </p>
      </div>

      {isLoading ? <Loading /> : null}
      {!isLoading && isError ? (
        <ErrorState title="Unable to load product analytics" description="Please try again shortly." />
      ) : null}
      {!isLoading && !isError && data ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <RankingTable title="Top items" rows={data.topItems} entityLabel="item" />
          <RankingTable title="Top categories" rows={data.topCategories} entityLabel="category" />
        </div>
      ) : null}
    </section>
  );
}
