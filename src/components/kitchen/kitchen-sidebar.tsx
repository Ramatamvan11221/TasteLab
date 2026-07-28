"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { KITCHEN_NAV_LINKS, SITE_CONFIG } from "@/constants/site";
import { signOut } from "@/lib/auth-client";

export function KitchenSidebar({ brandName }: { brandName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col border-r-3 border-tastelab-black bg-tastelab-black text-tastelab-white md:flex">
      <div className="border-b-2 border-tastelab-white/10 p-5">
        <p className="font-heading text-lg font-extrabold text-tastelab-yellow">{SITE_CONFIG.name}</p>
        <p className="text-xs text-tastelab-white/60">Kitchen · {brandName}</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {KITCHEN_NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-lg px-3 py-2.5 text-sm font-bold transition-colors hover:bg-white/10",
              pathname.startsWith(link.href) && "bg-tastelab-yellow text-tastelab-black"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="border-t-2 border-tastelab-white/10 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold text-tastelab-white/80 hover:bg-white/10"
        >
          <LogOut className="size-4" /> Logout
        </button>
      </div>
    </aside>
  );
}