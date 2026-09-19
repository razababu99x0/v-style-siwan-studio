import type { Metadata } from "next";
import { OrderLookup } from "@/components/site/OrderLookup";

export const metadata: Metadata = {
  title: "Track your order · V-STYLE Siwan",
  description: "Enter your V-STYLE Siwan order ID to see live status — packed, ready for pickup or out for delivery.",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="shell pb-24 pt-28 md:pt-36">
      <div className="mb-10 max-w-2xl">
        <p className="mb-4 flex items-center gap-2 text-2xs uppercase tracking-[0.28em] text-cyan">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan" /> Order tracking
        </p>
        <h1 className="display text-display-1 text-mist">
          Where&apos;s my <span className="kinetic">order</span>?
        </h1>
        <p className="mt-4 max-w-[46ch] text-lead text-mute">
          Paste the order ID from your confirmation screen. Status updates are made live from the store
          counter, so it&apos;s always current.
        </p>
      </div>

      <OrderLookup initialCode={params.code ?? ""} />
    </div>
  );
}
