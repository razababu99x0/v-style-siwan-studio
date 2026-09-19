import { NextResponse } from "next/server";
import { z } from "zod";
import { addSubscriber } from "@/server/catalog";

const schema = z.object({ email: z.string().email("Enter a valid email") });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }
    const stored = await addSubscriber(parsed.data.email.toLowerCase());
    return NextResponse.json({ ok: true, stored });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
