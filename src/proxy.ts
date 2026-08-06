// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentSession } from "@/lib/auth-utils";
import { UserWithRole } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await getCurrentSession();
  const path = request.nextUrl.pathname;
  const user = session?.user as UserWithRole | undefined;

  // 🔥 PROTECT KITCHEN ROUTES
  if (path.startsWith("/kitchen")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== "KITCHEN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 🔥 PROTECT PROFILE
  if (path.startsWith("/profile") && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // 🔥 REDIRECT KITCHEN DARI /DASHBOARD
  if (path === "/dashboard" && user?.role === "KITCHEN") {
    return NextResponse.redirect(new URL("/kitchen/dashboard", request.url));
  }

  return NextResponse.next();
}

// 🔥 CONFIG UNTUK PROXY
export const config = {
  matcher: [
    "/kitchen/:path*",
    "/profile/:path*",
    "/dashboard",
    "/kitchen",
  ],
};