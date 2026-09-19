import type { MetadataRoute } from "next";
import { getProducts } from "@/server/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://vstyle-siwan.example.com";
  const products = await getProducts();

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/wishlist`, changeFrequency: "weekly", priority: 0.4 },
    { url: `${base}/orders`, changeFrequency: "weekly", priority: 0.4 },
    { url: `${base}/checkout`, changeFrequency: "monthly", priority: 0.5 },
    ...products.map((p) => ({
      url: `${base}/product/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: p.featured ? 0.8 : 0.6,
    })),
  ];
}
