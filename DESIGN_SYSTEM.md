# V-STYLE SIWAN — Design System

**Style direction:** Dark luxury streetwear · Indian street-market energy
**Mood refs:** Nike SNKRS, Apple product pages, Lusion, Zajno — with festive Diwali/Chhath accents.
**Audience:** 16–35, tier-3 India, mid-range Android → every effect has a cheap fallback.

---

## 1. Colour tokens (CSS variables in `src/app/globals.css`)

| Token | Hex | Role | Contrast on `#0B0B12` |
| --- | --- | --- | --- |
| `--color-ink` | `#0B0B12` | Page base, near-black with a blue cast | — |
| `--color-ink-2` | `#101019` | Section / footer base | — |
| `--color-ink-3` | `#171724` | Media wells, image placeholders | — |
| `--color-ink-4` | `#1F1F30` | Raised surfaces | — |
| `--color-mist` | `#F4F6FF` | Primary text | 17.4:1 ✅ AAA |
| `--color-mute` | `#A9ADBF` | Secondary text | 7.2:1 ✅ AA |
| `--color-pink` | `#FF2E63` | Electric accent 1 — badges, glows, CTAs | 5.3:1 ✅ AA |
| `--color-cyan` | `#08D9D6` | Electric accent 2 — focus rings, links, info | 11.1:1 ✅ AAA |
| `--color-gold` | `#FFC947` | Money + primary CTA | 12.3:1 ✅ AAA |
| `--color-line` | `rgba(255,255,255,.09)` | Hairlines / borders | decorative |

Rules
- Gold is **reserved** for price, totals and the primary CTA so the eye always finds "buy".
- Never set body text below `--color-mute` (AA minimum 4.5:1 maintained).
- No purple gradients, no default Tailwind blue, no centred-everything layouts.
- Buttons on gold/cyan always use `--color-ink` text (12:1+).

## 2. Typography — `next/font`

- **Display:** Space Grotesk 500/600/700 → `.display` (uppercase, `-0.03em`, bold geometric).
- **Body:** Inter → default `font-sans`.
- **Scale (fluid):**
  - `text-display-1` `clamp(2.55rem, 9.2vw, 7.4rem)` / `0.92` — hero, 404, page titles
  - `text-display-2` `clamp(1.95rem, 5.4vw, 4.1rem)` / `0.98` — section titles, PDP title
  - `text-display-3` `clamp(1.45rem, 3.1vw, 2.35rem)` / `1.1` — cards, sub-sections
  - `text-lead` `clamp(0.98rem, 1.35vw, 1.19rem)` / `1.6` — intro paragraphs
  - `text-2xs` `0.6875rem` — eyebrows, labels, tracking `[0.2em–0.28em]`

## 3. Spacing & layout

- Gutters: `--gutter: clamp(1.15rem, 4.4vw, 4.5rem)`, container `--maxw: 88rem`, use `.shell`.
- Section rhythm: `py-20 md:py-28`; section head → content gap `mb-10`.
- Grids: product `grid-cols-2 → md:3 → xl:4`; bento `md:grid-cols-6` with row/col spans; PDP `lg:grid-cols-[1.05fr_1fr]`; shop `lg:grid-cols-[16rem_1fr]`.
- Hairline dividers (`.hairline`) instead of heavy boxes.

## 4. Radius, elevation, glow

| Token | Value |
| --- | --- |
| `--radius-xs` | `0.375rem` (chips, size pills) |
| `--radius-lg` | `1rem` (inputs) |
| `--radius-xl` | `1.5rem` (cards, rows) |
| `--radius-2xl` | `2rem` (product cards, drawers) |
| `--radius-3xl` | `2.75rem` (bento hero) |
| `--shadow-lift` | inset top highlight + deep drop |
| `--shadow-panel` | `0 40px 120px -50px rgba(0,0,0,.95)` |
| `--shadow-glow-pink` | `0 0 0 1px rgba(255,46,99,.35), 0 22px 70px -22px rgba(255,46,99,.65)` |
| `--shadow-glow-cyan` | same shape, cyan |
| `--shadow-glow-gold` | same shape, gold (CTAs only) |

Surfaces: `.glass` (translucent + 18px blur), `.glass-strong` (drawers, popovers, toasts).
Texture: `.grain-overlay` (SVG fractal noise, 5.5%, `mix-blend-mode: overlay`).
Backgrounds: `.mesh-bg` (3 radial neon blooms), `.grid-lines` (68px grid + radial mask).

## 5. Motion tokens (`src/lib/motion.ts`)

