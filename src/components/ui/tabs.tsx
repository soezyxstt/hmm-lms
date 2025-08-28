"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "~/lib/utils"
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

// Main Tabs component - This is where the URL synchronization logic lives.
function Tabs({
  className,
  defaultValue,
  onValueChange,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get the initial active tab value from the URL's 'tab' query parameter.
  // If it doesn't exist, fall back to the provided defaultValue.
  const initialTab = searchParams.get("tab") ?? defaultValue

  // State to manage the currently active tab.
  const [activeTab, setActiveTab] = React.useState(initialTab)

  // This effect ensures that if the user navigates with browser back/forward buttons,
  // the component's active tab state stays in sync with the URL.
  React.useEffect(() => {
    const tabFromUrl = searchParams.get("tab")
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams, activeTab])

  // This function handles changing the tab.
  const handleValueChange = React.useCallback(
    (value: string) => {
      // Update the internal state.
      setActiveTab(value)

      // Create a new URLSearchParams object from the current search params.
      const newSearchParams = new URLSearchParams(searchParams.toString())
      // Set the 'tab' parameter to the new value.
      newSearchParams.set("tab", value)

      // Update the URL without reloading the page.
      // Using router.push adds a new entry to the browser's history stack.
      // Use router.replace if you don't want to add to history.
      router.push(`${pathname}?${newSearchParams.toString()}`)

      // If an external onValueChange handler is provided, call it.
      if (onValueChange) {
        onValueChange(value)
      }
    },
    [pathname, router, searchParams, onValueChange]
  )

  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      value={activeTab} // Control the active tab using our state
      onValueChange={handleValueChange} // Use our custom handler
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

// TabsList component (unchanged)
function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground/70 inline-flex w-fit items-center justify-center rounded-md p-0.5",
        className
      )}
      {...props}
    />
  )
}

// TabsTrigger component (unchanged)
function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "hover:text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-xs [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

// TabsContent component (unchanged)
function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
