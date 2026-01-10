import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

/**
 * Switch/Toggle Component - Design System Specification
 *
 * Track size: 36px x 20px
 * Track off: bg-surface with border
 * Track on: accent-primary (#3B82F6)
 * Thumb size: 16px circle
 * Border-radius: Fully rounded (pill)
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      // Base styles
      "peer inline-flex shrink-0 cursor-pointer items-center",
      "h-[20px] w-[36px]",
      "rounded-full",
      // Unchecked state
      "border border-[var(--border-default)]",
      "bg-[var(--bg-surface)]",
      "data-[state=unchecked]:bg-[var(--bg-surface)]",
      // Checked state
      "data-[state=checked]:bg-[var(--accent-primary)]",
      "data-[state=checked]:border-[var(--accent-primary)]",
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
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        // Base styles
        "pointer-events-none block rounded-full shadow-sm",
        "h-[16px] w-[16px]",
        // Colors
        "bg-white",
        // Position
        "data-[state=unchecked]:translate-x-[1px]",
        "data-[state=checked]:translate-x-[17px]",
        // Transition
        "transition-transform duration-[100ms]",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
