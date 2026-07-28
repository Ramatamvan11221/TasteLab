import Link from "next/link";
import Image from "next/image";
import { ArrowRight, QrCode, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FoodCard } from "@/components/catalog/food-card";
import { getMenuFoods } from "@/services/catalog.service";
import { SITE_CONFIG } from "@/constants/site";
import { getCurrentSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { UserWithRole } from "@/lib/auth";

export default async function HomePage() {
  // 🔥 CEK SESSION
  const session = await getCurrentSession();
  const user = session?.user as UserWithRole | undefined;

  // 🔥 KALO KITCHEN, REDIRECT KE KITCHEN DASHBOARD
  // KALO CUSTOMER ATAU BELUM LOGIN, TETAP LIAT HALAMAN UTAMA
  if (user?.role === "KITCHEN") {
    redirect("/kitchen/dashboard");
  }

  // CUSTOMER ATAU BELUM LOGIN → TAMPILKAN HALAMAN UTAMA
  const foods = await getMenuFoods();
  const featured = foods.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="border-b-3 border-tastelab-black bg-tastelab-yellow">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div>
            <span className="brutal-card inline-block bg-tastelab-white px-3 py-1 text-xs font-bold">
              Transparansi Produk Makanan
            </span>
            <h1 className="mt-4 font-heading text-4xl font-extrabold leading-[1.05] sm:text-5xl">
              {SITE_CONFIG.tagline}
            </h1>
            <p className="mt-4 max-w-md text-tastelab-black/75">{SITE_CONFIG.description}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/menu">
                  Lihat Menu <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/our-story">Cerita Kami</Link>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-sm">
            <div className="brutal-card flex h-full items-center justify-center bg-tastelab-white p-10">
              <QrCode className="size-40 text-tastelab-black" strokeWidth={1.2} />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-heading text-3xl font-extrabold">Bagaimana Cara Kerjanya?</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <Card className="p-6 text-center">
            <QrCode className="mx-auto size-10 text-tastelab-orange" />
            <h3 className="mt-4 font-heading text-lg font-extrabold">Scan QR Code</h3>
            <p className="mt-2 text-sm text-tastelab-black/65">
              Setiap kemasan produk punya QR Code yang langsung membuka TasteLab.
            </p>
          </Card>
          <Card className="p-6 text-center">
            <ShieldCheck className="mx-auto size-10 text-tastelab-orange" />
            <h3 className="mt-4 font-heading text-lg font-extrabold">Lihat Nutrisi & Deskripsi</h3>
            <p className="mt-2 text-sm text-tastelab-black/65">
              Ketahui persis apa yang kamu makan — nilai gizi lengkap, transparan.
            </p>
          </Card>
          <Card className="p-6 text-center">
            <Star className="mx-auto size-10 text-tastelab-orange" />
            <h3 className="mt-4 font-heading text-lg font-extrabold">Beri Rating & Ulasan</h3>
            <p className="mt-2 text-sm text-tastelab-black/65">
              Bagikan pendapatmu — publik atau privat, pilihanmu sepenuhnya.
            </p>
          </Card>
        </div>
      </section>

      {/* Featured foods */}
      {featured.length > 0 && (
        <section className="bg-tastelab-yellow-soft/50 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-3xl font-extrabold">Produk Favorit</h2>
              <Link href="/menu" className="text-sm font-bold text-tastelab-orange-dark hover:underline">
                Lihat Semua →
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              {featured.map((food) => (
                <FoodCard key={food.id} food={food} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}