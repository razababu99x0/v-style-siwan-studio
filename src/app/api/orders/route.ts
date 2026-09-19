import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { orders, type OrderItem } from "@/db/schema";
import { orderId } from "@/lib/utils";
import { decrementStock } from "@/server/catalog";

const schema = z.object({
  customerName: z.string().min(2),
  phone: z.string().min(10).max(15),
  email: z.string().email().optional().or(z.literal("")),
  addressLine: z.string().optional().or(z.literal("")),
  landmark: z.string().optional().or(z.literal("")),
  city: z.string().min(2),
  pincode: z.string().optional().or(z.literal("")),
  fulfilment: z.enum(["pickup", "delivery"]),
  paymentMethod: z.enum(["razorpay", "whatsapp", "cod"]),
  items: z
    .array(
      z.object({
        slug: z.string(),
        name: z.string(),
        image: z.string(),
        price: z.number().int().nonnegative(),
        size: z.string(),
        color: z.string(),
        qty: z.number().int().positive(),
      }),
    )
    .min(1),
  subtotal: z.number().int().nonnegative(),
  discount: z.number().int().nonnegative(),
  gst: z.number().int().nonnegative(),
  shipping: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  couponCode: z.string().nullable().optional(),
  notes: z.string().optional().or(z.literal("")),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", issues: parsed.error.issues.map((i) => i.message) },
      { status: 400 },
    );
  }

  const d = parsed.data;
  const code = orderId();

  try {
    await db.insert(orders).values({
      orderCode: code,
      customerName: d.customerName,
      phone: d.phone,
      email: d.email || null,
      addressLine: d.addressLine || null,
      landmark: d.landmark || null,
      city: d.city,
      pincode: d.pincode || null,
      fulfilment: d.fulfilment,
      paymentMethod: d.paymentMethod,
      paymentStatus: d.paymentMethod === "razorpay" ? "paid" : "pending",
      items: d.items as OrderItem[],
      subtotal: d.subtotal,
      discount: d.discount,
      gst: d.gst,
      shipping: d.shipping,
      total: d.total,
      couponCode: d.couponCode ?? null,
      notes: d.notes || null,
    });
  } catch (error) {
    console.warn("[orders] could not persist order:", (error as Error).message);
  }

  return NextResponse.json({
    ok: true,
    orderCode: code,
    razorpayEnabled: Boolean(process.env.RAZORPAY_KEY_ID),
  });
}
