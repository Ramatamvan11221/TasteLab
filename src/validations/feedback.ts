import { z } from "zod";
import { MAX_REVIEW_LENGTH, MIN_REVIEW_LENGTH } from "@/constants/site";

export const ratingSchema = z.object({
  foodId: z.string().min(1),
  value: z.coerce
    .number()
    .int("Rating harus bilangan bulat")
    .min(1, "Rating minimal 1")
    .max(5, "Rating maksimal 5"),
});
export type RatingInput = z.infer<typeof ratingSchema>;

export const reviewSchema = z.object({
  foodId: z.string().min(1),
  ratingValue: z.coerce.number().int().min(1).max(5),
  content: z
    .string()
    .min(MIN_REVIEW_LENGTH, `Ulasan minimal ${MIN_REVIEW_LENGTH} karakter`)
    .max(MAX_REVIEW_LENGTH, `Ulasan maksimal ${MAX_REVIEW_LENGTH} karakter`),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

export const moderateReviewSchema = z.object({
  reviewId: z.string().min(1),
  isHidden: z.boolean(),
});
export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>;
