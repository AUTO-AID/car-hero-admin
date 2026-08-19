"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Semantic table shell.
 *
 * The dashboard had seven hand-rolled `<table>`s. Across all of them there were
 * zero `scope` attributes on 19 `<th>`s and zero `<caption>`s, so a screen
 * reader announced a stream of cells with no column context. Small screens were
 * handled only by `overflow-x-auto` on a grid with `min-w-[900px]`, i.e. a
 * 900px horizontal scroll inside a 375px viewport.
 *
 * These primitives bake in what every table needs — caption, column scope,
 * sticky header, a real horizontal-scroll region that is keyboard reachable —
 * so a new table gets them without remembering to.
 */

function DataTable({
  className,
  caption,
  captionVisible = false,
  minWidth = 720,
  stickyHeader = true,
  children,
  ...props
}: React.ComponentProps<"table"> & {
  /** Required: names the table for assistive tech. */
  caption: string;
  /** Show the caption visually as well as to screen readers. */
  captionVisible?: boolean;
  /** Width below which the region scrolls horizontally. */
  minWidth?: number;
  stickyHeader?: boolean;
}) {
  return (
    // tabIndex makes the scroll region reachable by keyboard, which a plain
    // overflow container is not.
    <div
      className="w-full overflow-x-auto focus-visible:outline-2 focus-visible:outline-ring"
      tabIndex={0}
      role="region"
      aria-label={caption}
      data-slot="data-table-scroll"
    >
      <table
        data-slot="data-table"
        data-sticky={stickyHeader ? "" : undefined}
        style={{ minWidth }}
        className={cn("w-full border-collapse text-start", className)}
        {...props}
      >
        <caption
          className={cn(
            captionVisible
              ? "px-5 py-3 text-start text-sm font-bold text-foreground"
              : "sr-only",
          )}
        >
          {caption}
        </caption>
        {children}
      </table>
    </div>
  );
}

function DataTableHead({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="data-table-head"
      className={cn(
        "bg-card/95 text-muted-foreground backdrop-blur",
        "[table[data-sticky]_&]:sticky [table[data-sticky]_&]:top-0 [table[data-sticky]_&]:z-10",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Column header. `scope="col"` is the default because that is what it is —
 * omitting it was the single most common table defect in the audit.
 */
function DataTableTh({
  className,
  scope = "col",
  ...props
}: React.ComponentProps<"th">) {
  return (
    <th
      scope={scope}
      className={cn(
        // <th> carries a UA default of text-align:center, which beats the
        // table's inherited alignment — so headers sat centred above
        // start-aligned columns. Set it explicitly.
        "px-5 py-3.5 text-start text-xs font-bold tracking-wider text-muted-foreground",
        "border-b border-border/25 whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}

/** Row header — the cell that identifies the row (usually the name column). */
function DataTableRowTh({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      scope="row"
      className={cn("px-5 py-4 text-start font-medium", className)}
      {...props}
    />
  );
}

function DataTableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="data-table-body" className={cn(className)} {...props} />;
}

function DataTableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "border-b border-border/10 transition-colors last:border-0 hover:bg-secondary/25",
        className,
      )}
      {...props}
    />
  );
}

function DataTableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("px-5 py-4 align-middle", className)} {...props} />;
}

/**
 * Full-width row for the loading / empty / error states, so every table
 * expresses them the same way instead of each page inventing its own.
 */
function DataTableStateRow({
  colSpan,
  children,
  className,
}: {
  colSpan: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className={cn("px-5 py-10", className)}>
        {children}
      </td>
    </tr>
  );
}

export {
  DataTable,
  DataTableHead,
  DataTableTh,
  DataTableRowTh,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  DataTableStateRow,
};
