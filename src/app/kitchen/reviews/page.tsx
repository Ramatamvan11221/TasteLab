import type { Metadata } from "next";
import Link from "next/link";
import { requireKitchen } from "@/lib/auth-utils";
import { getReviewsForKitchen } from "@/services/stats.service";
import { Card } from "@/components/ui/card";
import { ModerationRow } from "@/components/kitchen/moderation-row";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Ulasan & Moderasi" };

export default async function KitchenReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: "all" | "public" | "private" }>;
}) {
  const { filter = "all" } = await searchParams;
  const { kitchenProfile } = await requireKitchen();
  const allReviews = await getReviewsForKitchen(kitchenProfile.brandId);

  const reviews =
    filter === "public"
      ? allReviews.filter((r) => r.visibility === "PUBLIC")
      : filter === "private"
        ? allReviews.filter((r) => r.visibility === "PRIVATE")
        : allReviews;

  const filters: { label: string; value: "all" | "public" | "private" }[] = [
    { label: "Semua", value: "all" },
    { label: "Publik", value: "public" },
    { label: "Privat", value: "private" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-extrabold">Ulasan & Moderasi</h1>
        <p className="text-tastelab-black/60">
          Sembunyikan teks ulasan yang tidak pantas. Rating bintang tetap dihitung secara publik meskipun
          teksnya disembunyikan.
        </p>
      </div>

      <div className="flex gap-2">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={`/kitchen/reviews?filter=${f.value}`}
            className={cn(
              "brutal-btn bg-tastelab-white px-4 py-2 text-sm",
              filter === f.value && "bg-tastelab-orange text-tastelab-white"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <Card className="p-6">
        {reviews.length === 0 ? (
          <p className="py-6 text-center text-sm text-tastelab-black/50">Tidak ada ulasan untuk filter ini.</p>
        ) : (
          <ul>
            {reviews.map((review) => (
              <ModerationRow key={review.id} review={review} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
