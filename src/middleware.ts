import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentSession } from "@/lib/auth-utils";
import { UserWithRole } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await getCurrentSession();
  const path = request.nextUrl.pathname;

  const user = session?.user as UserWithRole | undefined;

  // 🔥 PROTEKSI SEMUA ROUTE KITCHEN
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

  // 🔥 PROTEKSI ROUTE PROFILE
  if (path.startsWith("/profile")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 🔥 REDIRECT KITCHEN DARI /DASHBOARD KE /KITCHEN/DASHBOARD
  if (path === "/dashboard" && user?.role === "KITCHEN") {
    return NextResponse.redirect(new URL("/kitchen/dashboard", request.url));
  }

  // 🔥 REDIRECT CUSTOMER DARI /KITCHEN KE /DASHBOARD
  if (path === "/kitchen" && user?.role !== "KITCHEN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/kitchen/:path*",
    "/profile/:path*",
    "/dashboard",
    "/kitchen",
  ],
};