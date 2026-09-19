import type { Metadata } from "next";
import Link from "next/link";
import { getProducts, getTestimonials } from "@/server/catalog";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { ShopExperience } from "@/components/site/ShopExperience";
import { ScrollStory } from "@/components/site/ScrollStory";
import { OffersBanner } from "@/components/site/OffersBanner";
import { Testimonials } from "@/components/site/Testimonials";
import { VisitStore } from "@/components/site/VisitStore";
import { RecentlyViewed } from "@/components/site/RecentlyViewed";

export const metadata: Metadata = {
  title: "V-STYLE Siwan — Fashion that pops off the screen",
  description:
    "Men, women, kids, footwear, bags & home from ₹299. Try in-store, same-day pickup, UPI accepted. Siwan's #1 style store.",
};

export default async function HomePage() {
  const [products, testimonials] = await Promise.all([getProducts(), getTestimonials()]);

  return (
    <>
      <Hero />
      <Marquee />
      <ShopExperience products={products} />
      <ScrollStory />
      <OffersBanner />
      <Testimonials items={testimonials} />
      <RecentlyViewed products={products} />
      <VisitStore />

      <section className="shell pb-20">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-line bg-[linear-gradient(135deg,rgba(255,46,99,0.14),rgba(8,217,214,0.1))] p-8 sm:p-12">
          <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" />
          <div className="relative flex flex-wrap items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="display text-display-2 text-mist">
                {products.length} styles. <span className="kinetic">One rack.</span>
              </h2>
              <p className="mt-4 max-w-[46ch] text-lead text-mute">
                Filter the whole store by size, colour, price and rating — then reserve exactly what you want
                before someone else takes your size.
              </p>
            </div>
            <Link
              href="/shop"
              className="group flex items-center gap-3 rounded-full bg-gold px-7 py-4 text-2xs font-bold uppercase tracking-[0.2em] text-ink shadow-glow-gold"
            >
              Open the full rack
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
