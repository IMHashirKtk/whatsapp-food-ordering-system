import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge";

export type PaymentStatusValue =
  | "PENDING_VERIFICATION"
  | "UNPAID"
  | "PAID";

const paymentTones: Record<PaymentStatusValue, StatusTone> = {
  PENDING_VERIFICATION: "warning",
  UNPAID: "danger",
  PAID: "success",
};

function formatPaymentStatus(status: PaymentStatusValue) {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

interface PaymentStatusBadgeProps {
  status: PaymentStatusValue;
  className?: string;
}

export function PaymentStatusBadge({
  status,
  className,
}: PaymentStatusBadgeProps) {
  return (
    <StatusBadge tone={paymentTones[status]} className={className}>
      {formatPaymentStatus(status)}
    </StatusBadge>
  );
}
