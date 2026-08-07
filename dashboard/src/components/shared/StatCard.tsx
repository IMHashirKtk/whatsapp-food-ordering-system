import { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>

          <h3 className="mt-3 text-3xl font-bold text-card-foreground">{value}</h3>

          {description && (
            <p className="mt-2 text-sm leading-5 text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        <div className="rounded-lg bg-primary-soft p-3">
          <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
