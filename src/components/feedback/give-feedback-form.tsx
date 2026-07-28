"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { StarRatingInput } from "@/components/feedback/star-rating-input";
import { upsertReview, deleteReview, upsertRating, deleteRating } from "@/actions/feedback.actions";
import { MAX_REVIEW_LENGTH } from "@/constants/site";
import type { Rating, Review } from "@prisma/client";

interface GiveFeedbackFormProps {
  foodId: string;
  foodSlug: string;
  isAuthenticated: boolean;
  existingRating: Rating | null;
  existingReview: Review | null;
}

const DRAFT_KEY_PREFIX = "tastelab_draft_";

export function GiveFeedbackForm({
  foodId,
  foodSlug,
  isAuthenticated,
  existingRating,
  existingReview,
}: GiveFeedbackFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [ratingValue, setRatingValue] = useState(existingRating?.value ?? 0);
  const [content, setContent] = useState(existingReview?.content ?? "");
  const [isPrivate, setIsPrivate] = useState(existingReview?.visibility === "PRIVATE");

  useEffect(() => {
    if (!isAuthenticated || typeof window === "undefined") return;
    const raw = sessionStorage.getItem(`${DRAFT_KEY_PREFIX}${foodSlug}`);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as { ratingValue: number; content: string; isPrivate: boolean };
      setRatingValue(draft.ratingValue);
      setContent(draft.content);
      setIsPrivate(draft.isPrivate);
    } catch {
      // corrupted draft, ignore
    } finally {
      sessionStorage.removeItem(`${DRAFT_KEY_PREFIX}${foodSlug}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, foodSlug]);

  function requireAuthOrRedirect(): boolean {
    if (isAuthenticated) return true;

    // Preserve the in-progress draft so it survives the login round-trip
    // (FR-1.2). Restored by the food detail page on mount if present.
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        `${DRAFT_KEY_PREFIX}${foodSlug}`,
        JSON.stringify({ ratingValue, content, isPrivate })
      );
    }
    router.push(`/login?redirect=${encodeURIComponent(`/food/${foodSlug}`)}`);
    return false;
  }

  function handleQuickRating(value: number) {
    setRatingValue(value);
    if (!requireAuthOrRedirect()) return;

    startTransition(async () => {
      const result = await upsertRating({ foodId, value });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Rating berhasil disimpan!");
      router.refresh();
    });
  }

  function handleSubmitReview() {
    if (!requireAuthOrRedirect()) return;

    if (ratingValue < 1) {
      toast.error("Berikan rating bintang terlebih dahulu.");
      return;
    }
    if (content.trim().length < 5) {
      toast.error("Tulis ulasan minimal 5 karakter.");
      return;
    }

    startTransition(async () => {
      const result = await upsertReview({
        foodId,
        ratingValue,
        content: content.trim(),
        visibility: isPrivate ? "PRIVATE" : "PUBLIC",
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(`${DRAFT_KEY_PREFIX}${foodSlug}`);
      }
      toast.success("Ulasan berhasil disimpan!");
      router.refresh();
    });
  }

  function handleDeleteReview() {
    startTransition(async () => {
      const result = await deleteReview(foodId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setContent("");
      toast.success("Ulasan dihapus.");
      router.refresh();
    });
  }

  function handleDeleteRating() {
    startTransition(async () => {
      const result = await deleteRating(foodId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setRatingValue(0);
      setContent("");
      toast.success("Rating dihapus.");
      router.refresh();
    });
  }

  return (
    <div className="neo-surface space-y-5 p-6">
      <div>
        <h3 className="font-heading text-xl font-extrabold">Bagikan Pendapatmu</h3>
        <p className="text-sm text-tastelab-black/60">
          Rating dan ulasanmu membantu produk ini lebih transparan.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Rating Kamu</Label>
        <StarRatingInput value={ratingValue} onChange={handleQuickRating} disabled={isPending} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-content">Tulis Ulasan (opsional)</Label>
        <Textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={MAX_REVIEW_LENGTH}
          placeholder="Ceritakan pengalamanmu mencicipi produk ini..."
          rows={4}
        />
        <p className="text-right text-xs text-tastelab-black/50">
          {content.length}/{MAX_REVIEW_LENGTH}
        </p>
      </div>

      <div className="flex items-center justify-between rounded-xl border-2 border-dashed border-tastelab-black/20 p-3">
        <div>
          <Label htmlFor="visibility-toggle">Ulasan Privat</Label>
          <p className="text-xs text-tastelab-black/60">
            Hanya Kitchen yang bisa melihat ulasan privat. Rating bintang tetap dihitung publik.
          </p>
        </div>
        <Switch id="visibility-toggle" checked={isPrivate} onCheckedChange={setIsPrivate} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSubmitReview} disabled={isPending}>
          {existingReview ? "Perbarui Ulasan" : "Kirim Ulasan"}
        </Button>
        {existingReview && (
          <Button variant="outline" onClick={handleDeleteReview} disabled={isPending}>
            Hapus Ulasan
          </Button>
        )}
        {existingRating && (
          <Button variant="ghost" onClick={handleDeleteRating} disabled={isPending}>
            Hapus Rating
          </Button>
        )}
      </div>
    </div>
  );
}
