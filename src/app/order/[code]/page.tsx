import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderByCode } from "@/server/catalog";
import { OrderSuccess } from "@/components/site/OrderSuccess";

export const metadata: Metadata = {
  title: "Order confirmed · V-STYLE Siwan",
};

export default async function OrderPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const order = await getOrderByCode(code);
  if (!order) notFound();

  return (
    <OrderSuccess
      code={order.orderCode}
      customerName={order.customerName}
      fulfilment={order.fulfilment}
      paymentMethod={order.paymentMethod}
      total={order.total}
      items={order.items.map((i) => ({
        slug: i.slug,
        name: i.name,
        image: i.image,
        size: i.size,
        color: i.color,
        qty: i.qty,
        price: i.price,
      }))}
    />
  );
}
