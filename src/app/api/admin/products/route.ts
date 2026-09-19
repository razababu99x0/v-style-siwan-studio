import { NextResponse } from "next/server";
import { z } from "zod";
import { getProducts, setProductStock } from "@/server/catalog";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  slug: z.string().min(2),
  stock: z.number().int().min(0).max(999),
  price: z.number().int().min(49).max(99999).optional(),
});

export async function GET() {
  const products = await getProducts();
  return NextResponse.json({ ok: true, products });
}

export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }
  const updated = await setProductStock(parsed.data.slug, parsed.data.stock, parsed.data.price);
  if (!updated) {
    return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    product: { slug: updated.slug, stock: updated.stock, price: updated.price },
  });
}
