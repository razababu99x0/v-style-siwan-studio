import { NextResponse, type NextRequest } from "next/server";
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === "/admin" || path.startsWith("/api/admin")) return new NextResponse("Administration is unavailable until secure authentication is configured.", { status: 403 });
  if (!process.env.DATABASE_URL && path.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    return NextResponse.json({ ok: false, error: "Demo storefront: order submission and saving are unavailable until the store is connected." }, { status: 503 });
  }
  return NextResponse.next();
}
export const config = { matcher: ["/api/:path*", "/admin/:path*"] };
