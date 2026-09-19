import type { Metadata } from "next";
import Link from "next/link";
import { getProducts, getStoreStats, listOrders } from "@/server/catalog";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Store console · V-STYLE Siwan",
  description: "Owner view: live orders, inventory and revenue for the V-STYLE Siwan store.",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [orderRows, products, stats] = await Promise.all([listOrders(60), getProducts(), getStoreStats()]);

  const orders = orderRows.map((o) => ({
    orderCode: o.orderCode,
    customerName: o.customerName,
    phone: o.phone,
    city: o.city,
    fulfilment: o.fulfilment,
    paymentMethod: o.paymentMethod,
    status: o.status,
    total: o.total,
    items: o.items.map((i) => ({ name: i.name, qty: i.qty, size: i.size })),
    createdAt: o.createdAt.toISOString(),
  }));

  return (
    <div className="shell pb-24 pt-28 md:pt-36">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-4 flex items-center gap-2 text-2xs uppercase tracking-[0.28em] text-cyan">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan" /> Owner console
          </p>
          <h1 className="display text-display-2 text-mist">
            Store <span className="kinetic">console</span>
          </h1>
          <p className="mt-3 max-w-[52ch] text-sm text-mute">
            Live orders, inventory and revenue — everything the counter needs. Status changes here update the
            customer tracking page instantly.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/orders"
            className="rounded-full border border-line bg-white/[0.04] px-5 py-3 text-2xs font-bold uppercase tracking-[0.18em] text-mist hover:border-cyan/50"
          >
            Customer tracking
          </Link>
          <Link
            href="/shop"
            className="rounded-full bg-gold px-5 py-3 text-2xs font-bold uppercase tracking-[0.18em] text-ink shadow-glow-gold"
          >
            View storefront
          </Link>
        </div>
      </div>

      <p className="mb-6 rounded-2xl border border-gold/30 bg-gold/8 px-4 py-3 text-xs text-mute">
        <span className="text-gold">Demo console.</span> Unprotected on purpose for this concept build — add
        an auth gate before using it with real data.
      </p>

      <AdminDashboard
        initialOrders={orders}
        initialProducts={products.map((p) => ({
          slug: p.slug,
          name: p.name,
          category: p.category,
          price: p.price,
          mrp: p.mrp,
          stock: p.stock,
          images: p.images,
        }))}
        initialStats={stats}
      />
    </div>
  );
}
