import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  // Search and filter boxes across the dashboard are placeholder-only: no
  // visible <label>, no aria-label, so they reach the accessibility tree with
  // no name at all. Mirroring the placeholder names every input without
  // touching 60+ call sites.
  //
  // Deliberately narrow — this only fills a gap. If the input already carries
  // an explicit name (aria-label / aria-labelledby) or an `id`, which implies a
  // <label for> may point at it, nothing is added, so a real label always wins.
  const hasExplicitName =
    props["aria-label"] != null ||
    props["aria-labelledby"] != null ||
    props.id != null
  const fallbackLabel =
    !hasExplicitName &&
    typeof props.placeholder === "string" &&
    props.placeholder.trim()
      ? props.placeholder
      : undefined

  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      aria-label={fallbackLabel}
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        type === "date" && "min-w-[9.75rem] text-start tabular-nums [color-scheme:light] dark:[color-scheme:dark]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
