import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-utils";
import { ProfileForm } from "@/components/auth/profile-form";

export const metadata: Metadata = {
  title: "Profil Saya",
};

export default async function ProfilePage() {
  const user = await requireUser("/profile");

  const [fullUser, credentialAccount] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: user.id } }),
    prisma.account.findFirst({ where: { userId: user.id, providerId: "credential" } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 font-heading text-3xl font-extrabold">Profil Saya</h1>
      <ProfileForm
        user={{
          id: fullUser.id,
          name: fullUser.name,
          email: fullUser.email,
          image: fullUser.image,
          createdAt: fullUser.createdAt,
        }}
        hasPasswordAccount={Boolean(credentialAccount)}
      />
    </div>
  );
}
