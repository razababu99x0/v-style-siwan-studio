import type { Metadata } from "next";
import { CheckoutForm } from "@/components/site/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout · V-STYLE Siwan",
  description: "Store pickup in 2 hours or home delivery across Siwan. UPI, cards, cash or order on WhatsApp.",
};

export default function CheckoutPage() {
  const razorpayEnabled = Boolean(process.env.RAZORPAY_KEY_ID);

  return (
    <div className="shell pt-28 md:pt-32">
      <p className="text-2xs uppercase tracking-[0.28em] text-cyan">Secure checkout</p>
      <h1 className="display mt-4 text-display-2 text-mist">
        Almost <span className="kinetic">yours</span>
      </h1>
      <p className="mt-3 max-w-[52ch] text-lead text-mute">
        Pickup from the Siwan store in two hours, or get it delivered. Pay online, on WhatsApp, or cash —
        your call.
      </p>

      <CheckoutForm razorpayEnabled={razorpayEnabled} />
    </div>
  );
}
