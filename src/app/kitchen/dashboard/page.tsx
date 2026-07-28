import type { Metadata } from "next";
import Image from "next/image";
import { Package, Star, MessageSquare, TrendingUp, TrendingDown, Flame } from "lucide-react";
import { requireKitchen } from "@/lib/auth-utils";
import { getDashboardStats } from "@/services/stats.service";
import { StatCard } from "@/components/kitchen/stat-card";
import { ReviewVolumeChart } from "@/components/kitchen/review-volume-chart";
import { Card } from "@/components/ui/card";
import { StarRatingDisplay } from "@/components/feedback/star-rating-display";
import { Badge } from "@/components/ui/badge";
import { formatDateID, formatRating } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard Kitchen" };

export default async function KitchenDashboardPage() {
  const { kitchenProfile } = await requireKitchen();
  const stats = await getDashboardStats(kitchenProfile.brandId);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="font-heading text-2xl font-extrabold md:text-3xl">Dashboard</h1>
        <p className="text-sm text-tastelab-black/60 md:text-base">
          Ringkasan performa katalog dan feedback pelanggan.
        </p>
      </div>

      {/* STATS CARDS - PAKE FLEX WRAP BIAR AMAN */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[140px]">
          <StatCard label="Total Produk" value={stats.totalFoods} icon={Package} />
        </div>
        <div className="flex-1 min-w-[140px]">
          <StatCard
            label="Rata-rata Rating"
            value={stats.overallAverageRating > 0 ? formatRating(stats.overallAverageRating) : "-"}
            icon={Star}
            sub={`${stats.totalRatings} rating`}
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <StatCard label="Total Ulasan" value={stats.totalReviews} icon={MessageSquare} />
        </div>
        <div className="flex-1 min-w-[140px]">
          <StatCard label="Total Kategori" value={stats.totalCategories} icon={Package} />
        </div>
      </div>

      {/* TOP / BOTTOM PRODUCTS - PAKE FLEX WRAP */}
      <div className="flex flex-wrap gap-4">
        <Card className="flex-1 min-w-[200px] p-4 md:p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-tastelab-black/60">
            <TrendingUp className="size-4 text-green-600" /> Produk Rating Tertinggi
          </div>
          {stats.topRatedFood ? (
            <>
              <p className="mt-2 font-heading text-lg font-extrabold">{stats.topRatedFood.name}</p>
              <StarRatingDisplay value={stats.topRatedFood.averageRating} showValue size="sm" />
            </>
          ) : (
            <p className="mt-2 text-sm text-tastelab-black/50">Belum ada data</p>
          )}
        </Card>

        <Card className="flex-1 min-w-[200px] p-4 md:p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-tastelab-black/60">
            <TrendingDown className="size-4 text-red-500" /> Produk Rating Terendah
          </div>
          {stats.lowestRatedFood ? (
            <>
              <p className="mt-2 font-heading text-lg font-extrabold">{stats.lowestRatedFood.name}</p>
              <StarRatingDisplay value={stats.lowestRatedFood.averageRating} showValue size="sm" />
            </>
          ) : (
            <p className="mt-2 text-sm text-tastelab-black/50">Belum ada data</p>
          )}
        </Card>

        <Card className="flex-1 min-w-[200px] p-4 md:p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-tastelab-black/60">
            <Flame className="size-4 text-tastelab-orange" /> Paling Banyak Diulas
          </div>
          {stats.mostReviewedFood ? (
            <>
              <p className="mt-2 font-heading text-lg font-extrabold">{stats.mostReviewedFood.name}</p>
              <p className="text-sm text-tastelab-black/60">{stats.mostReviewedFood.reviewCount} ulasan</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-tastelab-black/50">Belum ada data</p>
          )}
        </Card>
      </div>

      {/* CHART */}
      <Card className="p-4 md:p-5">
        <h2 className="font-heading text-lg font-extrabold">Volume Ulasan (8 Minggu Terakhir)</h2>
        <div className="mt-4">
          <ReviewVolumeChart data={stats.reviewVolumeByWeek} />
        </div>
      </Card>

      {/* RECENT REVIEWS */}
      <Card className="p-4 md:p-5">
        <h2 className="font-heading text-lg font-extrabold">Ulasan Terbaru</h2>
        <ul className="mt-4 divide-y-2 divide-tastelab-black/10">
          {stats.recentReviews.length === 0 && (
            <p className="py-4 text-sm text-tastelab-black/50">Belum ada ulasan.</p>
          )}
          {stats.recentReviews.map((review) => (
            <li key={review.id} className="flex items-start gap-3 py-4">
              <div className="relative size-9 shrink-0 overflow-hidden rounded-full border-2 border-tastelab-black bg-tastelab-yellow-soft">
                {review.user.image ? (
                  <Image src={review.user.image} alt={review.user.name} fill className="object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{review.user.name}</span>
                  {review.visibility === "PRIVATE" && <Badge variant="muted">Privat</Badge>}
                  <StarRatingDisplay value={review.rating.value} showValue={false} size="sm" />
                  <span className="text-xs text-tastelab-black/50">{formatDateID(review.createdAt)}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-tastelab-black/75">{review.content}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}