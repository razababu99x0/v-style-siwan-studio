import { NextResponse } from "next/server";
import { getProducts } from "@/server/catalog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const cat = searchParams.get("cat");
  let products = await getProducts();
  if (cat && cat !== "all") products = products.filter((p) => p.category === cat);
  if (q) {
    products = products.filter((p) =>
      [p.name, p.category, p.subtitle, p.description, p.badge ?? ""].join(" ").toLowerCase().includes(q),
    );
  }
  return NextResponse.json({ products, count: products.length });
}
