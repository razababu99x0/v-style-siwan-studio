"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  Boxes,
  Check,
  IndianRupee,
  Loader2,
  Package,
  RefreshCw,
  Store,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { ORDER_STATUSES, ORDER_STATUS_META, type OrderStatus } from "@/lib/catalog";
import { cn, inrFormat } from "@/lib/utils";
import { SPRING, fadeUp, staggerParent } from "@/lib/motion";

type OrderRowView = {
  orderCode: string;
  customerName: string;
  phone: string;
  city: string;
  fulfilment: string;
  paymentMethod: string;
  status: string;
  total: number;
  items: { name: string; qty: number; size: string }[];
  createdAt: string;
};

type ProductView = {
  slug: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  stock: number;
  images: string[];
};

type Stats = {
  orderCount: number;
  revenue: number;
  avgOrderValue: number;
  subscriberCount: number;
  productCount: number;
  unitsSold: number;
  pickupShare: number;
  statusBreakdown: Record<string, number>;
  topCategories: { category: string; units: number; revenue: number }[];
};

type Tab = "overview" | "orders" | "inventory";

export function AdminDashboard({
  initialOrders,
  initialProducts,
  initialStats,
}: {
  initialOrders: OrderRowView[];
  initialProducts: ProductView[];
  initialStats: Stats;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState(initialOrders);
  const [products, setProducts] = useState(initialProducts);
  const [stats, setStats] = useState(initialStats);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2400);
  };

  const refresh = async () => {
    setBusy("refresh");
    try {
      const [o, p, s] = await Promise.all([
        fetch("/api/admin/orders").then((r) => r.json()),
        fetch("/api/admin/products").then((r) => r.json()),
        fetch("/api/admin/stats").then((r) => r.json()),
      ]);
      if (o.ok) setOrders(o.orders as OrderRowView[]);
      if (p.ok) setProducts(p.products as ProductView[]);
      if (s.ok) setStats(s.stats as Stats);
      flash("Data refreshed");
    } finally {
      setBusy(null);
    }
  };

  const updateStatus = async (code: string, status: OrderStatus) => {
    setBusy(code);
    const previous = orders;
    setOrders((rows) => rows.map((r) => (r.orderCode === code ? { ...r, status } : r)));
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, status }),
      });
      if (!res.ok) throw new Error();
      flash(`${code} → ${ORDER_STATUS_META[status].label}`);
      void refreshStats();
    } catch {
      setOrders(previous);
      flash("Could not update status");
    } finally {
      setBusy(null);
    }
  };

  const updateStock = async (slug: string, stock: number) => {
    setBusy(slug);
    const previous = products;
    setProducts((rows) => rows.map((r) => (r.slug === slug ? { ...r, stock } : r)));
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, stock }),
      });
      if (!res.ok) throw new Error();
      flash("Stock saved");
    } catch {
      setProducts(previous);
      flash("Could not save stock");
    } finally {
      setBusy(null);
    }
  };

  const refreshStats = async () => {
    try {
      const s = await fetch("/api/admin/stats").then((r) => r.json());
      if (s.ok) setStats(s.stats as Stats);
    } catch {
      /* ignore */
    }
  };

  const maxCatRevenue = Math.max(1, ...stats.topCategories.map((c) => c.revenue));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {(
            [
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "orders", label: `Orders (${orders.length})`, icon: Package },
              { id: "inventory", label: "Inventory", icon: Boxes },
            ] as { id: Tab; label: string; icon: typeof Package }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative flex items-center gap-2 rounded-full border px-4 py-2.5 text-2xs font-bold uppercase tracking-[0.16em] transition-colors",
                tab === t.id ? "border-transparent text-ink" : "border-line text-mute hover:text-mist",
              )}
            >
              {tab === t.id && (
                <motion.span
                  layoutId="admin-tab"
                  transition={{ ...SPRING, damping: 24 }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-gold to-gold-soft"
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={refresh}
          disabled={busy === "refresh"}
          className="flex items-center gap-2 rounded-full border border-line bg-white/[0.04] px-4 py-2.5 text-2xs uppercase tracking-[0.16em] text-mist disabled:opacity-60"
        >
          <RefreshCw className={cn("h-3.5 w-3.5 text-cyan", busy === "refresh" && "animate-spin")} />
          Refresh
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === "overview" && (
          <motion.div
            key="overview"
            variants={staggerParent(0.05)}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -10, transition: { duration: 0.16 } }}
            className="space-y-4"
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Kpi
                icon={IndianRupee}
                label="Revenue"
                value={inrFormat(stats.revenue)}
                note={`${stats.orderCount} orders total`}
                tone="gold"
              />
              <Kpi
                icon={TrendingUp}
                label="Avg order value"
                value={inrFormat(stats.avgOrderValue)}
                note={`${stats.unitsSold} units sold`}
                tone="cyan"
              />
              <Kpi
                icon={Store}
                label="Pickup share"
                value={`${stats.pickupShare}%`}
                note="rest choose delivery"
                tone="pink"
              />
              <Kpi
                icon={Users}
                label="Drop alerts"
                value={String(stats.subscriberCount)}
                note={`${stats.productCount} live styles`}
                tone="cyan"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <motion.div variants={fadeUp} className="glass rounded-[1.75rem] p-6">
                <h3 className="display text-sm tracking-[0.16em]">Revenue by aisle</h3>
                {stats.topCategories.length === 0 ? (
                  <p className="mt-6 text-sm text-mute">
                    No sales recorded yet — place a test order from the storefront to see this fill up.
                  </p>
                ) : (
                  <ul className="mt-5 space-y-4">
                    {stats.topCategories.map((c, i) => (
                      <li key={c.category}>
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="font-semibold uppercase tracking-[0.14em] text-mist">
                            {c.category}
                          </span>
                          <span className="text-mute">
                            {c.units} units · {inrFormat(c.revenue)}
                          </span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: c.revenue / maxCatRevenue }}
                            transition={{ duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full origin-left rounded-full"
                            style={{
                              background:
                                i % 3 === 0
                                  ? "linear-gradient(90deg,#FF2E63,#FF6B8F)"
                                  : i % 3 === 1
                                    ? "linear-gradient(90deg,#08D9D6,#6BF3F1)"
                                    : "linear-gradient(90deg,#FFC947,#FFE0A3)",
                            }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>

              <motion.div variants={fadeUp} className="glass rounded-[1.75rem] p-6">
                <h3 className="display text-sm tracking-[0.16em]">Order pipeline</h3>
                <ul className="mt-5 space-y-3">
                  {ORDER_STATUSES.map((s) => {
                    const count = stats.statusBreakdown[s] ?? 0;
                    const pct = stats.orderCount ? Math.round((count / stats.orderCount) * 100) : 0;
                    return (
                      <li key={s} className="flex items-center gap-3">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: ORDER_STATUS_META[s].color }}
                        />
                        <span className="flex-1 text-xs uppercase tracking-[0.14em] text-mute">
                          {ORDER_STATUS_META[s].label}
                        </span>
                        <span className="text-xs tabular-nums text-mist">
                          {count} · {pct}%
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            </div>
          </motion.div>
        )}

        {tab === "orders" && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.16 } }}
            className="glass overflow-hidden rounded-[1.75rem]"
          >
            {orders.length === 0 ? (
              <p className="p-10 text-center text-sm text-mute">
                No orders yet. Place one from the storefront and it lands here instantly.
              </p>
            ) : (
              <div data-lenis-prevent className="overflow-x-auto">
                <table className="w-full min-w-[46rem] text-left text-xs">
                  <thead className="bg-white/[0.05] text-2xs uppercase tracking-[0.14em] text-mute">
                    <tr>
                      <th className="px-4 py-3.5">Order</th>
                      <th className="px-4 py-3.5">Customer</th>
                      <th className="px-4 py-3.5">Items</th>
                      <th className="px-4 py-3.5">Fulfilment</th>
                      <th className="px-4 py-3.5">Total</th>
                      <th className="px-4 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8">
                    {orders.map((o) => (
                      <tr key={o.orderCode} className="transition-colors hover:bg-white/[0.03]">
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-mist">{o.orderCode}</p>
                          <p className="text-[0.65rem] text-mute">
                            {new Date(o.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-mist">{o.customerName}</p>
                          <p className="text-[0.65rem] text-mute">
                            {o.phone} · {o.city}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-mute">
                          {o.items.map((i) => `${i.name} (${i.size}) ×${i.qty}`).join(", ")}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={cn(
                              "flex items-center gap-1.5",
                              o.fulfilment === "pickup" ? "text-cyan" : "text-gold",
                            )}
                          >
                            {o.fulfilment === "pickup" ? (
                              <Store className="h-3.5 w-3.5" />
                            ) : (
                              <Truck className="h-3.5 w-3.5" />
                            )}
                            {o.fulfilment}
                          </span>
                          <p className="mt-0.5 text-[0.65rem] text-mute">{o.paymentMethod}</p>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-gold">{inrFormat(o.total)}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={o.status}
                              disabled={busy === o.orderCode}
                              onChange={(e) => void updateStatus(o.orderCode, e.target.value as OrderStatus)}
                              className="rounded-lg border border-line bg-ink px-2 py-1.5 text-[0.68rem] uppercase tracking-[0.1em] text-mist outline-none focus:border-cyan/60"
                            >
                              {ORDER_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {ORDER_STATUS_META[s].label}
                                </option>
                              ))}
                            </select>
                            {busy === o.orderCode && (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {tab === "inventory" && (
          <motion.div
            key="inventory"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.16 } }}
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
          >
            {products.map((p) => (
              <StockCard
                key={p.slug}
                product={p}
                busy={busy === p.slug}
                onSave={(stock) => void updateStock(p.slug, stock)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={SPRING}
            className="glass-strong fixed bottom-24 right-4 z-[110] flex items-center gap-2 rounded-full px-4 py-3 text-xs text-mist shadow-panel lg:bottom-6"
          >
            <Check className="h-3.5 w-3.5 text-cyan" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  note: string;
  tone: "gold" | "cyan" | "pink";
}) {
  const color = tone === "gold" ? "#FFC947" : tone === "cyan" ? "#08D9D6" : "#FF2E63";
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3 }}
      transition={SPRING}
      className="glass relative overflow-hidden rounded-[1.5rem] p-5"
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl"
        style={{ background: `${color}33` }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-2xs uppercase tracking-[0.2em] text-mute">{label}</p>
          <p className="display mt-2 text-2xl text-mist">{value}</p>
          <p className="mt-1 text-[0.65rem] uppercase tracking-[0.14em] text-mute">{note}</p>
        </div>
        <span
          className="grid h-10 w-10 place-items-center rounded-2xl"
          style={{ background: `${color}1f`, color }}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </motion.div>
  );
}

function StockCard({
  product,
  busy,
  onSave,
}: {
  product: ProductView;
  busy: boolean;
  onSave: (stock: number) => void;
}) {
  const [draft, setDraft] = useState(product.stock);
  const dirty = draft !== product.stock;

  return (
    <motion.div layout className="glass rounded-[1.5rem] p-4">
      <div className="flex gap-3">
        <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl">
          <Image src={product.images[0]} alt={product.name} fill sizes="56px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-mist">{product.name}</p>
          <p className="text-[0.65rem] uppercase tracking-[0.14em] text-mute">{product.category}</p>
          <p className="mt-1 text-xs text-gold">
            {inrFormat(product.price)}{" "}
            <span className="text-mute line-through">{inrFormat(product.mrp)}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-1 rounded-xl border border-line bg-white/[0.04] p-1">
          <button
            onClick={() => setDraft((d) => Math.max(0, d - 1))}
            className="grid h-7 w-7 place-items-center rounded-lg text-mist hover:bg-white/10"
            aria-label="Decrease stock"
          >
            −
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(Math.max(0, Math.min(999, Number(e.target.value) || 0)))}
            className="w-full bg-transparent text-center text-sm tabular-nums text-mist outline-none"
            aria-label={`${product.name} stock`}
          />
          <button
            onClick={() => setDraft((d) => Math.min(999, d + 1))}
            className="grid h-7 w-7 place-items-center rounded-lg text-mist hover:bg-white/10"
            aria-label="Increase stock"
          >
            +
          </button>
        </div>
        <button
          onClick={() => onSave(draft)}
          disabled={!dirty || busy}
          className={cn(
            "grid h-9 w-9 place-items-center rounded-xl transition-colors",
            dirty ? "bg-gold text-ink" : "border border-line text-mute",
          )}
          aria-label="Save stock"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
        <motion.div
          animate={{ scaleX: Math.min(1, product.stock / 40) }}
          transition={{ duration: 0.4 }}
          className="h-full origin-left rounded-full"
          style={{ background: product.stock === 0 ? "#FF2E63" : product.stock <= 10 ? "#FFC947" : "#08D9D6" }}
        />
      </div>
      <p className="mt-2 text-[0.62rem] uppercase tracking-[0.14em] text-mute">
        {product.stock === 0 ? "Sold out" : product.stock <= 10 ? `Low · ${product.stock} left` : "Healthy"}
      </p>
    </motion.div>
  );
}
