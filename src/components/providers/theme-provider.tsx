"use client"

import type * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export const THEMES = [
  'light', 'dark',
  'violet', 'dark-violet',
  'orange', 'dark-orange',
  'teal', 'dark-teal',
  'emerald', 'dark-emerald'
]

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider themes={THEMES} {...props}>{children}</NextThemesProvider>
}
