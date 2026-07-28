"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createNutritionType, deleteNutritionType } from "@/actions/catalog.actions";

interface NutritionTypeManagerProps {
  nutritionTypes: { id: string; name: string; defaultUnit: string }[];
}

export function NutritionTypeManager({ nutritionTypes }: NutritionTypeManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");

  function handleCreate() {
    if (!name.trim() || !unit.trim()) {
      toast.error("Nama dan satuan wajib diisi.");
      return;
    }
    startTransition(async () => {
      const result = await createNutritionType({ name: name.trim(), defaultUnit: unit.trim() });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setName("");
      setUnit("");
      toast.success("Jenis nutrisi ditambahkan.");
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Hapus jenis nutrisi ini?")) return;
    startTransition(async () => {
      const result = await deleteNutritionType(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Jenis nutrisi dihapus.");
      router.refresh();
    });
  }

  return (
    <Card className="p-6">
      <p className="mb-4 text-sm text-tastelab-black/60">
        Ini adalah daftar induk jenis nutrisi yang bisa dipilih saat menambahkan nilai gizi ke produk.
        Menjaga daftar ini konsisten mencegah penamaan ganda (mis. &ldquo;Protein&rdquo; vs
        &ldquo;protein&rdquo;).
      </p>
      <div className="grid gap-2 sm:grid-cols-[1fr_120px_auto]">
        <div className="space-y-1">
          <Label>Nama Nutrisi</Label>
          <Input placeholder="mis. Vitamin C" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Satuan Default</Label>
          <Input placeholder="mg" value={unit} onChange={(e) => setUnit(e.target.value)} />
        </div>
        <Button onClick={handleCreate} disabled={isPending} className="self-end">
          <Plus className="size-4" /> Tambah
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {nutritionTypes.length === 0 && (
          <p className="text-sm text-tastelab-black/50">Belum ada jenis nutrisi.</p>
        )}
        {nutritionTypes.map((nt) => (
          <Badge key={nt.id} variant="outline" className="gap-2 py-1.5 pl-3 pr-1.5">
            {nt.name} ({nt.defaultUnit})
            <button
              onClick={() => handleDelete(nt.id)}
              disabled={isPending}
              aria-label={`Hapus ${nt.name}`}
              className="rounded-full p-0.5 hover:bg-black/10"
            >
              <Trash2 className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
    </Card>
  );
}
