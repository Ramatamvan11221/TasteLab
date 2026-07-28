"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { deleteFood, toggleFoodActive } from "@/actions/catalog.actions";

export function FoodRowActions({ foodId, isActive }: { foodId: string; isActive: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      const result = await toggleFoodActive(foodId, checked);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm("Hapus produk ini beserta seluruh rating dan ulasannya? Tindakan ini tidak bisa dibatalkan.")) {
      return;
    }
    startTransition(async () => {
      const result = await deleteFood(foodId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Produk dihapus.");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-between border-t-2 border-tastelab-black/10 pt-3">
      <div className="flex items-center gap-2">
        <Switch checked={isActive} onCheckedChange={handleToggle} disabled={isPending} />
        <span className="text-xs font-bold text-tastelab-black/60">{isActive ? "Aktif" : "Nonaktif"}</span>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="icon" asChild>
          <a href={`/api/qrcode/${foodId}`} aria-label="Unduh QR Code" download>
            <QrCode className="size-4" />
          </a>
        </Button>
        <Button variant="outline" size="icon" asChild>
          <Link href={`/kitchen/foods/${foodId}/edit`} aria-label="Edit produk">
            <Pencil className="size-4" />
          </Link>
        </Button>
        <Button variant="destructive" size="icon" onClick={handleDelete} disabled={isPending} aria-label="Hapus produk">
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
