"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getCurrentSession } from "@/lib/auth-utils";
import { updateProfileSchema, changePasswordSchema } from "@/validations/auth";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const session = await getCurrentSession();
  if (!session?.user) return { success: false, error: "Anda harus login." };

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      ...(parsed.data.image ? { image: parsed.data.image } : {}),
    },
  });

  revalidatePath("/profile");
  return { success: true, data: undefined };
}

/**
 * Change password — Email accounts only (FR-1.5). Delegates hashing/
 * verification to Better Auth's own changePassword API rather than
 * touching the Account.password hash directly.
 */
export async function changePassword(input: unknown): Promise<ActionResult> {
  const session = await getCurrentSession();
  if (!session?.user) return { success: false, error: "Anda harus login." };

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, providerId: "credential" },
  });
  if (!account) {
    return {
      success: false,
      error: "Akun Google tidak memiliki kata sandi untuk diubah.",
    };
  }

  try {
    await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
      },
    });
  } catch {
    return { success: false, error: "Kata sandi saat ini salah." };
  }

  return { success: true, data: undefined };
}
