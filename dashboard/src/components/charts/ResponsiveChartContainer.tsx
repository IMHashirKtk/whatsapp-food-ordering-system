import type { ReactNode } from "react";

interface ResponsiveChartContainerProps {
  children: ReactNode;
  ariaLabel: string;
  className?: string;
}

export default function ResponsiveChartContainer({
  children,
  ariaLabel,
  className = "",
}: ResponsiveChartContainerProps) {
  return (
    <div
      aria-label={ariaLabel}
      className={`h-[280px] min-w-0 w-full sm:h-[340px] lg:h-[380px] ${className}`}
      role="img"
    >
      {children}
    </div>
  );
}
