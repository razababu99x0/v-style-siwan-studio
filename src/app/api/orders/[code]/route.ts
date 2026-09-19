import { NextResponse } from "next/server";
import { getOrderByCode } from "@/server/catalog";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const order = await getOrderByCode(code);
  if (!order) {
    return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  }
  const timeline = (["new", "packed", "ready", "completed"] as OrderStatus[]).map((s) => ({
    status: s,
    label: s,
    done: reached(order.status as OrderStatus, s),
    current: order.status === s,
  }));
  return NextResponse.json({
    ok: true,
    order: {
      code: order.orderCode,
      customerName: order.customerName,
      fulfilment: order.fulfilment,
      paymentMethod: order.paymentMethod,
      status: order.status,
      total: order.total,
      city: order.city,
      createdAt: order.createdAt,
      items: order.items,
    },
    timeline,
  });
}

function reached(current: OrderStatus, target: OrderStatus) {
  if (current === "cancelled") return false;
  const order = ORDER_STATUSES.indexOf(current);
  return order >= ORDER_STATUSES.indexOf(target);
}
