interface ChartEmptyStateProps {
  title?: string;
  description?: string;
}

export default function ChartEmptyState({
  title = "No data for this range",
  description = "Try selecting a different date range.",
}: ChartEmptyStateProps) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-border bg-card p-6 text-center">
      <div className="max-w-sm">
        <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
