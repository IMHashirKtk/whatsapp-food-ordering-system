import { cn } from "@/lib/utils";

interface FoodajiLogoProps {
  compact?: boolean;
  className?: string;
}

export function FoodajiLogo({
  compact = false,
  className,
}: FoodajiLogoProps) {
  return (
    <span className={cn("flex min-w-0 flex-col", className)}>
      <span className="text-xl font-bold tracking-[-0.03em] text-primary">
        Foodaji
      </span>
      {!compact ? (
        <span className="truncate text-xs font-medium tracking-wide text-sidebar-foreground/60">
          Restaurant operations
        </span>
      ) : null}
    </span>
  );
}