| Token | Value | Used for |
| --- | --- | --- |
| `SPRING` | `stiffness 120, damping 18, mass .9` | default entrance / layout |
| `SPRING_SOFT` | `90 / 20 / 1.1` | large surfaces, drawers |
| `SPRING_SNAP` | `420 / 30` | badges, toggles, micro feedback |
| `EASE_OUT` | `cubic-bezier(.16,1,.3,1)` | opacity / clip-path reveals |
| `EASE_IN_OUT` | `cubic-bezier(.83,0,.17,1)` | preloader wipe |
| `STAGGER` | `0.06s` | every list / nav / grid stagger |
| `DUR` | `.18 / .32 / .56 / .7s` | fast / base / slow / **max** |

Rules
- `whileInView` + `once: true`, viewport `margin: -12%`.
- Buttons: `whileTap={{ scale: 0.97 }}`; magnetic hover desktop only.
- `layoutId` shared transitions: filter chip pill, size pill, colour ring, admin tab, mobile tab indicator, product image → PDP hero.
- No animation exceeds **0.7s**.
- `prefers-reduced-motion`: parallax, auto-rotate, marquee, confetti and CSS keyframes off; opacity fades stay.

## 6. 3D / WebGL architecture

| Layer | File | Purpose |
| --- | --- | --- |
| `LazyCanvas` | `components/three/LazyCanvas.tsx` | IntersectionObserver-gated `<Canvas>` mount |
| `ProductModel` | `components/three/ProductModel.tsx` | 4 primitive-built models (sneaker / tee / bag / home) — zero external GLB |
| `Configurator` | `components/three/Configurator.tsx` | OrbitControls 3D studio, per-frame colour lerp, neon grid, contact shadows |
| `HeroStage` | `components/three/HeroStage.tsx` | Sneaker + particle field + Lightformer studio lighting |
| `PreloaderScene` | `components/three/PreloaderScene.tsx` | Wireframe hanger → logo morph |
| `ConfettiStage` | `components/three/ConfettiStage.tsx` | Instanced 3D confetti on order success |
| `ScrollStory` | `components/site/ScrollStory.tsx` | `useScroll` → rotation + pink→cyan→gold colour lerp |

**Capability gate** (`hooks/useDeviceTier.ts`): WebGL present **and** `hardwareConcurrency > 4` **and**
`deviceMemory > 2` **and** not reduced-motion → WebGL. Anything else gets the CSS-3D fallback
(`.css3d-stage` / `ConfiguratorFallback`), so mid-range Android never drops frames.
DPR capped `1.1` (low tier) → `1.7` (high tier).

## 7. Component / UX rules

- Sticky nav shrinks + blurs past 28px scroll; active link gets a gradient underline.
- Price is always gold; MRP struck through in `mute`; `% off` badge in pink.
- Cart badge and toasts animate with `AnimatePresence mode="popLayout"`.
- Drawer/overlay: `Esc` closes, backdrop closes, scroll containers use `data-lenis-prevent`.
- Focus-visible: 2px cyan outline, 3px offset (WCAG 2.4.7).
- Empty states are illustrated and animated (bag, wishlist, filters, orders, admin).
- Loading states are shimmer skeletons, never blank gaps.
- Mobile has a 5-slot bottom tab bar (thumb reach) — the desktop nav hides below `lg`.
- Store placeholders kept verbatim: `[STORE_ADDRESS]`, `[STORE_PHONE]`, `[STORE_HOURS]`, `[WHATSAPP_NUMBER]`.
- Footer carries: *"Concept/demo site — replace brand assets before commercial use."*

## 8. Routes

| Route | Type | What it does |
| --- | --- | --- |
| `/` | static | Hero, marquee, bento, trending grid, pinned scroll story, festive offers, testimonials, recently viewed, store info |
| `/shop` | dynamic | Full rack + filter rail (category, price, size, colour, rating, availability), URL-synced |
| `/product/[slug]` | dynamic | Gallery ⇄ 3D studio, size guide, reserve-in-store, related, sticky mobile bar |
| `/wishlist` | dynamic | Saved items with value/savings totals and bulk add-to-bag |
| `/orders` | dynamic | Order tracking with live status timeline |
| `/checkout` | static | Validated address + payment (WhatsApp / Razorpay stub / COD) |
| `/order/[code]` | dynamic | 3D confetti success page |
| `/admin` | dynamic | Owner console: KPIs, revenue by aisle, order pipeline, status control, inventory editing |
| `/api/products`, `/api/orders`, `/api/orders/[code]`, `/api/newsletter`, `/api/admin/*`, `/api/health` | API | Catalogue, order create (with stock decrement), tracking, subscribe, admin CRUD |

## 9. Anti-patterns enforced

No purple gradients · no default Tailwind blue · no stock-photo clichés · no centred-everything layouts ·
no jQuery/GSAP/CDN scripts · no animation > 0.7s · no text below AA contrast · no WebGL on low-end devices ·
no `setState` inside effect bodies (React Compiler-clean) · no impure `Math.random`/`Date.now` in render.
