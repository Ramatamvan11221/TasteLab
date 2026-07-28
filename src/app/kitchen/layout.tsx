import { requireKitchen } from "@/lib/auth-utils";
import { KitchenSidebar } from "@/components/kitchen/kitchen-sidebar";

export default async function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { kitchenProfile } = await requireKitchen();

  return (
    <div className="flex min-h-screen">
      <KitchenSidebar brandName={kitchenProfile.brand?.name || "TasteLab"} />
      {/* 🔥 TAMBAHIN PADDING KIRI YANG LEBIH BESAR */}
      <main className="min-h-screen flex-1 p-6 md:p-8" style={{ paddingLeft: "18rem" }}>
        {children}
      </main>
    </div>
  );
}