import type { Metadata } from "next";
import { requireKitchen } from "@/lib/auth-utils";
import { getAllNutritionTypesForKitchen } from "@/services/catalog.service";
import { NutritionTypeManager } from "@/components/kitchen/nutrition-type-manager";

export const metadata: Metadata = { title: "Kelola Jenis Nutrisi" };

export default async function KitchenNutritionTypesPage() {
  const { kitchenProfile } = await requireKitchen();
  const nutritionTypes = await getAllNutritionTypesForKitchen(kitchenProfile.brandId);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-extrabold">Jenis Nutrisi</h1>
        <p className="text-tastelab-black/60">Daftar induk nutrisi dinamis yang dapat dipakai di semua produk.</p>
      </div>
      <NutritionTypeManager nutritionTypes={nutritionTypes} />
    </div>
  );
}
