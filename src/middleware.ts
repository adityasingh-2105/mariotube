import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect internal /api/user routes
  if (path.startsWith("/api/user")) {
    const devToken = request.cookies.get("next-auth.session-token");
    const prodToken = request.cookies.get("__Secure-next-auth.session-token");
    const authJsToken = request.cookies.get("authjs.session-token");
    const secureAuthJsToken = request.cookies.get("__Secure-authjs.session-token");
    const sessionToken = devToken || prodToken || authJsToken || secureAuthJsToken;

    if (!sessionToken) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/user/:path*"],
};

