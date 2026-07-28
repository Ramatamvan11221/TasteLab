import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-tastelab-orange text-tastelab-white border-3 border-tastelab-black shadow-[4px_4px_0_0_var(--color-tastelab-black)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_0_var(--color-tastelab-black)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        secondary:
          "bg-tastelab-yellow text-tastelab-black border-3 border-tastelab-black shadow-[4px_4px_0_0_var(--color-tastelab-black)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_0_var(--color-tastelab-black)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        outline:
          "bg-transparent text-tastelab-black border-3 border-tastelab-black hover:bg-tastelab-black hover:text-tastelab-white",
        ghost: "bg-transparent text-tastelab-black hover:bg-black/5 border-3 border-transparent",
        destructive:
          "bg-red-500 text-white border-3 border-tastelab-black shadow-[4px_4px_0_0_var(--color-tastelab-black)] hover:translate-x-[1px] hover:translate-y-[1px]",
        neo: "neo-surface text-tastelab-black border-0 hover:brightness-95 active:shadow-inner",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
