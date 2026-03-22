import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full bg-[#ffffff] px-4 py-2 text-sm text-[#00345e]",
          "rounded-xl border-none",
          "placeholder:text-[#CBD5E1]",
          "focus:outline-none focus:ring-0 focus:border-b-2 focus:border-[#3B82F6]",
          "transition-all duration-200",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
