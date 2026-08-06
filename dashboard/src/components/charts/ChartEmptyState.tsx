interface ChartEmptyStateProps {
  title?: string;
  description?: string;
}

export default function ChartEmptyState({
  title = "No data for this range",
  description = "Try selecting a different date range.",
}: ChartEmptyStateProps) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
      <div className="max-w-sm">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}
