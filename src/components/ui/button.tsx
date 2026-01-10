import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button Component - Design System Specification
 *
 * Primary: Blue background (#3B82F6), white text, 6px radius
 * Secondary: Transparent background, border, muted text
 * Ghost: No border, transparent, hover background
 * Icon: 28-32px square, icon only
 *
 * Heights: 32-36px for standard buttons
 * Padding: 8-10px vertical, 14-16px horizontal
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium",
    "transition-colors duration-fast",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary Button: Blue background, white text
        default: [
          "bg-[var(--accent-primary)] text-white",
          "hover:bg-[var(--accent-primary-hover)]",
          "active:bg-[#1D4ED8]",
        ].join(" "),

        // Destructive: Red background for dangerous actions
        destructive: [
          "bg-[var(--color-error)] text-white",
          "hover:bg-[#DC2626]",
          "active:bg-[#B91C1C]",
        ].join(" "),

        // Secondary/Outline: Transparent with border
        outline: [
          "bg-transparent border border-[var(--border-default)]",
          "text-[var(--text-secondary)]",
          "hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]",
          "active:bg-[var(--bg-surface-active)]",
        ].join(" "),

        // Secondary: Surface background
        secondary: [
          "bg-[var(--bg-surface)] border border-[var(--border-default)]",
          "text-[var(--text-secondary)]",
          "hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]",
          "active:bg-[var(--bg-surface-active)]",
        ].join(" "),

        // Ghost/Tertiary: No border, transparent
        ghost: [
          "bg-transparent",
          "text-[var(--text-secondary)]",
          "hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]",
          "active:bg-[var(--bg-surface-active)]",
        ].join(" "),

        // Link: Text only with underline on hover
        link: [
          "bg-transparent",
          "text-[var(--text-link)]",
          "underline-offset-4 hover:underline",
        ].join(" "),
      },
      size: {
        // Default: 32-36px height
        default: "h-[32px] px-[14px] py-[8px] text-[13px] rounded-[6px]",

        // Small: Compact variant
        sm: "h-[28px] px-[10px] py-[6px] text-[12px] rounded-[6px]",

        // Large: Spacious variant
        lg: "h-[36px] px-[16px] py-[10px] text-[14px] rounded-[6px]",

        // Icon button: 28-32px square
        icon: "h-[28px] w-[28px] p-0 rounded-[6px]",

        // Icon large: 32px square
        "icon-lg": "h-[32px] w-[32px] p-0 rounded-[6px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </>
        ) : children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
