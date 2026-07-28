import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus, Star, MessageSquare } from "lucide-react";
import { requireKitchen } from "@/lib/auth-utils";
import { getFoodsForKitchen } from "@/services/catalog.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FoodRowActions } from "@/components/kitchen/food-row-actions";

export const metadata: Metadata = { title: "Kelola Produk" };

export default async function KitchenFoodsPage() {
  const { kitchenProfile } = await requireKitchen();
  const foods = await getFoodsForKitchen(kitchenProfile.brandId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold">Produk</h1>
          <p className="text-tastelab-black/60">Kelola katalog produk TasteLab.</p>
        </div>
        <Button asChild>
          <Link href="/kitchen/foods/new">
            <Plus className="size-4" /> Tambah Produk
          </Link>
        </Button>
      </div>

      {foods.length === 0 ? (
        <Card className="p-10 text-center text-tastelab-black/60">Belum ada produk. Tambahkan yang pertama!</Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {foods.map((food) => {
            const primary = food.images.find((i) => i.isPrimary) ?? food.images[0];
            return (
              <Card key={food.id} className="overflow-hidden">
                <div className="relative aspect-video border-b-3 border-tastelab-black bg-tastelab-yellow-soft">
                  {primary && (
                    <Image src={primary.url} alt={food.name} fill className="object-cover" />
                  )}
                  {!food.isActive && (
                    <Badge variant="muted" className="absolute left-2 top-2">
                      Nonaktif
                    </Badge>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-lg font-extrabold leading-tight">{food.name}</h3>
                    <Badge>{food.category.name}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-tastelab-black/60">
                    <span className="flex items-center gap-1">
                      <Star className="size-3.5" /> {food._count.ratings}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="size-3.5" /> {food._count.reviews}
                    </span>
                  </div>
                  <FoodRowActions foodId={food.id} isActive={food.isActive} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
