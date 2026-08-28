"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

type TabValue = TabsPrimitive.Tab.Value

/**
 * Tracks the active tab so `TabsContent` can mount lazily and then stay mounted.
 *
 * Base UI's `Tabs.Panel` defaults to `keepMounted={false}`: a hidden panel is
 * removed from the DOM entirely. Every tab click therefore tore the panel down
 * and built the next one from nothing — and in this dashboard the panels hold
 * ECharts instances and a Leaflet map, so each switch paid a full chart
 * initialisation, every time, forever.
 *
 * The context lets us have it both ways: a tab that has never been opened costs
 * nothing (no eager mount of charts the operator may not look at), and a tab
 * that *has* been opened stays in the DOM, so going back to it is a `hidden`
 * attribute flip instead of a rebuild.
 */
type TabsPanelState = {
  activeValue: TabValue | undefined
  /** Every tab opened so far — panels in here stay mounted. */
  visited: ReadonlySet<TabValue>
}

const TabsPanelStateContext = React.createContext<TabsPanelState | undefined>(undefined)

function Tabs({
  className,
  orientation = "horizontal",
  value,
  defaultValue = 0,
  onValueChange,
  ...props
}: TabsPrimitive.Root.Props) {
  const isControlled = value !== undefined
  const [uncontrolledValue, setUncontrolledValue] = React.useState<TabValue>(defaultValue)
  const activeValue = isControlled ? value : uncontrolledValue

  const [visited, setVisited] = React.useState<ReadonlySet<TabValue>>(
    () => new Set<TabValue>([isControlled ? value : defaultValue])
  )

  const handleValueChange: NonNullable<TabsPrimitive.Root.Props["onValueChange"]> =
    React.useCallback(
      (next, eventDetails) => {
        if (!isControlled) setUncontrolledValue(next)
        setVisited((prev) => (prev.has(next) ? prev : new Set(prev).add(next)))
        onValueChange?.(next, eventDetails)
      },
      [isControlled, onValueChange]
    )

  const panelState = React.useMemo<TabsPanelState>(
    () => ({ activeValue, visited }),
    [activeValue, visited]
  )

  return (
    <TabsPanelStateContext.Provider value={panelState}>
      <TabsPrimitive.Root
        data-slot="tabs"
        data-orientation={orientation}
        {...(isControlled ? { value } : { defaultValue })}
        onValueChange={handleValueChange}
        className={cn(
          "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
          className
        )}
        {...props}
      />
    </TabsPanelStateContext.Provider>
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-[orientation=horizontal]/tabs:h-8 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] min-h-6 flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-semibold whitespace-nowrap text-foreground/60 transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  value,
  keepMounted,
  children,
  ...props
}: TabsPrimitive.Panel.Props) {
  const panelState = React.useContext(TabsPanelStateContext)
  // A panel without an explicit `value` is matched by index by Base UI, which we
  // cannot resolve here — such a panel keeps the stock unmount-when-hidden
  // behaviour rather than silently rendering the wrong thing.
  const isIndexed = value === undefined
  const isOpened =
    isIndexed || panelState === undefined
      ? true
      : panelState.activeValue === value || panelState.visited.has(value)

  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      value={value}
      keepMounted={keepMounted ?? (isIndexed ? undefined : isOpened)}
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    >
      {isOpened ? children : null}
    </TabsPrimitive.Panel>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
