import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full bg-[#ffffff] px-4 py-3 text-sm text-[#00345e]",
          "rounded-xl border-none",
          "placeholder:text-[#CBD5E1]",
          "focus:outline-none focus:ring-0 focus:border-b-2 focus:border-[#3B82F6]",
          "transition-all duration-200 resize-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
