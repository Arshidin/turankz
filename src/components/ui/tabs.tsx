import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

/**
 * Tab Navigation Component - Design System Specification
 *
 * Container: Horizontal, with bottom border
 * Tab item: Padding 8px 12px, 13-14px text
 * Active tab: text-primary, bottom border 2px accent-primary
 * Inactive tab: text-secondary, no bottom border
 * Hover: text-primary
 */

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center",
      "h-[40px]",
      "border-b border-[var(--border-subtle)]",
      "gap-0",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base styles
      "inline-flex items-center justify-center whitespace-nowrap",
      "px-[12px] py-[8px]",
      // Typography
      "text-[13px] font-medium",
      "text-[var(--text-secondary)]",
      // Border indicator
      "border-b-2 border-transparent",
      "-mb-[1px]",
      // Transitions
      "transition-all duration-[100ms]",
      // Hover state
      "hover:text-[var(--text-primary)]",
      // Active state
      "data-[state=active]:text-[var(--text-primary)]",
      "data-[state=active]:border-b-[var(--accent-primary)]",
      // Focus state
      "focus-visible:outline-none",
      "focus-visible:ring-2 focus-visible:ring-[var(--accent-primary-muted)]",
      "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]",
      // Disabled state
      "disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-[16px]",
      // Focus state
      "focus-visible:outline-none",
      "focus-visible:ring-2 focus-visible:ring-[var(--accent-primary-muted)]",
      "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
