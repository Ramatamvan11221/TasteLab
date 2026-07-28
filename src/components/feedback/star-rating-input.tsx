"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { RATING_LABELS } from "@/constants/site";

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function StarRatingInput({ value, onChange, disabled }: StarRatingInputProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? value;

  return (
    <div className="flex flex-col gap-2">
      <div
        role="radiogroup"
        aria-label="Beri rating 1 sampai 5 bintang"
        className="neo-surface inline-flex items-center gap-1 p-3"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} bintang - ${RATING_LABELS[star as 1 | 2 | 3 | 4 | 5]}`}
            disabled={disabled}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(null)}
            className="rounded-full p-1.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tastelab-orange disabled:pointer-events-none disabled:opacity-50"
          >
            <Star
              className={cn(
                "size-8 transition-colors",
                star <= active
                  ? "fill-tastelab-orange text-tastelab-orange"
                  : "fill-none text-tastelab-black/30"
              )}
            />
          </button>
        ))}
      </div>
      {active > 0 && (
        <p className="text-sm font-bold text-tastelab-orange-dark">
          {RATING_LABELS[active as 1 | 2 | 3 | 4 | 5]}
        </p>
      )}
    </div>
  );
}
