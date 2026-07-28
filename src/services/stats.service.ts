import { prisma } from "@/lib/prisma";
import { startOfWeek, subWeeks, format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { DashboardStats, ReviewWithAuthor } from "@/types";

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export async function getDashboardStats(brandId: string): Promise<DashboardStats> {
  const [totalFoods, totalCategories, foods, recentReviewsRaw] = await Promise.all([
    prisma.food.count({ where: { brandId } }),
    prisma.category.count({ where: { brandId } }),
    prisma.food.findMany({
      where: { brandId },
      select: {
        id: true,
        name: true,
        ratings: { select: { value: true } },
        reviews: { select: { id: true, isHidden: true } },
      },
    }),
    prisma.review.findMany({
      where: { food: { brandId }, isHidden: false },
      include: { user: { select: { id: true, name: true, image: true } }, rating: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const allRatingValues = foods.flatMap((f) => f.ratings.map((r) => r.value));
  const totalRatings = allRatingValues.length;
  const totalReviews = foods.reduce((sum, f) => sum + f.reviews.length, 0);
  const overallAverageRating = average(allRatingValues);

  const foodsWithAvg = foods
    .map((f) => ({
      id: f.id,
      name: f.name,
      averageRating: average(f.ratings.map((r) => r.value)),
      ratingCount: f.ratings.length,
      reviewCount: f.reviews.length,
    }))
    .filter((f) => f.ratingCount > 0);

  const topRatedFood =
    foodsWithAvg.length > 0
      ? foodsWithAvg.reduce((a, b) => (b.averageRating > a.averageRating ? b : a))
      : null;

  const lowestRatedFood =
    foodsWithAvg.length > 0
      ? foodsWithAvg.reduce((a, b) => (b.averageRating < a.averageRating ? b : a))
      : null;

  const mostReviewedFood =
    foods.length > 0
      ? foods
          .map((f) => ({ id: f.id, name: f.name, reviewCount: f.reviews.length }))
          .reduce((a, b) => (b.reviewCount > a.reviewCount ? b : a))
      : null;

  // Review volume for the last 8 weeks
  const reviewVolumeByWeek: { week: string; count: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
    const weekEnd = startOfWeek(subWeeks(new Date(), i - 1), { weekStartsOn: 1 });
    const count = await prisma.review.count({
      where: {
        food: { brandId },
        createdAt: { gte: weekStart, lt: weekEnd },
      },
    });
    reviewVolumeByWeek.push({
      week: format(weekStart, "d MMM", { locale: idLocale }),
      count,
    });
  }

  return {
    totalFoods,
    totalCategories,
    totalRatings,
    totalReviews,
    overallAverageRating,
    topRatedFood:
      topRatedFood && topRatedFood.ratingCount > 0
        ? { id: topRatedFood.id, name: topRatedFood.name, averageRating: topRatedFood.averageRating }
        : null,
    lowestRatedFood:
      lowestRatedFood && lowestRatedFood.ratingCount > 0
        ? { id: lowestRatedFood.id, name: lowestRatedFood.name, averageRating: lowestRatedFood.averageRating }
        : null,
    mostReviewedFood:
      mostReviewedFood && mostReviewedFood.reviewCount > 0 ? mostReviewedFood : null,
    recentReviews: recentReviewsRaw as ReviewWithAuthor[],
    reviewVolumeByWeek,
  };
}

export async function getReviewsForKitchen(brandId: string) {
  return prisma.review.findMany({
    where: { food: { brandId } },
    include: {
      user: { select: { id: true, name: true, image: true } },
      rating: true,
      food: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
