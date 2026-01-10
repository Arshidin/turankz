import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Input Component - Design System Specification
 *
 * Height: 36px
 * Background: bg-input (#1A1A1A) or bg-surface
 * Border: 1px solid border-default (#3A3A3A)
 * Border-radius: 6px
 * Padding: 8px 12px
 * Text: 14px, text-primary
 * Placeholder: text-tertiary
 * Focus: Border color accent-primary, optional subtle box-shadow
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex w-full",
          "h-[36px] px-[12px] py-[8px]",
          "rounded-[6px]",
          // Colors
          "bg-[var(--bg-input)] border border-[var(--border-default)]",
          "text-[14px] text-[var(--text-primary)]",
          "placeholder:text-[var(--text-tertiary)]",
          // File input
          "file:border-0 file:bg-transparent file:text-[13px] file:font-medium file:text-[var(--text-primary)]",
          // Focus state
          "focus-visible:outline-none focus-visible:border-[var(--accent-primary)]",
          "focus-visible:ring-1 focus-visible:ring-[var(--accent-primary)]",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Transition
          "transition-colors duration-[100ms]",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
