import Link from "next/link";
import { CheckCircle2, CreditCard, Utensils } from "lucide-react";

import type { DashboardSignals } from "../types";

type Props = {
  signals: DashboardSignals;
};

function SignalRow({
  label,
  value,
  href,
  icon,
  description,
}: {
  label: string;
  value: number;
  href: string;
  icon: React.ReactNode;
  description: string;
}) {
  const hasSignal = value > 0;

  return (
    <Link
      href={href}
      className={`flex items-start gap-3 rounded-md border p-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        hasSignal
          ? "border-warning/30 bg-warning/10 hover:border-warning/50"
          : "border-border bg-muted/50 hover:border-border/80"
      }`}
    >
      <div className="mt-0.5 shrink-0 text-warning">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium text-foreground">{label}</p>
          <span className="shrink-0 text-lg font-bold text-foreground">{value}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

export default function DashboardSignalsCard({ signals }: Props) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">Operational signals</h2>
        <p className="text-sm text-muted-foreground">Items that may need follow-up.</p>
      </div>

      <div className="space-y-3">
        <SignalRow
          label="Payments pending verification"
          value={signals.pendingPaymentVerification}
          href="/dashboard/orders"
          icon={<CreditCard className="h-5 w-5" />}
          description="Non-cancelled orders awaiting manual verification."
        />
        <SignalRow
          label="Unavailable menu items"
          value={signals.unavailableMenuItems}
          href="/dashboard/menu"
          icon={<Utensils className="h-5 w-5" />}
          description="Items currently hidden from ordering."
        />
      </div>

      {signals.pendingPaymentVerification === 0 && signals.unavailableMenuItems === 0 ? (
        <p className="mt-4 inline-flex items-center gap-2 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" />
          No operational issues need attention.
        </p>
      ) : null}
    </section>
  );
}
