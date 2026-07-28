import type { Metadata } from "next";
import { requireKitchen } from "@/lib/auth-utils";
import { getAllCategoriesForKitchen } from "@/services/catalog.service";
import { CategoryManager } from "@/components/kitchen/category-manager";

export const metadata: Metadata = { title: "Kelola Kategori" };

export default async function KitchenCategoriesPage() {
  const { kitchenProfile } = await requireKitchen();
  const categories = await getAllCategoriesForKitchen(kitchenProfile.brandId);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-extrabold">Kategori</h1>
        <p className="text-tastelab-black/60">Kelola kategori produk (daftar datar, tanpa sub-kategori).</p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
