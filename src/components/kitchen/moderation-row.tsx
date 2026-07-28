"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { Lock, EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRatingDisplay } from "@/components/feedback/star-rating-display";
import { moderateReview } from "@/actions/moderation.actions";
import { formatDateID, cn } from "@/lib/utils";
import type { ReviewWithAuthor } from "@/types";

type KitchenReview = ReviewWithAuthor & { food: { id: string; name: string; slug: string } };

export function ModerationRow({ review }: { review: KitchenReview }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggleHidden() {
    startTransition(async () => {
      const result = await moderateReview({ reviewId: review.id, isHidden: !review.isHidden });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(review.isHidden ? "Ulasan ditampilkan kembali." : "Teks ulasan disembunyikan.");
      router.refresh();
    });
  }

  return (
    <li className={cn("flex items-start gap-3 border-b-2 border-tastelab-black/10 py-4", review.isHidden && "opacity-60")}>
      <div className="relative size-10 shrink-0 overflow-hidden rounded-full border-2 border-tastelab-black bg-tastelab-yellow-soft">
        {review.user.image && <Image src={review.user.image} alt={review.user.name} fill className="object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold">{review.user.name}</span>
          <Link href={`/food/${review.food.slug}`} className="text-xs font-bold text-tastelab-orange-dark hover:underline">
            {review.food.name}
          </Link>
          {review.visibility === "PRIVATE" && (
            <Badge variant="muted" className="gap-1">
              <Lock className="size-3" /> Privat
            </Badge>
          )}
          {review.isHidden && <Badge variant="muted">Disembunyikan</Badge>}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <StarRatingDisplay value={review.rating.value} showValue={false} size="sm" />
          <span className="text-xs text-tastelab-black/50">{formatDateID(review.createdAt)}</span>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm text-tastelab-black/85">{review.content}</p>
      </div>
      <Button variant="outline" size="sm" onClick={toggleHidden} disabled={isPending}>
        {review.isHidden ? (
          <>
            <Eye className="size-4" /> Tampilkan
          </>
        ) : (
          <>
            <EyeOff className="size-4" /> Sembunyikan
          </>
        )}
      </Button>
    </li>
  );
}
