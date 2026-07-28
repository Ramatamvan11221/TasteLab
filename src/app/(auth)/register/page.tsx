import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Daftar",
  description: "Buat akun TasteLab untuk memberi rating dan menulis ulasan produk.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="brutal-card p-8">
        <h1 className="font-heading text-3xl font-extrabold">Daftar</h1>
        <p className="mt-1 text-sm text-tastelab-black/60">
          Buat akun untuk mulai memberi rating dan menulis ulasan.
        </p>
        <div className="mt-6">
          <RegisterForm redirectTo={redirect} />
        </div>
        <p className="mt-6 text-center text-sm text-tastelab-black/70">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-bold text-tastelab-orange-dark hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
