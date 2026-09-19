import { NextResponse } from "next/server";
import { z } from "zod";
import { ORDER_STATUSES } from "@/lib/catalog";
import { listOrders, setOrderStatus } from "@/server/catalog";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  code: z.string().min(3),
  status: z.enum(ORDER_STATUSES),
});

export async function GET() {
  const rows = await listOrders(60);
  return NextResponse.json({ ok: true, orders: rows });
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
    return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
  }
  const updated = await setOrderStatus(parsed.data.code, parsed.data.status);
  if (!updated) {
    return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, order: updated });
}
