import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter").max(60),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const nutritionTypeSchema = z.object({
  name: z.string().min(2, "Nama nutrisi minimal 2 karakter").max(60),
  defaultUnit: z.string().min(1, "Satuan wajib diisi").max(10),
});
export type NutritionTypeInput = z.infer<typeof nutritionTypeSchema>;

export const foodNutritionEntrySchema = z.object({
  nutritionTypeId: z.string().min(1, "Pilih jenis nutrisi"),
  value: z.coerce.number().min(0, "Nilai tidak boleh negatif"),
  unit: z.string().min(1, "Satuan wajib diisi").max(10),
  displayOrder: z.coerce.number().int().min(0).default(0),
});
export type FoodNutritionEntryInput = z.infer<typeof foodNutritionEntrySchema>;

export const foodImageSchema = z.object({
  url: z.string().url("URL gambar tidak valid"),
  isPrimary: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).default(0),
});
export type FoodImageInput = z.infer<typeof foodImageSchema>;

export const foodSchema = z.object({
  name: z.string().min(2, "Nama produk minimal 2 karakter").max(120),
  categoryId: z.string().min(1, "Pilih kategori"),
  description: z
    .string()
    .min(10, "Deskripsi minimal 10 karakter")
    .max(2000, "Deskripsi maksimal 2000 karakter"),
  type: z.enum(["FOOD", "DRINK"]).default("FOOD"),
  isActive: z.boolean().default(true),
  images: z.array(foodImageSchema).min(1, "Unggah minimal 1 gambar produk"),
  nutrition: z.array(foodNutritionEntrySchema).default([]),
});
export type FoodInput = z.infer<typeof foodSchema>;
