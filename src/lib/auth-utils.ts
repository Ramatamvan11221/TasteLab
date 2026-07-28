import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, UserWithRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Returns the current Better Auth session (or null) for use in Server
 * Components, Server Actions, and Route Handlers.
 */
export async function getCurrentSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Gets session for middleware (lightweight, no redirects)
 */
export async function getSession() {
  return await getCurrentSession();
}

/**
 * Requires an authenticated Customer or Kitchen user. Redirects to /login
 * (preserving the current path via `redirect` query param) if unauthenticated.
 */
export async function requireUser(currentPath?: string) {
  const session = await getCurrentSession();
  if (!session?.user) {
    const target = currentPath ? `/login?redirect=${encodeURIComponent(currentPath)}` : "/login";
    redirect(target);
  }
  // 🔥 CAST KE UserWithRole
  return session.user as UserWithRole;
}

/**
 * Requires an authenticated Kitchen user with an attached KitchenProfile
 * (brand assignment). Redirects non-Kitchen users away from /kitchen/**.
 */
export async function requireKitchen() {
  const session = await getCurrentSession();
  
  if (!session?.user) {
    redirect("/login?redirect=%2Fkitchen%2Fdashboard");
  }
  
  // 🔥 CAST KE UserWithRole
  const user = session.user as UserWithRole;
  
  if (user.role !== "KITCHEN") {
    redirect("/dashboard");
  }

  const kitchenProfile = await prisma.kitchenProfile.findUnique({
    where: { userId: session.user.id },
    include: { brand: true },
  });

  if (!kitchenProfile) {
    redirect("/login?error=kitchen_not_provisioned");
  }

  return { user, kitchenProfile };
}

/**
 * Check if current user is Kitchen (for middleware)
 */
export async function isKitchen() {
  const session = await getCurrentSession();
  if (!session?.user) return false;
  const user = session.user as UserWithRole;
  return user.role === "KITCHEN";
}

/**
 * Check if user is logged in (for middleware)
 */
export async function isLoggedIn() {
  const session = await getCurrentSession();
  return !!session?.user;
}