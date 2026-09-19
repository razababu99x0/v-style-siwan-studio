import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, products, subscribers, testimonials } from "@/db/schema";
import { PRODUCTS, TESTIMONIALS, type Product } from "@/lib/catalog";

let seedPromise: Promise<void> | null = null;
let dbHealthy = true;

async function seed() {
  // idempotent upsert: new catalogue entries land without touching existing rows
  await db
    .insert(products)
    .values(
      PRODUCTS.map((p) => ({
        slug: p.slug,
        name: p.name,
        category: p.category,
        subtitle: p.subtitle,
        description: p.description,
        price: p.price,
        mrp: p.mrp,
        images: p.images,
        colors: p.colors,
        sizes: p.sizes,
        rating: p.rating,
        reviews: p.reviews,
        stock: p.stock,
        badge: p.badge,
        featured: p.featured,
        accent: p.accent,
      })),
    )
    .onConflictDoNothing({ target: products.slug });

  await db.insert(testimonials).values(TESTIMONIALS).onConflictDoNothing();
}

export async function ensureSeeded() {
  if (!dbHealthy) return;
  if (!seedPromise) {
    seedPromise = seed().catch((error) => {
      dbHealthy = false;
      seedPromise = null;
      console.warn("[catalog] database unavailable, using static catalog:", (error as Error).message);
    });
  }
  await seedPromise;
}

function toProduct(row: typeof products.$inferSelect): Product {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category as Product["category"],
    subtitle: row.subtitle,
    description: row.description,
    price: row.price,
    mrp: row.mrp,
    images: [row.images[0] ?? "/img/men-01.jpg", row.images[1] ?? row.images[0] ?? "/img/men-01.jpg"],
    colors: row.colors,
    sizes: row.sizes,
    rating: row.rating,
    reviews: row.reviews,
    stock: row.stock,
    badge: row.badge,
    featured: row.featured,
    accent: row.accent as Product["accent"],
  };
}

export async function getProducts(): Promise<Product[]> {
  try {
    await ensureSeeded();
    if (!dbHealthy) return PRODUCTS;
    const rows = await db.select().from(products).orderBy(desc(products.featured), asc(products.price));
    return rows.length ? rows.map(toProduct) : PRODUCTS;
  } catch {
    return PRODUCTS;
  }
}

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    await ensureSeeded();
    if (dbHealthy) {
      const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
      if (rows[0]) return toProduct(rows[0]);
    }
  } catch {
    /* fall through to static catalog */
  }
  return PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export async function getTestimonials() {
  try {
    await ensureSeeded();
    if (dbHealthy) {
      const rows = await db.select().from(testimonials).orderBy(asc(testimonials.id));
      if (rows.length) {
        return rows.map((r) => ({
          id: r.id,
          name: r.name,
          city: r.city,
          quote: r.quote,
          purchase: r.purchase,
          rating: r.rating,
          accent: r.accent as "pink" | "cyan" | "gold",
        }));
      }
    }
  } catch {
    /* fall through */
  }
  return TESTIMONIALS;
}

export async function getOrderByCode(code: string) {
  try {
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.orderCode, code.toUpperCase()))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function listOrders(limit = 40) {
  try {
    return await db.select().from(orders).orderBy(desc(orders.id)).limit(limit);
  } catch {
    return [];
  }
}

export async function setOrderStatus(code: string, status: string) {
  try {
    const rows = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.orderCode, code))
      .returning();
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function setProductStock(slug: string, stock: number, price?: number) {
  try {
    const patch: Partial<typeof products.$inferInsert> = { stock };
    if (typeof price === "number") patch.price = price;
    const rows = await db.update(products).set(patch).where(eq(products.slug, slug)).returning();
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export type StoreStats = {
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

export async function getStoreStats(): Promise<StoreStats> {
  const empty: StoreStats = {
    orderCount: 0,
    revenue: 0,
    avgOrderValue: 0,
    subscriberCount: 0,
    productCount: 0,
    unitsSold: 0,
    pickupShare: 0,
    statusBreakdown: {},
    topCategories: [],
  };

  try {
    await ensureSeeded();
    const [orderRows, subCount, productCount, productRows] = await Promise.all([
      listOrders(500),
      db.select({ n: sql<number>`count(*)::int` }).from(subscribers),
      db.select({ n: sql<number>`count(*)::int` }).from(products),
      db.select({ slug: products.slug, price: products.price, category: products.category }).from(products),
    ]);

    if (!orderRows.length) return { ...empty, subscriberCount: subCount[0]?.n ?? 0, productCount: productCount[0]?.n ?? 0 };

    const priceBySlug = new Map(productRows.map((p) => [p.slug, p]));
    const revenue = orderRows
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);
    const unitsSold = orderRows.reduce(
      (sum, o) => sum + o.items.reduce((n, i) => n + i.qty, 0),
      0,
    );
    const pickups = orderRows.filter((o) => o.fulfilment === "pickup").length;

    const statusBreakdown: Record<string, number> = {};
    const catMap = new Map<string, { units: number; revenue: number }>();
    for (const order of orderRows) {
      statusBreakdown[order.status] = (statusBreakdown[order.status] ?? 0) + 1;
      for (const item of order.items) {
        const meta = priceBySlug.get(item.slug);
        const cat = meta?.category ?? "other";
        const entry = catMap.get(cat) ?? { units: 0, revenue: 0 };
        entry.units += item.qty;
        entry.revenue += item.price * item.qty;
        catMap.set(cat, entry);
      }
    }

    const live = orderRows.filter((o) => o.status !== "cancelled");
    return {
      orderCount: orderRows.length,
      revenue,
      avgOrderValue: live.length ? Math.round(revenue / live.length) : 0,
      subscriberCount: subCount[0]?.n ?? 0,
      productCount: productCount[0]?.n ?? 0,
      unitsSold,
      pickupShare: Math.round((pickups / orderRows.length) * 100),
      statusBreakdown,
      topCategories: [...catMap.entries()]
        .map(([category, v]) => ({ category, ...v }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 6),
    };
  } catch {
    return empty;
  }
}

/** Decrements stock for each ordered line, floored at zero. */
export async function decrementStock(items: { slug: string; qty: number }[]) {
  if (!dbHealthy) return;
  try {
    for (const item of items) {
      const rows = await db.select({ stock: products.stock }).from(products).where(eq(products.slug, item.slug)).limit(1);
      const current = rows[0]?.stock;
      if (typeof current !== "number") continue;
      await db
        .update(products)
        .set({ stock: Math.max(0, current - item.qty) })
        .where(eq(products.slug, item.slug));
    }
  } catch (error) {
    console.warn("[orders] stock decrement skipped:", (error as Error).message);
  }
}

export async function addSubscriber(email: string) {
  try {
    await db.insert(subscribers).values({ email }).onConflictDoNothing();
    return true;
  } catch {
    return false;
  }
}
