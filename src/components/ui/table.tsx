import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Table Component - Design System Specification
 *
 * Header row:
 * - Background: bg-surface (#1A1A1A)
 * - Text: text-secondary, weight 500, size 12-13px
 * - Height: 36-40px
 *
 * Body rows:
 * - Height: 40-44px
 * - Row hover: bg-surface-hover
 * - Row selected: accent-primary-muted background, left border accent-primary
 *
 * Cell padding: 12px horizontal, 8px vertical
 * Border: 1px solid border-subtle between rows; no vertical cell borders
 */

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn(
          "w-full caption-bottom",
          "text-[13px]",
          className,
        )}
        {...props}
      />
    </div>
  ),
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn(
        "bg-[var(--bg-surface)]",
        "[&_tr]:border-b [&_tr]:border-[var(--border-subtle)]",
        className,
      )}
      {...props}
    />
  ),
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn(
        "[&_tr:last-child]:border-0",
        className,
      )}
      {...props}
    />
  ),
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn(
        "bg-[var(--bg-surface)]",
        "border-t border-[var(--border-subtle)]",
        "text-[12px] text-[var(--text-tertiary)]",
        "[&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  ),
);
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        // Border
        "border-b border-[var(--border-subtle)]",
        // Hover state
        "transition-colors duration-[100ms]",
        "hover:bg-[var(--bg-surface-hover)]",
        // Selected state
        "data-[state=selected]:bg-[var(--accent-primary-muted)]",
        "data-[state=selected]:border-l-2 data-[state=selected]:border-l-[var(--accent-primary)]",
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        // Sizing
        "h-[36px] px-[12px] py-[8px]",
        // Typography
        "text-left align-middle",
        "text-[12px] font-medium text-[var(--text-secondary)]",
        // Checkbox column
        "[&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        // Sizing
        "h-[40px] px-[12px] py-[8px]",
        // Typography
        "align-middle",
        "text-[13px] text-[var(--text-primary)]",
        // Checkbox column
        "[&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  ),
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption
      ref={ref}
      className={cn(
        "mt-4",
        "text-[12px] text-[var(--text-tertiary)]",
        className,
      )}
      {...props}
    />
  ),
);
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
