import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-[#ffd700] to-[#d4af37] text-[#050505] hover:brightness-105 shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_6px_24px_rgba(212,175,55,0.35)] hover:-translate-y-0.5",
        secondary: "bg-[#161616] text-[#f5f5f5] border border-[rgba(212,175,55,0.15)] hover:bg-[#111111] hover:border-[rgba(212,175,55,0.3)]",
        outline:
          "border border-[rgba(212,175,55,0.35)] bg-transparent text-[#f5f5f5] hover:border-[#d4af37] hover:bg-[rgba(212,175,55,0.06)]",
        ghost: "text-[#f5f5f5] hover:bg-[rgba(212,175,55,0.08)] hover:text-[#ffd700]",
        destructive:
          "bg-gradient-to-b from-[#e50914] to-[#b00020] text-white hover:brightness-110 shadow-[0_4px_16px_rgba(176,0,32,0.3)]",
        link: "text-[#d4af37] underline-offset-4 hover:underline hover:text-[#ffd700]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
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
