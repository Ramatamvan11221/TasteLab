"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { User as UserIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadButton } from "@/components/uploadthing";
import { updateProfile, changePassword } from "@/actions/profile.actions";
import { signOut } from "@/lib/auth-client";
import {
  updateProfileSchema,
  changePasswordSchema,
  type UpdateProfileInput,
  type ChangePasswordInput,
} from "@/validations/auth";
import { formatDateID } from "@/lib/utils";

interface ProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    createdAt: Date;
  };
  hasPasswordAccount: boolean;
}

export function ProfileForm({ user, hasPasswordAccount }: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState(user.image ?? "");

  const profileForm = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user.name, image: user.image ?? "" },
  });

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  function onProfileSubmit(values: UpdateProfileInput) {
    startTransition(async () => {
      const result = await updateProfile({ ...values, image: imageUrl });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Profil berhasil diperbarui.");
      router.refresh();
    });
  }

  function onPasswordSubmit(values: ChangePasswordInput) {
    startTransition(async () => {
      const result = await changePassword(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Kata sandi berhasil diubah.");
      passwordForm.reset();
    });
  }

  async function handleLogout() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {/* Basic info */}
      <div className="brutal-card p-6">
        <h2 className="font-heading text-xl font-extrabold">Informasi Profil</h2>

        <div className="mt-4 flex items-center gap-4">
          <div className="relative size-20 overflow-hidden rounded-full border-3 border-tastelab-black bg-tastelab-yellow-soft">
            {imageUrl ? (
              <Image src={imageUrl} alt={user.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <UserIcon className="size-8 text-tastelab-black/40" />
              </div>
            )}
          </div>
          <UploadButton
            endpoint="profileImageUploader"
            onClientUploadComplete={(res) => {
              if (res?.[0]?.url) {
                setImageUrl(res[0].url);
                toast.success("Foto berhasil diunggah.");
              }
            }}
            onUploadError={(error) => {
              // 🔥 FIX: Bungkus toast.error biar gak return value
              toast.error(`Gagal unggah: ${error.message}`);
            }}
          />
        </div>

        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="mt-6 space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama</Label>
            <Input id="name" {...profileForm.register("name")} />
            {profileForm.formState.errors.name && (
              <p className="text-xs font-semibold text-red-600">
                {profileForm.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={user.email} disabled />
          </div>
          <div className="space-y-1.5">
            <Label>Bergabung Sejak</Label>
            <Input value={formatDateID(user.createdAt)} disabled />
          </div>
          <Button type="submit" disabled={isPending}>
            Simpan Perubahan
          </Button>
        </form>
      </div>

      {/* Password */}
      {hasPasswordAccount && (
        <div className="brutal-card p-6">
          <h2 className="font-heading text-xl font-extrabold">Ubah Kata Sandi</h2>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="mt-4 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Kata Sandi Saat Ini</Label>
              <Input id="currentPassword" type="password" {...passwordForm.register("currentPassword")} />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-xs font-semibold text-red-600">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">Kata Sandi Baru</Label>
              <Input id="newPassword" type="password" {...passwordForm.register("newPassword")} />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-xs font-semibold text-red-600">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi Baru</Label>
              <Input id="confirmPassword" type="password" {...passwordForm.register("confirmPassword")} />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-xs font-semibold text-red-600">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" variant="secondary" disabled={isPending}>
              Ubah Kata Sandi
            </Button>
          </form>
        </div>
      )}

      <Button variant="destructive" onClick={handleLogout}>
        <LogOut className="size-4" /> Logout
      </Button>
    </div>
  );
}