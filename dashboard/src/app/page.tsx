import Link from "next/link";

import { FoodajiLogo } from "@/components/brand/FoodajiLogo";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="flex justify-center">
          <FoodajiLogo compact />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-foreground">
          Restaurant operations, in one place.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Manage WhatsApp orders, menu operations, customers, and analytics.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Open dashboard
        </Link>
      </section>
    </main>
  );
}
