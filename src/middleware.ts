import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Only protect /admin routes
  if (!url.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization");
  const username = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASS;

  if (!username || !password) {
    console.error("[ADMIN] ADMIN_USER or ADMIN_PASS not set");
    return new NextResponse("Admin credentials not configured", { status: 500 });
  }

  if (!authHeader?.startsWith("Basic ")) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="CyberFist Admin"',
      },
    });
  }

  const base64Credentials = authHeader.slice("Basic ".length).trim();
  const [user, pass] = Buffer.from(base64Credentials, "base64")
    .toString("utf-8")
    .split(":");

  if (user !== username || pass !== password) {
    return new NextResponse("Invalid credentials", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="CyberFist Admin"',
      },
    });
  }

  return NextResponse.next();
}

// Make sure middleware runs on /admin
export const config = {
  matcher: ["/admin/:path*"],
};
