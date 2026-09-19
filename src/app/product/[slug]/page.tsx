import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/server/catalog";
import { ProductDetail } from "@/components/site/ProductDetail";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found · V-STYLE Siwan" };
  return {
    title: `${product.name} · V-STYLE Siwan`,
    description: `${product.subtitle} — ₹${product.price}. Try in-store or get same-day pickup in Siwan.`,
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const all = await getProducts();
  const related = all
    .filter((p) => p.slug !== product.slug)
    .sort((a, b) => {
      const sameA = a.category === product.category ? 0 : 1;
      const sameB = b.category === product.category ? 0 : 1;
      return sameA - sameB;
    })
    .slice(0, 4);

  return <ProductDetail key={product.slug} product={product} related={related} />;
}
