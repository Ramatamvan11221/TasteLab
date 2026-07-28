import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  sub?: string;
}

export function StatCard({ label, value, icon: Icon, sub }: StatCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-tastelab-orange" />
        <span className="text-sm font-bold text-tastelab-black/60">{label}</span>
      </div>
      <p className="mt-2 font-heading text-2xl font-extrabold">{value}</p>
      {sub && <p className="text-xs text-tastelab-black/50">{sub}</p>}
    </Card>
  );
}