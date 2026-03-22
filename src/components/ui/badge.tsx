import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#DBEAFE] text-[#1E40AF]",
        secondary: "bg-[#EDE9FE] text-[#5B21B6]",
        destructive: "bg-[#fc4563] text-white",
        outline: "bg-transparent text-[#475569] border border-[rgba(148,163,184,0.15)]",
        success: "bg-[#DDD6FE]/30 text-[#7C3AED]",
        warning: "bg-[#fe8983]/20 text-[#9f403d]",
        info: "bg-[#DBEAFE] text-[#1E40AF]",
        surface: "bg-[#EFF6FF] text-[#475569]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
