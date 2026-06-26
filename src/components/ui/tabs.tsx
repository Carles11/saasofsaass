"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/5-shared/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        underline: "bg-transparent border-b border-border rounded-none",
        pills: "rounded-lg bg-muted p-[3px]",
        outline: "bg-transparent rounded-none gap-2",
      },
    },
    defaultVariants: {
      variant: "underline",
    },
  }
)

function TabsList({
  className,
  variant = "underline",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium transition-all cursor-pointer",
        // ── underline (default) variant ──
        "px-4 py-2.5",
        "text-muted-foreground hover:text-foreground hover:bg-accent/30",
        "data-active:text-primary",
        "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary after:opacity-0 after:transition-opacity",
        "data-active:after:opacity-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // ── pills variant overrides ──
        "group-data-[variant=pills]/tabs-list:rounded-md group-data-[variant=pills]/tabs-list:border group-data-[variant=pills]/tabs-list:border-transparent group-data-[variant=pills]/tabs-list:h-[calc(100%-1px)] group-data-[variant=pills]/tabs-list:px-1.5 group-data-[variant=pills]/tabs-list:py-0.5 group-data-[variant=pills]/tabs-list:data-active:bg-background group-data-[variant=pills]/tabs-list:data-active:shadow-sm group-data-[variant=pills]/tabs-list:[&::after]:hidden group-data-[variant=pills]/tabs-list:hover:bg-transparent",
        "group-data-[variant=pills]/tabs-list:text-foreground/60 group-data-[variant=pills]/tabs-list:hover:text-foreground",
        "group-data-[variant=pills]/tabs-list:dark:text-muted-foreground group-data-[variant=pills]/tabs-list:dark:hover:text-foreground",
        "group-data-[variant=pills]/tabs-list:data-active:text-foreground group-data-[variant=pills]/tabs-list:dark:data-active:border-input group-data-[variant=pills]/tabs-list:dark:data-active:bg-input/30 group-data-[variant=pills]/tabs-list:dark:data-active:text-foreground",
        // ── outline variant overrides (subtabs) ──
        "group-data-[variant=outline]/tabs-list:border group-data-[variant=outline]/tabs-list:border-border/50 group-data-[variant=outline]/tabs-list:rounded-lg group-data-[variant=outline]/tabs-list:px-4 group-data-[variant=outline]/tabs-list:py-2 group-data-[variant=outline]/tabs-list:bg-transparent group-data-[variant=outline]/tabs-list:[&::after]:hidden",
        "group-data-[variant=outline]/tabs-list:hover:border-muted-foreground/30 group-data-[variant=outline]/tabs-list:hover:text-muted-foreground",
        "group-data-[variant=outline]/tabs-list:data-active:border-primary group-data-[variant=outline]/tabs-list:data-active:text-primary",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
