import type { Metadata } from "next";
import { getProducts } from "@/server/catalog";
import type { CategorySlug } from "@/lib/catalog";
import { ShopBrowser } from "@/components/site/ShopBrowser";

export const metadata: Metadata = {
  title: "Shop all · V-STYLE Siwan",
  description:
    "Filter the full V-STYLE Siwan rack — men, women, kids, footwear, bags and home from ₹299. Filter by size, colour, price and rating.",
};

const VALID: CategorySlug[] = ["men", "women", "kids", "footwear", "bags", "home"];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; wishlist?: string }>;
}) {
  const params = await searchParams;
  const requested = (params.cat ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter((c): c is CategorySlug => VALID.includes(c as CategorySlug));
  const products = await getProducts();

  return (
    <div className="shell pb-24 pt-28 md:pt-36">
      <div className="mb-10 max-w-3xl">
        <p className="mb-4 flex items-center gap-2 text-2xs uppercase tracking-[0.28em] text-pink">
          <span className="h-1.5 w-1.5 rounded-full bg-pink" /> The full rack
        </p>
        <h1 className="display text-display-1 text-mist">
          Shop <span className="kinetic">everything</span>
        </h1>
        <p className="mt-4 max-w-[52ch] text-lead text-mute">
          Every style currently on the floor in Siwan, priced ₹299–₹1,999. Filter it down, reserve your size,
          try it on in-store.
        </p>
      </div>

      <ShopBrowser
        products={products}
        initialCategory={requested}
        wishOnly={params.wishlist === "1"}
      />
    </div>
  );
}
