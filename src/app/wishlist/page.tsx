import type { Metadata } from "next";
import { getProducts } from "@/server/catalog";
import { WishlistGrid } from "@/components/site/WishlistGrid";

export const metadata: Metadata = {
  title: "Your wishlist · V-STYLE Siwan",
  description: "Everything you've saved at V-STYLE Siwan, with total value and savings vs MRP.",
};

export default async function WishlistPage() {
  const products = await getProducts();

  return (
    <div className="shell pb-24 pt-28 md:pt-36">
      <div className="mb-10 max-w-2xl">
        <p className="mb-4 flex items-center gap-2 text-2xs uppercase tracking-[0.28em] text-pink">
          <span className="h-1.5 w-1.5 rounded-full bg-pink" /> Saved for later
        </p>
        <h1 className="display text-display-1 text-mist">
          Your <span className="kinetic">wishlist</span>
        </h1>
        <p className="mt-4 max-w-[46ch] text-lead text-mute">
          Saved on this device. Add the lot to your bag in one tap, or show this list at the counter and
          we&apos;ll pull your sizes.
        </p>
      </div>

      <WishlistGrid products={products} />
    </div>
  );
}
