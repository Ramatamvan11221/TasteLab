"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, User as UserIcon, LogOut } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth-client";
import { CUSTOMER_NAV_LINKS, SITE_CONFIG } from "@/constants/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  async function handleLogout() {
    await signOut();
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b-3 border-tastelab-black bg-tastelab-yellow">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-heading text-xl font-extrabold">
          <span className="flex size-9 items-center justify-center rounded-xl border-3 border-tastelab-black bg-tastelab-black text-tastelab-yellow">
            T
          </span>
          {SITE_CONFIG.name}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {CUSTOMER_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-bold transition-colors hover:bg-black/10",
                pathname === link.href && "bg-tastelab-black text-tastelab-yellow"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!isPending && session?.user ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-full border-2 border-tastelab-black bg-tastelab-white px-3 py-1.5 text-sm font-bold"
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name}
                    width={24}
                    height={24}
                    className="rounded-full border border-tastelab-black"
                  />
                ) : (
                  <UserIcon className="size-4" />
                )}
                {session.user.name.split(" ")[0]}
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Masuk</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Daftar</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t-3 border-tastelab-black bg-tastelab-yellow px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {CUSTOMER_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-bold hover:bg-black/10"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t-2 border-tastelab-black/20 pt-3">
              {!isPending && session?.user ? (
                <>
                  <Link href="/profile" className="rounded-lg px-3 py-2 text-sm font-bold hover:bg-black/10">
                    Profil Saya
                  </Link>
                  <Button variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Masuk</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Daftar</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
