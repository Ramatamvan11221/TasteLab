import { prisma } from "@/lib/prisma";
import { SITE_CONFIG } from "@/constants/site";
import type { FoodCardData, FoodDetailData, ReviewWithAuthor } from "@/types";

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Returns all active foods for the seeded brand, each with a computed
 * average rating and rating count. Used by the public Menu page.
 */
export async function getMenuFoods(categorySlug?: string): Promise<FoodCardData[]> {
  const brand = await prisma.brand.findUnique({ where: { slug: SITE_CONFIG.brandSlug } });
  if (!brand) return [];

  const foods = await prisma.food.findMany({
    where: {
      brandId: brand.id,
      isActive: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      nutrition: { include: { nutritionType: true }, orderBy: { displayOrder: "asc" } },
      category: true,
      ratings: { select: { value: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return foods.map((food) => ({
    ...food,
    averageRating: average(food.ratings.map((r) => r.value)),
    ratingCount: food.ratings.length,
  }));
}

export async function getAllCategories() {
  const brand = await prisma.brand.findUnique({ where: { slug: SITE_CONFIG.brandSlug } });
  if (!brand) return [];
  return prisma.category.findMany({
    where: { brandId: brand.id },
    orderBy: { name: "asc" },
  });
}

/**
 * Fetches a single food by slug with full detail: images, ordered
 * nutrition, all ratings (for average + distribution), and PUBLIC,
 * non-hidden reviews only. Private/hidden reviews are never returned by
 * this function — Kitchen-side queries use a separate service.
 */
export async function getFoodBySlug(
  slug: string,
  currentUserId?: string
): Promise<FoodDetailData | null> {
  const brand = await prisma.brand.findUnique({ where: { slug: SITE_CONFIG.brandSlug } });
  if (!brand) return null;

  const food = await prisma.food.findUnique({
    where: { brandId_slug: { brandId: brand.id, slug } },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      nutrition: { include: { nutritionType: true }, orderBy: { displayOrder: "asc" } },
      category: true,
      ratings: true,
      reviews: {
        where: {
          isHidden: false,
          OR: [
            { visibility: "PUBLIC" },
            // A user always sees their own review even if marked private
            ...(currentUserId ? [{ visibility: "PRIVATE" as const, userId: currentUserId }] : []),
          ],
        },
        include: { user: { select: { id: true, name: true, image: true } }, rating: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!food || !food.isActive) return null;

  const ratingValues = food.ratings.map((r) => r.value);
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const v of ratingValues) {
    if (v >= 1 && v <= 5) distribution[v as 1 | 2 | 3 | 4 | 5]++;
  }

  return {
    ...food,
    averageRating: average(ratingValues),
    ratingDistribution: distribution,
    reviews: food.reviews as ReviewWithAuthor[],
  };
}

/**
 * Returns the current user's own rating + review for a given food (used to
 * pre-fill the "your review" section and to distinguish it from the public
 * reviews list on the Food Detail page).
 */
export async function getUserFeedbackForFood(userId: string, foodId: string) {
  const [rating, review] = await Promise.all([
    prisma.rating.findUnique({ where: { userId_foodId: { userId, foodId } } }),
    prisma.review.findUnique({ where: { userId_foodId: { userId, foodId } } }),
  ]);
  return { rating, review };
}

export async function getAllCategoriesForKitchen(brandId: string) {
  return prisma.category.findMany({ where: { brandId }, orderBy: { name: "asc" } });
}

export async function getAllNutritionTypesForKitchen(brandId: string) {
  return prisma.nutritionType.findMany({ where: { brandId }, orderBy: { name: "asc" } });
}

export async function getFoodsForKitchen(brandId: string) {
  return prisma.food.findMany({
    where: { brandId },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      _count: { select: { ratings: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFoodByIdForKitchen(brandId: string, foodId: string) {
  return prisma.food.findFirst({
    where: { id: foodId, brandId },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      nutrition: { include: { nutritionType: true }, orderBy: { displayOrder: "asc" } },
    },
  });
}
