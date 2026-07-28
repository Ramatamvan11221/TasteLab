import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getFoodBySlug, getUserFeedbackForFood } from "@/services/catalog.service";
import { getCurrentSession } from "@/lib/auth-utils";
import { NutritionTable } from "@/components/catalog/nutrition-table";
import { StarRatingDisplay } from "@/components/feedback/star-rating-display";
import { GiveFeedbackForm } from "@/components/feedback/give-feedback-form";
import { ReviewList } from "@/components/feedback/review-list";
import { Badge } from "@/components/ui/badge";

interface FoodPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: FoodPageProps): Promise<Metadata> {
  const { slug } = await params;
  const food = await getFoodBySlug(slug);
  if (!food) return { title: "Produk Tidak Ditemukan" };

  return {
    title: food.name,
    description: food.description,
    openGraph: {
      title: food.name,
      description: food.description,
      images: food.images[0] ? [{ url: food.images[0].url }] : undefined,
    },
  };
}

export default async function FoodDetailPage({ params }: FoodPageProps) {
  const { slug } = await params;
  const session = await getCurrentSession();
  const food = await getFoodBySlug(slug, session?.user?.id);

  if (!food) notFound();

  const feedback = session?.user
    ? await getUserFeedbackForFood(session.user.id, food.id)
    : { rating: null, review: null };

  const primaryImage = food.images.find((img) => img.isPrimary) ?? food.images[0];
  const galleryImages = food.images.filter((img) => img.id !== primaryImage?.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 md:grid-cols-2">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-3 border-tastelab-black bg-tastelab-yellow-soft shadow-[6px_6px_0_0_var(--color-tastelab-black)]">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={food.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : null}
          </div>
          {galleryImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {galleryImages.map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square overflow-hidden rounded-xl border-2 border-tastelab-black"
                >
                  <Image src={img.url} alt={food.name} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <Badge>{food.category.name}</Badge>
          <h1 className="mt-3 font-heading text-3xl font-extrabold sm:text-4xl">{food.name}</h1>
          <div className="mt-3">
            <StarRatingDisplay value={food.averageRating} count={food.ratings.length} size="lg" />
          </div>
          <p className="mt-4 text-tastelab-black/75">{food.description}</p>
        </div>
      </div>

      {/* Nutrition */}
      <div className="mt-12">
        <NutritionTable nutrition={food.nutrition} />
      </div>

      {/* Feedback form */}
      <div className="mt-12">
        <GiveFeedbackForm
          foodId={food.id}
          foodSlug={food.slug}
          isAuthenticated={Boolean(session?.user)}
          existingRating={feedback.rating}
          existingReview={feedback.review}
        />
      </div>

      {/* Reviews */}
      <div className="mt-12">
        <h2 className="mb-4 font-heading text-2xl font-extrabold">
          Ulasan Pelanggan ({food.reviews.length})
        </h2>
        <ReviewList reviews={food.reviews} currentUserId={session?.user?.id} />
      </div>
    </div>
  );
}
