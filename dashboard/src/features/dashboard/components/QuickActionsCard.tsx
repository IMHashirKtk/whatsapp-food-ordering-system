import { Plus, ShoppingBag, UtensilsCrossed } from "lucide-react";

const actions = [
  {
    title: "Add Menu Item",
    icon: Plus,
  },
  {
    title: "View Orders",
    icon: ShoppingBag,
  },
  {
    title: "Manage Categories",
    icon: UtensilsCrossed,
  },
];

export default function QuickActionsCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Quick Actions</h2>

      <div className="mt-6 space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              className="flex w-full items-center gap-3 rounded-xl border p-4 text-left transition hover:border-emerald-500 hover:bg-emerald-50"
            >
              <Icon className="h-5 w-5 text-emerald-600" />

              <span className="font-medium">{action.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
