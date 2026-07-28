"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-utils";
import { ratingSchema, reviewSchema } from "@/validations/feedback";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

async function requireCustomerSession() {
  const session = await getCurrentSession();
  if (!session?.user) {
    return null;
  }
  return session.user;
}

async function getFoodSlug(foodId: string) {
  const food = await prisma.food.findUnique({ where: { id: foodId }, select: { slug: true } });
  return food?.slug ?? null;
}

/**
 * Creates or updates the current user's rating for a food.
 * Enforces the "one rating per (user, food)" rule via upsert on the
 * unique @@unique([userId, foodId]) constraint.
 */
export async function upsertRating(input: unknown): Promise<ActionResult<{ value: number }>> {
  const user = await requireCustomerSession();
  if (!user) return { success: false, error: "Anda harus login untuk memberi rating." };

  const parsed = ratingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const { foodId, value } = parsed.data;

  await prisma.rating.upsert({
    where: { userId_foodId: { userId: user.id, foodId } },
    update: { value },
    create: { userId: user.id, foodId, value },
  });

  const slug = await getFoodSlug(foodId);
  if (slug) revalidatePath(`/food/${slug}`);

  return { success: true, data: { value } };
}

/**
 * Deletes the current user's rating for a food. Cascades to delete the
 * linked review as well (a review cannot exist without its rating —
 * enforced at the schema level via onDelete: Cascade on Review.ratingId).
 */
export async function deleteRating(foodId: string): Promise<ActionResult> {
  const user = await requireCustomerSession();
  if (!user) return { success: false, error: "Anda harus login." };

  await prisma.rating.deleteMany({ where: { userId: user.id, foodId } });

  const slug = await getFoodSlug(foodId);
  if (slug) revalidatePath(`/food/${slug}`);

  return { success: true, data: undefined };
}

/**
 * Creates or updates the current user's review for a food. A review always
 * requires a rating to exist first/simultaneously (FR-5.1) — this action
 * upserts both the Rating and the Review in a single transaction so a
 * customer can submit stars + text together from one form.
 */
export async function upsertReview(input: unknown): Promise<ActionResult> {
  const user = await requireCustomerSession();
  if (!user) return { success: false, error: "Anda harus login untuk menulis ulasan." };

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const { foodId, ratingValue, content, visibility } = parsed.data;

  await prisma.$transaction(async (tx) => {
    const rating = await tx.rating.upsert({
      where: { userId_foodId: { userId: user.id, foodId } },
      update: { value: ratingValue },
      create: { userId: user.id, foodId, value: ratingValue },
    });

    await tx.review.upsert({
      where: { userId_foodId: { userId: user.id, foodId } },
      update: { content, visibility, ratingId: rating.id },
      create: {
        userId: user.id,
        foodId,
        ratingId: rating.id,
        content,
        visibility,
      },
    });
  });

  const slug = await getFoodSlug(foodId);
  if (slug) revalidatePath(`/food/${slug}`);

  return { success: true, data: undefined };
}

/**
 * Deletes the current user's own review (text only — the linked rating is
 * preserved, since a customer deleting their written review shouldn't
 * silently also erase their star rating; they can delete the rating
 * separately via deleteRating if they want both gone).
 */
export async function deleteReview(foodId: string): Promise<ActionResult> {
  const user = await requireCustomerSession();
  if (!user) return { success: false, error: "Anda harus login." };

  await prisma.review.deleteMany({ where: { userId: user.id, foodId } });

  const slug = await getFoodSlug(foodId);
  if (slug) revalidatePath(`/food/${slug}`);

  return { success: true, data: undefined };
}
