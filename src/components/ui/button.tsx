import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white hover:from-[#2563EB] hover:to-[#6D28D9] rounded-xl shadow-sm",
        secondary: "bg-[#EDE9FE] text-[#5B21B6] rounded-xl hover:opacity-90",
        tertiary: "bg-transparent text-[#3B82F6] hover:bg-[#DBEAFE]/30 rounded-xl",
        destructive: "bg-[#bd0c3b] text-white rounded-xl hover:bg-[#a90032]",
        outline: "bg-transparent text-[#00345e] rounded-xl hover:bg-[#EFF6FF] border border-[rgba(148,163,184,0.15)]",
        ghost: "bg-transparent hover:bg-[#EFF6FF] text-[#475569] rounded-xl",
        link: "text-[#3B82F6] underline-offset-4 hover:underline",
        warm: "bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white hover:from-[#2563EB] hover:to-[#6D28D9] rounded-xl shadow-sm",
        surface: "bg-white text-[#00345e] rounded-xl hover:bg-[#EFF6FF] shadow-sm",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 py-3 text-base",
        icon: "h-10 w-10",
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
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
