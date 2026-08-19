"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The pager under a data table.
 *
 * Five tables each built their own: button heights differed (h-7 vs h-8), the page
 * indicator sometimes a plain span and sometimes a boxed div, the row-count
 * phrasing different every time ("إجمالي N حجز" / "عرض N من إجمالي" /
 * "N اشتراك"), and — the part that actually misleads an operator — different
 * rules for when "next" is disabled. One table inferred "last page" from
 * `rows.length < 10`, which disables the control on any short final page even
 * when more pages exist.
 *
 * Here the boundary comes from `page`/`totalPages`, so the control means the
 * same thing everywhere it appears.
 */
export function TablePagination({
  page,
  totalPages,
  total,
  shown,
  unit,
  showPageNumbers = false,
  busy = false,
  onPageChange,
  className,
}: {
  page: number;
  /** Total page count. Pass 1 when unknown so "next" stays disabled. */
  totalPages: number;
  /** Total row count across all pages. */
  total?: number;
  /** Rows rendered on this page. */
  shown?: number;
  /** Noun for the count, e.g. "حجز" / "اشتراك" / "مزود". */
  unit?: string;
  /**
   * Numbered page buttons with ellipsis instead of a plain indicator. The users
   * table had built this itself; it is the better control for a long list, so
   * it moved in here rather than being levelled down to prev/next.
   */
  showPageNumbers?: boolean;
  /** Disable both arrows while a fetch is in flight (finance did this). */
  busy?: boolean;
  onPageChange: (next: number) => void;
  className?: string;
}) {
  const pages = Math.max(1, totalPages);
  const atStart = page <= 1 || busy;
  const atEnd = page >= pages || busy;

  // window of pages to show: first, last, and ±2 around the current one
  const numbers: (number | "gap")[] = [];
  if (showPageNumbers) {
    let lastPushed = 0;
    for (let n = 1; n <= pages; n++) {
      const near = Math.abs(page - n) <= 2;
      const edge = n === 1 || n === pages;
      if (near || edge) {
        if (lastPushed && n - lastPushed > 1) numbers.push("gap");
        numbers.push(n);
        lastPushed = n;
      }
    }
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-border/20 px-4 py-3",
        className,
      )}
    >
      <p className="text-xs text-muted-foreground">
        {typeof shown === "number" && typeof total === "number" ? (
          <>
            عرض <span className="font-bold text-foreground tabular-nums">{shown.toLocaleString("ar-SY")}</span>
            {" من "}
            <span className="font-bold text-foreground tabular-nums">{total.toLocaleString("ar-SY")}</span>
            {unit ? ` ${unit}` : ""}
          </>
        ) : typeof total === "number" ? (
          <>
            إجمالي <span className="font-bold text-foreground tabular-nums">{total.toLocaleString("ar-SY")}</span>
            {unit ? ` ${unit}` : ""}
          </>
        ) : null}
      </p>

      <nav className="flex items-center gap-1.5" aria-label="تصفّح الصفحات">
        <Button
          variant="outline"
          size="sm"
          disabled={atStart}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          السابق
        </Button>
        {showPageNumbers ? (
          <span className="flex items-center gap-1">
            {numbers.map((n, i) =>
              n === "gap" ? (
                <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-xs text-muted-foreground/40">
                  …
                </span>
              ) : (
                <Button
                  key={n}
                  size="icon-sm"
                  variant={n === page ? "default" : "outline"}
                  aria-label={`الصفحة ${n}`}
                  aria-current={n === page ? "page" : undefined}
                  disabled={busy}
                  onClick={() => onPageChange(n)}
                  className="tabular-nums"
                >
                  {n}
                </Button>
              ),
            )}
          </span>
        ) : (
          <span className="px-2 text-xs font-semibold tabular-nums text-muted-foreground">
            {/* announced as one unit so a screen reader doesn't read "3" and "7" as unrelated */}
            <span className="sr-only">الصفحة </span>
            {page}
            <span aria-hidden="true"> / </span>
            <span className="sr-only"> من </span>
            {pages}
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          disabled={atEnd}
          onClick={() => onPageChange(page + 1)}
        >
          التالي
        </Button>
      </nav>
    </div>
  );
}
