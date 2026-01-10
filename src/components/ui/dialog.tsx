import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Dialog/Modal Component - Design System Specification
 *
 * Overlay: Black @ 50-60% opacity
 * Container: bg-surface-elevated (#242424), border-radius 12px
 * Width: 400-500px for forms; up to 800px for complex dialogs
 * Padding: 24px
 * Shadow: Large, diffuse shadow
 *
 * Header:
 * - Title: 18-20px, weight 600
 * - Close button: Top-right, icon button
 *
 * Footer:
 * - Alignment: Right-aligned buttons
 * - Button order: Cancel (secondary) | Confirm (primary)
 * - Spacing: 8-12px between buttons
 */

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50",
      // Overlay color: 50-60% black
      "bg-black/60",
      // Animations
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Positioning
        "fixed left-[50%] top-[50%] z-50",
        "translate-x-[-50%] translate-y-[-50%]",
        // Sizing
        "w-full max-w-[500px]",
        // Styling
        "bg-[var(--bg-surface-elevated)]",
        "border border-[var(--border-subtle)]",
        "rounded-[12px]",
        "p-[24px]",
        // Shadow
        "shadow-[0_8px_16px_-4px_rgba(0,0,0,0.4),0_4px_8px_-2px_rgba(0,0,0,0.3)]",
        // Grid layout
        "grid gap-[16px]",
        // Animations
        "duration-200",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        // Overflow
        "overflow-hidden",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        className={cn(
          // Position
          "absolute right-[16px] top-[16px]",
          // Size (icon button)
          "h-[28px] w-[28px]",
          "flex items-center justify-center",
          // Styling
          "rounded-[6px]",
          "text-[var(--text-tertiary)]",
          // Hover state
          "hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]",
          // Focus state
          "focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary-muted)]",
          // Disabled
          "disabled:pointer-events-none",
          // Transition
          "transition-colors duration-[100ms]",
        )}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col gap-[4px]",
      "text-left",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-[8px]",
      "sm:flex-row sm:justify-end sm:gap-[12px]",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-[18px] font-semibold leading-tight",
      "text-[var(--text-primary)]",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      "text-[14px]",
      "text-[var(--text-secondary)]",
      className,
    )}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
