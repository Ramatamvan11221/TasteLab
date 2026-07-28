import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 border-tastelab-black px-2.5 py-0.5 text-xs font-bold",
  {
    variants: {
      variant: {
        default: "bg-tastelab-yellow text-tastelab-black",
        orange: "bg-tastelab-orange text-tastelab-white",
        outline: "bg-transparent text-tastelab-black",
        muted: "bg-black/5 text-tastelab-black/70 border-black/20",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
