"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireKitchen } from "@/lib/auth-utils";
import { moderateReviewSchema } from "@/validations/feedback";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Kitchen moderation: hides or restores a review's TEXT only. Per the
 * approved architecture, this can never touch the linked Rating — the
 * numeric score always counts toward the public average regardless of
 * moderation state (FR-4.4 / FR-5.5).
 */
export async function moderateReview(input: unknown): Promise<ActionResult> {
  const { kitchenProfile } = await requireKitchen();

  const parsed = moderateReviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const review = await prisma.review.findFirst({
    where: { id: parsed.data.reviewId, food: { brandId: kitchenProfile.brandId } },
    include: { food: true },
  });
  if (!review) return { success: false, error: "Ulasan tidak ditemukan." };

  await prisma.review.update({
    where: { id: review.id },
    data: { isHidden: parsed.data.isHidden },
  });

  revalidatePath("/kitchen/reviews");
  revalidatePath(`/food/${review.food.slug}`);

  return { success: true, data: undefined };
}
