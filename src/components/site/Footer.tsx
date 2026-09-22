"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Check, Mail, Send } from "lucide-react";
import { useState } from "react";
import { STORE } from "@/lib/catalog";
import { SPRING, tapScale } from "@/lib/motion";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Men", href: "/?cat=men#shop" },
      { label: "Women", href: "/?cat=women#shop" },
      { label: "Kids", href: "/?cat=kids#shop" },
      { label: "Footwear", href: "/?cat=footwear#shop" },
      { label: "Bags", href: "/?cat=bags#shop" },
      { label: "Home", href: "/?cat=home#shop" },
    ],
  },
  {
    title: "Store",
    links: [
      { label: "Visit us", href: "/#visit" },
      { label: "Offers", href: "/#offers" },
      { label: "Reviews", href: "/#reviews" },
      { label: "The story", href: "/#story" },
      { label: "Checkout", href: "/checkout" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Size guide", href: "/#story" },
      { label: "Exchange policy", href: "/#story" },
      { label: "Order on WhatsApp", href: "/checkout" },
      { label: "Reserve & try", href: "/#shop" },
    ],
  },
];

function SocialIcon({ path, label }: { path: string; label: string }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white/[0.04] text-mute transition-colors hover:border-cyan/50 hover:text-mist"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d={path} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  return (
    <footer className="relative mt-10 overflow-hidden border-t border-line bg-ink-2/60">
      <div className="pointer-events-none absolute -left-40 -top-24 h-72 w-72 rounded-full bg-pink/12 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-cyan/10 blur-[120px]" />

      <div className="shell py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-pink to-cyan text-ink">
                <span className="display text-lg leading-none">V</span>
              </span>
              <span className="flex flex-col leading-none">
                <span className="display text-base tracking-[0.18em] text-mist">V-STYLE</span>
                <span className="text-[0.55rem] uppercase tracking-[0.42em] text-cyan">Siwan</span>
              </span>
            </Link>
            <p className="mt-5 max-w-[38ch] text-sm leading-relaxed text-mute">
              One store in Siwan, six aisles of style. New drops land every Friday — get the ping before the
              rack empties.
            </p>

            <form onSubmit={submit} className="mt-7">
              <label htmlFor="newsletter" className="text-2xs uppercase tracking-[0.24em] text-mute">
                Drop alerts
              </label>
              <div className="mt-3 flex items-center gap-2 rounded-full border border-line bg-white/[0.04] p-1.5 pl-4">
                <Mail className="h-4 w-4 shrink-0 text-mute" />
                <input
                  id="newsletter"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setState("idle");
                  }}
                  placeholder="your@email.com"
                  className="w-full bg-transparent text-sm text-mist outline-none placeholder:text-mute/70"
                />
                <motion.button
                  whileTap={tapScale}
                  type="submit"
                  disabled={state === "loading" || state === "done"}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold text-ink shadow-glow-gold disabled:opacity-70"
                  aria-label="Subscribe"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {state === "done" ? (
                      <motion.span key="d" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={SPRING}>
                        <Check className="h-4 w-4" />
                      </motion.span>
                    ) : (
                      <motion.span key="s" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={SPRING}>
                        <Send className="h-4 w-4" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
              <AnimatePresence>
                {state === "done" && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2.5 text-2xs uppercase tracking-[0.18em] text-cyan"
                  >
                    You&apos;re in. First ping lands Friday 🔔
                  </motion.p>
                )}
                {state === "error" && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2.5 text-2xs uppercase tracking-[0.18em] text-pink"
                  >
                    That email didn&apos;t work — try again?
                  </motion.p>
                )}
              </AnimatePresence>
            </form>

            <div className="mt-7 flex gap-2">
              <SocialIcon label="Instagram" path="M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0-11.75h.01M4.5 8.5v7a3.5 3.5 0 0 0 3.5 3.5h8a3.5 3.5 0 0 0 3.5-3.5v-7a3.5 3.5 0 0 0-3.5-3.5H8a3.5 3.5 0 0 0-3.5 3.5Z" />
              <SocialIcon label="Facebook" path="M14.5 8.5h2V5h-2a3.5 3.5 0 0 0-3.5 3.5V11H9v3.5h2V21h3.5v-6.5h2l.5-3.5h-2.5V9a.5.5 0 0 1 .5-.5Z" />
              <SocialIcon label="YouTube" path="M3.5 8.5a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3v-7Zm7 1.75v3.5l3-1.75-3-1.75Z" />
              <SocialIcon label="WhatsApp" path="M20 12a8 8 0 0 1-11.7 7.1L4 20l.9-4.3A8 8 0 1 1 20 12Zm-11 -1.5c0 3 2.5 5.5 5.5 5.5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="display text-xs uppercase tracking-[0.24em] text-mist">{col.title}</h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="group inline-flex items-center gap-1 text-sm text-mute transition-colors hover:text-cyan"
                      >
                        {l.label}
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="hairline my-10" />

        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-2">
            {["UPI", "RuPay", "Visa", "Mastercard", "Cash", "COD"].map((p) => (
              <span
                key={p}
                className="rounded-lg border border-line bg-white/[0.04] px-2.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-mute"
              >
                {p}
              </span>
            ))}
          </div>
          <p className="text-[0.68rem] text-mute">
            © {new Date().getFullYear()} V-STYLE Siwan · {STORE.address} · {STORE.phone}
          </p>
        </div>

        <a href="https://dynamicdevelopments.vercel.app/" target="_blank" rel="noopener noreferrer" className="relative mt-4 inline-flex min-h-11 items-center text-sm text-cyan underline underline-offset-4 hover:text-mist">Developed by Dynamic Developments</a>
        <p className="mt-6 text-[0.68rem] leading-relaxed text-mute/80">
          Concept/demo site — replace brand assets before commercial use. Store details shown here are
          placeholders.
        </p>
      </div>
    </footer>
  );
}
