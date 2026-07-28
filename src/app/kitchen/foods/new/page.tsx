import type { Metadata } from "next";
import { requireKitchen } from "@/lib/auth-utils";
import { getAllCategoriesForKitchen, getAllNutritionTypesForKitchen } from "@/services/catalog.service";
import { FoodForm } from "@/components/kitchen/food-form";

export const metadata: Metadata = { title: "Tambah Produk" };

export default async function NewFoodPage() {
  const { kitchenProfile } = await requireKitchen();
  const [categories, nutritionTypes] = await Promise.all([
    getAllCategoriesForKitchen(kitchenProfile.brandId),
    getAllNutritionTypesForKitchen(kitchenProfile.brandId),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-extrabold">Tambah Produk</h1>
        <p className="text-tastelab-black/60">Lengkapi informasi produk baru.</p>
      </div>
      <FoodForm mode="create" categories={categories} nutritionTypes={nutritionTypes} />
    </div>
  );
}
