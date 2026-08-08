"use client";

import { forwardRef, useState } from "react";

import type { Order, OrderItem } from "../types";

interface OrderReceiptProps {
  order: Order;
  restaurantName?: string;
}

const formatCurrency = (value?: number | string | null): string => {
  if (value === null || value === undefined || value === "") {
    return "PKR 0.00";
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "PKR 0.00";
  }

  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (value?: string | null): string => {
  if (!value) {
    return "Not provided";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not provided";
  }

  return date.toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  });
};

const formatLabel = (value?: string | null): string => {
  if (!value) {
    return "Not provided";
  }

  return value.replace(/_/g, " ").toLowerCase();
};

function ReceiptMetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="receipt-meta-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function ReceiptItem({ item }: { item: OrderItem }) {
  const itemName = item.menuItem?.name ?? item.menuItemId;
  const options = item.options ?? [];

  return (
    <div className="receipt-item">
      <div className="receipt-item-row">
        <span className="receipt-item-name">{itemName}</span>
        <span className="receipt-item-quantity">x{item.quantity}</span>
        <span className="receipt-amount">
          {formatCurrency(item.totalPrice)}
        </span>
      </div>
      <div className="receipt-item-detail">
        Base price: {formatCurrency(item.basePrice)}
      </div>
      {options.length ? (
        <ul className="receipt-options">
          {options.map((option) => (
            <li key={option.id}>
              <span>{option.name}</span>
              <span>+{formatCurrency(option.extraPrice)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ReceiptTotalRow({
  label,
  value,
  grand = false,
}: {
  label: string;
  value: string;
  grand?: boolean;
}) {
  return (
    <div className={`receipt-total-row${grand ? " receipt-total-grand" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export const OrderReceipt = forwardRef<HTMLElement, OrderReceiptProps>(
  function OrderReceipt({ order, restaurantName = "FOODAJI" }, ref) {
    const [logoFailed, setLogoFailed] = useState(false);
    const customer = order.customer;
    const phone = customer?.whatsappId ?? customer?.phone ?? "Not provided";
    const address =
      order.deliveryAddress ?? customer?.address ?? "Not provided";

    return (
      <article ref={ref} className="print-receipt" aria-label="Order receipt">
        <header className="receipt-header">
          {logoFailed ? (
            <h1>{restaurantName}</h1>
          ) : (
            // A native image keeps loading and printing deterministic for the hidden receipt.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="receipt-logo"
              src="/images/receipt-logo.png"
              alt="Foodaji logo"
              width={600}
              height={250}
              onError={() => setLogoFailed(true)}
            />
          )}
          <p className="receipt-subtitle">ORDER RECEIPT</p>
        </header>

        <section className="receipt-section receipt-order-summary">
          <div className="receipt-order-number">#{order.orderNumber}</div>
          <div>{formatDate(order.createdAt)}</div>
        </section>

        <dl className="receipt-meta receipt-section">
          <ReceiptMetaRow
            label="Customer"
            value={customer?.name ?? "Not provided"}
          />
          <ReceiptMetaRow label="WhatsApp" value={phone} />
          <ReceiptMetaRow label="Address" value={address} />
        </dl>

        <section className="receipt-section">
          <h2>Items</h2>
          {order.items?.length ? (
            <div>
              {order.items.map((item) => (
                <ReceiptItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="receipt-muted">No items found.</p>
          )}
        </section>

        <section className="receipt-section receipt-totals">
          <ReceiptTotalRow
            label="Subtotal"
            value={formatCurrency(order.subtotal)}
          />
          <ReceiptTotalRow label="Tax" value={formatCurrency(order.tax)} />
          <ReceiptTotalRow
            label="Delivery fee"
            value={formatCurrency(order.deliveryFee)}
          />
          <ReceiptTotalRow
            label="Grand total"
            value={formatCurrency(order.total)}
            grand
          />
        </section>

        <dl className="receipt-meta receipt-section">
          <ReceiptMetaRow
            label="Payment"
            value={formatLabel(order.paymentMethod)}
          />
          <ReceiptMetaRow
            label="Payment status"
            value={formatLabel(order.paymentStatus)}
          />
          {order.paymentStatus === "PAID" && order.paymentVerifiedAt ? (
            <ReceiptMetaRow
              label="Payment verified"
              value={formatDate(order.paymentVerifiedAt)}
            />
          ) : null}
        </dl>

        {order.notes?.trim() ? (
          <section className="receipt-section receipt-note">
            <h2>Notes</h2>
            <p>{order.notes.trim()}</p>
          </section>
        ) : null}

        {order.cancellationReason?.trim() ? (
          <section className="receipt-section receipt-note">
            <h2>Cancellation reason</h2>
            <p>{order.cancellationReason.trim()}</p>
          </section>
        ) : null}

        <footer className="receipt-footer">
          Thank you for ordering from FOODAJI.
        </footer>
      </article>
    );
  },
);
