import { CheckCircle2, ChefHat, ClipboardCheck, Truck } from "lucide-react";

import { DashboardOrderStatus } from "../types";

type Props = {
  orderStatus: DashboardOrderStatus;
};

type StatusItemProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
};

function StatusItem({ label, value, icon }: StatusItemProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-slate-100 p-2">{icon}</div>

        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>

      <span className="text-lg font-bold">{value}</span>
    </div>
  );
}

export default function OrderStatusCard({ orderStatus }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Active Orders</h2>

        <p className="text-sm text-slate-500">Current order status overview</p>
      </div>

      <div className="space-y-3">
        <StatusItem
          label="Pending"
          value={orderStatus.pending}
          icon={<ClipboardCheck className="h-5 w-5 text-yellow-600" />}
        />

        <StatusItem
          label="Accepted"
          value={orderStatus.accepted}
          icon={<CheckCircle2 className="h-5 w-5 text-blue-600" />}
        />

        <StatusItem
          label="Preparing"
          value={orderStatus.preparing}
          icon={<ChefHat className="h-5 w-5 text-orange-600" />}
        />

        <StatusItem
          label="Ready"
          value={orderStatus.ready}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
        />

        <StatusItem
          label="Out for Delivery"
          value={orderStatus.outForDelivery}
          icon={<Truck className="h-5 w-5 text-purple-600" />}
        />
      </div>
    </div>
  );
}
