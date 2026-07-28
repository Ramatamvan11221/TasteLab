import Link from "next/link";
import { SITE_CONFIG } from "@/constants/site";

export function Footer() {
  return (
    <footer className="mt-16 border-t-3 border-tastelab-black bg-tastelab-black text-tastelab-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="font-heading text-lg font-extrabold text-tastelab-yellow">{SITE_CONFIG.name}</p>
            <p className="mt-1 max-w-sm text-sm text-tastelab-white/70">{SITE_CONFIG.tagline}</p>
          </div>
          <nav className="flex gap-6 text-sm font-bold">
            <Link href="/menu" className="hover:text-tastelab-yellow">
              Menu
            </Link>
            <Link href="/our-story" className="hover:text-tastelab-yellow">
              Cerita Kami
            </Link>
            <Link href="/login" className="hover:text-tastelab-yellow">
              Kitchen Login
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-xs text-tastelab-white/50">
          © {new Date().getFullYear()} {SITE_CONFIG.name}. TasteLab bukan platform pemesanan atau pengantaran
          makanan.
        </p>
      </div>
    </footer>
  );
}
