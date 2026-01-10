import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Checkbox Component - Design System Specification
 *
 * Size: 16px square
 * Border: 1px solid border-default (#3A3A3A)
 * Border-radius: 4px
 * Checked: Background accent-primary (#3B82F6), white checkmark
 * Focus: Ring accent-primary-muted
 */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // Base styles
      "peer shrink-0",
      "h-[16px] w-[16px]",
      "rounded-[4px]",
      // Unchecked state
      "border border-[var(--border-default)]",
      "bg-transparent",
      // Checked state
      "data-[state=checked]:bg-[var(--accent-primary)]",
      "data-[state=checked]:border-[var(--accent-primary)]",
      "data-[state=checked]:text-white",
      // Focus state
      "focus-visible:outline-none",
      "focus-visible:ring-2 focus-visible:ring-[var(--accent-primary-muted)]",
      "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]",
      // Disabled state
      "disabled:cursor-not-allowed disabled:opacity-50",
      // Transition
      "transition-colors duration-[100ms]",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      <Check className="h-3 w-3" strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
