import type {
  Food,
  FoodImage,
  FoodNutrition,
  NutritionType,
  Category,
  Rating,
  Review,
  ReviewVisibility,
  FoodType,
  User,
} from "@prisma/client";

export type FoodNutritionWithType = FoodNutrition & {
  nutritionType: NutritionType;
};

export type FoodWithRelations = Food & {
  images: FoodImage[];
  nutrition: FoodNutritionWithType[];
  category: Category;
};

export type FoodCardData = FoodWithRelations & {
  averageRating: number;
  ratingCount: number;
};

export type ReviewWithAuthor = Review & {
  user: Pick<User, "id" | "name" | "image">;
  rating: Rating;
};

export type FoodDetailData = FoodWithRelations & {
  ratings: Rating[];
  reviews: ReviewWithAuthor[];
  averageRating: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

export type CurrentUserFeedback = {
  rating: Rating | null;
  review: Review | null;
};

export interface DashboardStats {
  totalFoods: number;
  totalCategories: number;
  totalRatings: number;
  totalReviews: number;
  overallAverageRating: number;
  topRatedFood: { id: string; name: string; averageRating: number } | null;
  lowestRatedFood: { id: string; name: string; averageRating: number } | null;
  mostReviewedFood: { id: string; name: string; reviewCount: number } | null;
  recentReviews: ReviewWithAuthor[];
  reviewVolumeByWeek: { week: string; count: number }[];
}

export type { FoodType, ReviewVisibility };
