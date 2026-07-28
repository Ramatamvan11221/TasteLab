import Image from "next/image";
import { Lock } from "lucide-react";
import { StarRatingDisplay } from "@/components/feedback/star-rating-display";
import { Badge } from "@/components/ui/badge";
import { formatDateID } from "@/lib/utils";
import type { ReviewWithAuthor } from "@/types";

export function ReviewList({
  reviews,
  currentUserId,
}: {
  reviews: ReviewWithAuthor[];
  currentUserId?: string;
}) {
  if (reviews.length === 0) {
    return (
      <p className="rounded-xl border-2 border-dashed border-tastelab-black/20 p-6 text-center text-sm text-tastelab-black/60">
        Belum ada ulasan untuk produk ini. Jadilah yang pertama!
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map((review) => {
        const isOwn = review.userId === currentUserId;
        return (
          <li key={review.id} className="brutal-card p-4">
            <div className="flex items-start gap-3">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-full border-2 border-tastelab-black bg-tastelab-yellow-soft">
                {review.user.image ? (
                  <Image src={review.user.image} alt={review.user.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center font-heading text-sm font-bold">
                    {review.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{review.user.name}</span>
                  {isOwn && <Badge variant="orange">Ulasan Kamu</Badge>}
                  {review.visibility === "PRIVATE" && (
                    <Badge variant="muted" className="gap-1">
                      <Lock className="size-3" /> Privat
                    </Badge>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <StarRatingDisplay value={review.rating.value} showValue={false} size="sm" />
                  <span className="text-xs text-tastelab-black/50">{formatDateID(review.createdAt)}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-tastelab-black/85">{review.content}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
