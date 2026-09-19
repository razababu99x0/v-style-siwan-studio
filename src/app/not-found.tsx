import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell grid min-h-[70svh] place-items-center pt-28">
      <div className="text-center">
        <p className="display text-display-1 kinetic">404</p>
        <h1 className="display mt-4 text-display-3 text-mist">This rail is empty</h1>
        <p className="mx-auto mt-3 max-w-[40ch] text-sm text-mute">
          The piece you were after moved on. Head back to the drop — new stock lands every Friday.
        </p>
        <Link
          href="/#shop"
          className="mt-8 inline-block rounded-full bg-gold px-7 py-3.5 text-2xs font-bold uppercase tracking-[0.2em] text-ink shadow-glow-gold"
        >
          Back to the drop
        </Link>
      </div>
    </div>
  );
}
