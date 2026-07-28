import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun TasteLab untuk memberi rating dan menulis ulasan.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const { redirect, error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="brutal-card p-8">
        <h1 className="font-heading text-3xl font-extrabold">Masuk</h1>
        <p className="mt-1 text-sm text-tastelab-black/60">
          Masuk untuk memberi rating dan menulis ulasan produk.
        </p>
        {error === "kitchen_not_provisioned" && (
          <p className="mt-4 rounded-lg border-2 border-red-500 bg-red-50 p-3 text-sm text-red-700">
            Akun Kitchen kamu belum terhubung ke brand manapun. Hubungi administrator.
          </p>
        )}
        <div className="mt-6">
          <LoginForm redirectTo={redirect} />
        </div>
        <p className="mt-6 text-center text-sm text-tastelab-black/70">
          Belum punya akun?{" "}
          <Link href="/register" className="font-bold text-tastelab-orange-dark hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
