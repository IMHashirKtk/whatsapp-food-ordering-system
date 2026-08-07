import { cn } from "@/lib/utils";
import { OrderStatus } from "../types";

export type OrderStatusFilter = OrderStatus | "ALL";

interface OrderFiltersProps {
  status: OrderStatusFilter;
  onStatusChange: (value: OrderStatusFilter) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  className?: string;
  searchPlaceholder?: string;
}

const statusOptions: Array<{ value: OrderStatusFilter; label: string }> = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY", label: "Ready" },
  { value: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function OrderFilters({
  status,
  onStatusChange,
  searchValue,
  onSearchChange,
  className,
  searchPlaceholder = "Search by order number, customer, or WhatsApp number",
}: OrderFiltersProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-border bg-card p-4 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-2">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="order-search"
        >
          Search
        </label>
        <input
          id="order-search"
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground outline-none transition focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/20"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="order-status"
        >
          Status
        </label>
        <select
          id="order-status"
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as OrderStatusFilter)
          }
          className="min-w-45 rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground outline-none transition focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/20"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2 md:min-w-55">
        <span className="text-sm font-medium text-foreground">Date filters</span>
        <div className="rounded-md border border-dashed border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          Coming soon
        </div>
      </div>
    </div>
  );
}
