"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp, signIn } from "@/lib/auth-client";
import { registerSchema, type RegisterInput } from "@/validations/auth";

export function RegisterForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const target = redirectTo && redirectTo.startsWith("/") ? redirectTo : "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterInput) {
    setIsSubmitting(true);
    const { error } = await signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    });
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message ?? "Gagal membuat akun. Coba lagi.");
      return;
    }

    toast.success("Akun berhasil dibuat!");
    router.push(target);
    router.refresh();
  }

  async function handleGoogleRegister() {
    await signIn.social({ provider: "google", callbackURL: target });
  }

  return (
    <div className="space-y-5">
      <Button variant="outline" className="w-full" onClick={handleGoogleRegister} type="button">
        <Chrome className="size-4" /> Daftar dengan Google
      </Button>

      <div className="flex items-center gap-3 text-xs font-bold text-tastelab-black/40">
        <div className="h-px flex-1 bg-tastelab-black/20" />
        ATAU
        <div className="h-px flex-1 bg-tastelab-black/20" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="name">Nama</Label>
          <Input id="name" autoComplete="name" {...register("name")} />
          {errors.name && <p className="text-xs font-semibold text-red-600">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email && <p className="text-xs font-semibold text-red-600">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Kata Sandi</Label>
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
          {errors.password && (
            <p className="text-xs font-semibold text-red-600">{errors.password.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Memproses..." : "Daftar"}
        </Button>
      </form>
    </div>
  );
}
