import type { FoodNutritionWithType } from "@/types";

export function NutritionTable({ nutrition }: { nutrition: FoodNutritionWithType[] }) {
  if (nutrition.length === 0) {
    return (
      <p className="text-sm text-tastelab-black/60">
        Informasi nutrisi untuk produk ini belum tersedia.
      </p>
    );
  }

  return (
    <div className="brutal-card overflow-hidden">
      <div className="border-b-3 border-tastelab-black bg-tastelab-black px-4 py-3">
        <h3 className="font-heading text-lg font-extrabold text-tastelab-white">
          Informasi Nilai Gizi
        </h3>
      </div>
      <table className="w-full">
        <tbody>
          {nutrition.map((entry, index) => (
            <tr
              key={entry.id}
              className={index % 2 === 0 ? "bg-tastelab-white" : "bg-tastelab-yellow-soft/40"}
            >
              <th
                scope="row"
                className="border-b border-tastelab-black/10 px-4 py-2.5 text-left text-sm font-bold"
              >
                {entry.nutritionType.name}
              </th>
              <td className="border-b border-tastelab-black/10 px-4 py-2.5 text-right text-sm font-medium tabular-nums">
                {entry.value} {entry.unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
