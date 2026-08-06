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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <h3 className="mt-3 text-3xl font-bold text-slate-900">{value}</h3>

          {description && (
            <p className="mt-2 text-sm text-slate-500">{description}</p>
          )}
        </div>

        <div className="rounded-xl bg-emerald-50 p-3">
          <Icon className="h-6 w-6 text-emerald-600" />
        </div>
      </div>
    </div>
  );
}
