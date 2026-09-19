import { NextResponse } from "next/server";
import { getStoreStats } from "@/server/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const stats = await getStoreStats();
  return NextResponse.json({ ok: true, stats });
}
