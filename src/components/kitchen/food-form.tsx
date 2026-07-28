"use client";

import { useState, useTransition } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Plus, Trash2, Star, Star as StarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UploadButton } from "@/components/uploadthing";
import { foodSchema, type FoodInput } from "@/validations/catalog";
import { createFood, updateFood } from "@/actions/catalog.actions";
import { cn } from "@/lib/utils";

interface FoodFormProps {
  mode: "create" | "edit";
  foodId?: string;
  categories: { id: string; name: string }[];
  nutritionTypes: { id: string; name: string; defaultUnit: string }[];
  defaultValues?: Partial<FoodInput>;
}

export function FoodForm({ mode, foodId, categories, nutritionTypes, defaultValues }: FoodFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FoodInput>({
    resolver: zodResolver(foodSchema),
    defaultValues: {
      name: "",
      categoryId: categories[0]?.id ?? "",
      description: "",
      type: "FOOD",
      isActive: true,
      images: [],
      nutrition: [],
      ...defaultValues,
    },
  });

  const imagesArray = useFieldArray({ control, name: "images" });
  const nutritionArray = useFieldArray({ control, name: "nutrition" });
  const images = watch("images");

  function setPrimaryImage(index: number) {
    images.forEach((_, i) => setValue(`images.${i}.isPrimary`, i === index));
  }

  function addNutritionRow() {
    const first = nutritionTypes[0];
    nutritionArray.append({
      nutritionTypeId: first?.id ?? "",
      value: 0,
      unit: first?.defaultUnit ?? "g",
      displayOrder: nutritionArray.fields.length,
    });
  }

  function onSubmit(values: FoodInput) {
    startTransition(async () => {
      const result =
        mode === "create" ? await createFood(values) : await updateFood(foodId as string, values);

      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(mode === "create" ? "Produk berhasil ditambahkan." : "Produk berhasil diperbarui.");
      router.push("/kitchen/foods");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      {/* Basic info */}
      <div className="brutal-card space-y-4 p-6">
        <h2 className="font-heading text-lg font-extrabold">Informasi Dasar</h2>

        <div className="space-y-1.5">
          <Label htmlFor="name">Nama Produk</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-xs font-semibold text-red-600">{errors.name.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="categoryId">Kategori</Label>
            <select
              id="categoryId"
              {...register("categoryId")}
              className="h-11 w-full rounded-xl border-3 border-tastelab-black bg-tastelab-white px-3 text-sm font-medium"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs font-semibold text-red-600">{errors.categoryId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="type">Tipe</Label>
            <select
              id="type"
              {...register("type")}
              className="h-11 w-full rounded-xl border-3 border-tastelab-black bg-tastelab-white px-3 text-sm font-medium"
            >
              <option value="FOOD">Makanan</option>
              <option value="DRINK">Minuman</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea id="description" rows={4} {...register("description")} />
          {errors.description && (
            <p className="text-xs font-semibold text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl border-2 border-dashed border-tastelab-black/20 p-3">
          <div>
            <Label htmlFor="isActive">Produk Aktif</Label>
            <p className="text-xs text-tastelab-black/60">Produk nonaktif tidak muncul di menu publik.</p>
          </div>
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>
      </div>

      {/* Images */}
      <div className="brutal-card space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-extrabold">Gambar Produk</h2>
          <UploadButton
            endpoint="foodImageUploader"
            onClientUploadComplete={(res) => {
              res?.forEach((file) => {
                imagesArray.append({
                  url: file.url,
                  isPrimary: imagesArray.fields.length === 0,
                  sortOrder: imagesArray.fields.length,
                });
              });
              toast.success(`${res?.length ?? 0} gambar berhasil diunggah.`);
            }}
            onUploadError={(error) => toast.error(`Gagal unggah: ${error.message}`)}
          />
        </div>
        {errors.images && <p className="text-xs font-semibold text-red-600">{errors.images.message}</p>}

        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((img, index) => (
              <div key={index} className="relative">
                <div
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-xl border-3",
                    img.isPrimary ? "border-tastelab-orange" : "border-tastelab-black"
                  )}
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setPrimaryImage(index)}
                    className="flex items-center gap-1 text-xs font-bold text-tastelab-orange-dark"
                  >
                    {img.isPrimary ? <Star className="size-3.5 fill-current" /> : <StarOff className="size-3.5" />}
                    {img.isPrimary ? "Utama" : "Jadikan Utama"}
                  </button>
                  <button
                    type="button"
                    onClick={() => imagesArray.remove(index)}
                    className="text-tastelab-black/50 hover:text-red-600"
                    aria-label="Hapus gambar"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nutrition */}
      <div className="brutal-card space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-extrabold">Nilai Gizi</h2>
          <Button type="button" variant="secondary" size="sm" onClick={addNutritionRow}>
            <Plus className="size-4" /> Tambah Baris
          </Button>
        </div>

        {nutritionArray.fields.length === 0 ? (
          <p className="text-sm text-tastelab-black/50">Belum ada data nutrisi ditambahkan.</p>
        ) : (
          <div className="space-y-3">
            {nutritionArray.fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_auto_auto_auto] items-end gap-2">
                <div className="space-y-1">
                  <Label>Jenis Nutrisi</Label>
                  <select
                    {...register(`nutrition.${index}.nutritionTypeId`)}
                    onChange={(e) => {
                      register(`nutrition.${index}.nutritionTypeId`).onChange(e);
                      const nt = nutritionTypes.find((n) => n.id === e.target.value);
                      if (nt) setValue(`nutrition.${index}.unit`, nt.defaultUnit);
                    }}
                    className="h-11 w-full rounded-xl border-3 border-tastelab-black bg-tastelab-white px-3 text-sm font-medium"
                  >
                    {nutritionTypes.map((nt) => (
                      <option key={nt.id} value={nt.id}>
                        {nt.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24 space-y-1">
                  <Label>Nilai</Label>
                  <Input type="number" step="0.1" {...register(`nutrition.${index}.value`)} />
                </div>
                <div className="w-20 space-y-1">
                  <Label>Satuan</Label>
                  <Input {...register(`nutrition.${index}.unit`)} />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => nutritionArray.remove(index)}
                  aria-label="Hapus baris nutrisi"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        {nutritionTypes.length === 0 && (
          <p className="text-xs text-tastelab-black/50">
            Belum ada jenis nutrisi. Tambahkan dulu di halaman Nutrisi.
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : mode === "create" ? "Simpan Produk" : "Perbarui Produk"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </form>
  );
}
