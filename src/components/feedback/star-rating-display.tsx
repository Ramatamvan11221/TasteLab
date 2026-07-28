import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRating } from "@/lib/utils";

interface StarRatingDisplayProps {
  value: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

const sizeMap = { sm: "size-3.5", md: "size-5", lg: "size-7" };

export function StarRatingDisplay({
  value,
  count,
  size = "md",
  showValue = true,
  className,
}: StarRatingDisplayProps) {
  const rounded = Math.round(value);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeMap[size],
              star <= rounded ? "fill-tastelab-orange text-tastelab-orange" : "fill-none text-tastelab-black/25"
            )}
          />
        ))}
      </div>
      <span className="sr-only">
        {value > 0 ? `Rating rata-rata ${formatRating(value)} dari 5 bintang` : "Belum ada rating"}
      </span>
      {showValue && (
        <span className="text-sm font-bold text-tastelab-black">
          {value > 0 ? formatRating(value) : "Baru"}
        </span>
      )}
      {typeof count === "number" && (
        <span className="text-sm text-tastelab-black/60">({count})</span>
      )}
    </div>
  );
}
