"use server";

import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { requireKitchen } from "@/lib/auth-utils";
import { foodSchema, categorySchema, nutritionTypeSchema } from "@/validations/catalog";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

async function uniqueSlug(base: string, brandId: string, excludeId?: string) {
  const baseSlug = slugify(base, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.food.findUnique({
      where: { brandId_slug: { brandId, slug } },
    });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${baseSlug}-${++counter}`;
  }
}

// ---------------------------------------------------------------------------
// FOODS
// ---------------------------------------------------------------------------

export async function createFood(input: unknown): Promise<ActionResult<{ id: string }>> {
  const { kitchenProfile } = await requireKitchen();

  const parsed = foodSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const data = parsed.data;

  const slug = await uniqueSlug(data.name, kitchenProfile.brandId);

  const food = await prisma.food.create({
    data: {
      brandId: kitchenProfile.brandId,
      categoryId: data.categoryId,
      name: data.name,
      slug,
      description: data.description,
      type: data.type,
      isActive: data.isActive,
      images: {
        create: data.images.map((img) => ({
          url: img.url,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder,
        })),
      },
      nutrition: {
        create: data.nutrition.map((n) => ({
          nutritionTypeId: n.nutritionTypeId,
          value: n.value,
          unit: n.unit,
          displayOrder: n.displayOrder,
        })),
      },
    },
  });

  revalidatePath("/kitchen/foods");
  revalidatePath("/menu");

  return { success: true, data: { id: food.id } };
}

export async function updateFood(foodId: string, input: unknown): Promise<ActionResult> {
  const { kitchenProfile } = await requireKitchen();

  const existing = await prisma.food.findFirst({
    where: { id: foodId, brandId: kitchenProfile.brandId },
  });
  if (!existing) return { success: false, error: "Produk tidak ditemukan." };

  const parsed = foodSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const data = parsed.data;

  const slug =
    data.name === existing.name
      ? existing.slug
      : await uniqueSlug(data.name, kitchenProfile.brandId, foodId);

  await prisma.$transaction(async (tx) => {
    await tx.food.update({
      where: { id: foodId },
      data: {
        categoryId: data.categoryId,
        name: data.name,
        slug,
        description: data.description,
        type: data.type,
        isActive: data.isActive,
      },
    });

    // Replace images and nutrition wholesale — simplest consistent strategy
    // for a Kitchen-managed edit form that resubmits the full current state.
    await tx.foodImage.deleteMany({ where: { foodId } });
    await tx.foodImage.createMany({
      data: data.images.map((img) => ({
        foodId,
        url: img.url,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      })),
    });

    await tx.foodNutrition.deleteMany({ where: { foodId } });
    if (data.nutrition.length > 0) {
      await tx.foodNutrition.createMany({
        data: data.nutrition.map((n) => ({
          foodId,
          nutritionTypeId: n.nutritionTypeId,
          value: n.value,
          unit: n.unit,
          displayOrder: n.displayOrder,
        })),
      });
    }
  });

  revalidatePath("/kitchen/foods");
  revalidatePath(`/food/${slug}`);
  revalidatePath("/menu");

  return { success: true, data: undefined };
}

export async function deleteFood(foodId: string): Promise<ActionResult> {
  const { kitchenProfile } = await requireKitchen();

  const existing = await prisma.food.findFirst({
    where: { id: foodId, brandId: kitchenProfile.brandId },
  });
  if (!existing) return { success: false, error: "Produk tidak ditemukan." };

  await prisma.food.delete({ where: { id: foodId } });

  revalidatePath("/kitchen/foods");
  revalidatePath("/menu");

  return { success: true, data: undefined };
}

export async function toggleFoodActive(foodId: string, isActive: boolean): Promise<ActionResult> {
  const { kitchenProfile } = await requireKitchen();

  const existing = await prisma.food.findFirst({
    where: { id: foodId, brandId: kitchenProfile.brandId },
  });
  if (!existing) return { success: false, error: "Produk tidak ditemukan." };

  await prisma.food.update({ where: { id: foodId }, data: { isActive } });

  revalidatePath("/kitchen/foods");
  revalidatePath("/menu");

  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// CATEGORIES
// ---------------------------------------------------------------------------

export async function createCategory(input: unknown): Promise<ActionResult<{ id: string }>> {
  const { kitchenProfile } = await requireKitchen();

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const slug = slugify(parsed.data.name, { lower: true, strict: true });

  const existing = await prisma.category.findUnique({
    where: { brandId_slug: { brandId: kitchenProfile.brandId, slug } },
  });
  if (existing) return { success: false, error: "Kategori dengan nama ini sudah ada." };

  const category = await prisma.category.create({
    data: { brandId: kitchenProfile.brandId, name: parsed.data.name, slug },
  });

  revalidatePath("/kitchen/categories");
  return { success: true, data: { id: category.id } };
}

export async function updateCategory(categoryId: string, input: unknown): Promise<ActionResult> {
  const { kitchenProfile } = await requireKitchen();

  const existing = await prisma.category.findFirst({
    where: { id: categoryId, brandId: kitchenProfile.brandId },
  });
  if (!existing) return { success: false, error: "Kategori tidak ditemukan." };

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const slug = slugify(parsed.data.name, { lower: true, strict: true });

  await prisma.category.update({
    where: { id: categoryId },
    data: { name: parsed.data.name, slug },
  });

  revalidatePath("/kitchen/categories");
  return { success: true, data: undefined };
}

export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  const { kitchenProfile } = await requireKitchen();

  const existing = await prisma.category.findFirst({
    where: { id: categoryId, brandId: kitchenProfile.brandId },
    include: { _count: { select: { foods: true } } },
  });
  if (!existing) return { success: false, error: "Kategori tidak ditemukan." };
  if (existing._count.foods > 0) {
    return {
      success: false,
      error: "Kategori tidak bisa dihapus karena masih memiliki produk. Pindahkan produk terlebih dahulu.",
    };
  }

  await prisma.category.delete({ where: { id: categoryId } });

  revalidatePath("/kitchen/categories");
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// NUTRITION TYPES (master lookup)
// ---------------------------------------------------------------------------

export async function createNutritionType(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const { kitchenProfile } = await requireKitchen();

  const parsed = nutritionTypeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const existing = await prisma.nutritionType.findUnique({
    where: { brandId_name: { brandId: kitchenProfile.brandId, name: parsed.data.name } },
  });
  if (existing) return { success: false, error: "Jenis nutrisi ini sudah ada." };

  const nutritionType = await prisma.nutritionType.create({
    data: {
      brandId: kitchenProfile.brandId,
      name: parsed.data.name,
      defaultUnit: parsed.data.defaultUnit,
    },
  });

  revalidatePath("/kitchen/nutrition-types");
  return { success: true, data: { id: nutritionType.id } };
}

export async function deleteNutritionType(nutritionTypeId: string): Promise<ActionResult> {
  const { kitchenProfile } = await requireKitchen();

  const existing = await prisma.nutritionType.findFirst({
    where: { id: nutritionTypeId, brandId: kitchenProfile.brandId },
    include: { _count: { select: { foodNutrition: true } } },
  });
  if (!existing) return { success: false, error: "Jenis nutrisi tidak ditemukan." };
  if (existing._count.foodNutrition > 0) {
    return {
      success: false,
      error: "Jenis nutrisi ini masih digunakan oleh produk dan tidak bisa dihapus.",
    };
  }

  await prisma.nutritionType.delete({ where: { id: nutritionTypeId } });

  revalidatePath("/kitchen/nutrition-types");
  return { success: true, data: undefined };
}
