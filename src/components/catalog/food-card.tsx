import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRatingDisplay } from "@/components/feedback/star-rating-display";
import type { FoodCardData } from "@/types";

export function FoodCard({ food }: { food: FoodCardData }) {
  const primaryImage = food.images.find((img) => img.isPrimary) ?? food.images[0];

  return (
    <Link href={`/food/${food.slug}`} className="group block">
      <Card className="h-full transition-transform group-hover:-translate-y-1 group-hover:shadow-[8px_8px_0_0_var(--color-tastelab-black)]">
        <div className="relative aspect-square w-full overflow-hidden border-b-3 border-tastelab-black bg-tastelab-yellow-soft">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={food.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-tastelab-black/30">
              Tidak ada gambar
            </div>
          )}
          <Badge className="absolute left-3 top-3" variant="default">
            {food.category.name}
          </Badge>
        </div>
        <div className="space-y-2 p-4">
          <h3 className="font-heading text-lg font-extrabold leading-tight">{food.name}</h3>
          <p className="line-clamp-2 text-sm text-tastelab-black/65">{food.description}</p>
          <StarRatingDisplay value={food.averageRating} count={food.ratingCount} size="sm" />
        </div>
      </Card>
    </Link>
  );
}
