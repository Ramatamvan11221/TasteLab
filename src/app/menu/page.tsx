import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FoodCard } from "@/components/catalog/food-card";
import { getMenuFoods, getAllCategories } from "@/services/catalog.service";

export const metadata: Metadata = {
  title: "Menu",
  description: "Jelajahi semua produk TasteLab lengkap dengan nutrisi dan ulasan pelanggan.",
};

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [foods, categories] = await Promise.all([getMenuFoods(category), getAllCategories()]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-extrabold">Menu</h1>
        <p className="mt-2 text-tastelab-black/65">
          Pilih produk untuk melihat nutrisi lengkap dan ulasan pelanggan.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/menu"
          className={cn(
            "brutal-btn bg-tastelab-white px-4 py-2 text-sm",
            !category && "bg-tastelab-orange text-tastelab-white"
          )}
        >
          Semua
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/menu?category=${c.slug}`}
            className={cn(
              "brutal-btn bg-tastelab-white px-4 py-2 text-sm",
              category === c.slug && "bg-tastelab-orange text-tastelab-white"
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {foods.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-tastelab-black/20 p-10 text-center text-tastelab-black/60">
          Belum ada produk di kategori ini.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {foods.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      )}
    </div>
  );
}
