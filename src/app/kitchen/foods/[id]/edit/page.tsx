import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireKitchen } from "@/lib/auth-utils";
import {
  getAllCategoriesForKitchen,
  getAllNutritionTypesForKitchen,
  getFoodByIdForKitchen,
} from "@/services/catalog.service";
import { FoodForm } from "@/components/kitchen/food-form";

export const metadata: Metadata = { title: "Edit Produk" };

export default async function EditFoodPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { kitchenProfile } = await requireKitchen();

  const [categories, nutritionTypes, food] = await Promise.all([
    getAllCategoriesForKitchen(kitchenProfile.brandId),
    getAllNutritionTypesForKitchen(kitchenProfile.brandId),
    getFoodByIdForKitchen(kitchenProfile.brandId, id),
  ]);

  if (!food) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-extrabold">Edit Produk</h1>
        <p className="text-tastelab-black/60">Perbarui informasi {food.name}.</p>
      </div>
      <FoodForm
        mode="edit"
        foodId={food.id}
        categories={categories}
        nutritionTypes={nutritionTypes}
        defaultValues={{
          name: food.name,
          categoryId: food.categoryId,
          description: food.description,
          type: food.type,
          isActive: food.isActive,
          images: food.images.map((img) => ({
            url: img.url,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder,
          })),
          nutrition: food.nutrition.map((n) => ({
            nutritionTypeId: n.nutritionTypeId,
            value: n.value,
            unit: n.unit,
            displayOrder: n.displayOrder,
          })),
        }}
      />
    </div>
  );
}
