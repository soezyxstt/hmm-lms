"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import { useTheme } from "next-themes"
import { Monitor, Moon, Sun, Type, Palette, Layout } from "lucide-react"
import { useDisplaySetting } from '~/components/providers/display-provider'
import { FONT_FAMILIES, FONT_SIZES, SPACING_SIZES } from '~/components/providers/constants'
import { Separator } from '~/components/ui/separator'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { spacing, fontFamily, fontSize, setFontFamily, setFontSize, setSpacing, reset } = useDisplaySetting()

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="">
        <p className="text-muted-foreground mt-2">Customize your experience with personalized preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Theme Settings */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme
            </CardTitle>
            <CardDescription>Choose your preferred color scheme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                className="justify-start"
                onClick={() => setTheme("light")}
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                className="justify-start"
                onClick={() => setTheme("dark")}
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                className="justify-start"
                onClick={() => setTheme("system")}
              >
                <Monitor className="mr-2 h-4 w-4" />
                System
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Typography Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Typography
            </CardTitle>
            <CardDescription>Adjust font settings for better readability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Font Size */}
              <div className="space-y-3">
                <Label htmlFor="font-size">Font Size</Label>
                <Select value={fontSize} onValueChange={(nFS) => setFontSize(nFS as typeof fontSize)}>
                  <SelectTrigger id="font-size">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FONT_SIZES).map(([name, { value, label }]) => (
                      <SelectItem key={value + '-font-size'} value={name}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Font Family */}
              <div className="space-y-3">
                <Label htmlFor="font-family">Font Family</Label>
                <Select value={fontFamily} onValueChange={(nFF) => setFontFamily(nFF as typeof fontFamily)}>
                  <SelectTrigger id="font-family">
                    <SelectValue placeholder="Select font family" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FONT_FAMILIES).map(([name, font]) => (
                      <SelectItem key={font.value + '-font-family'} value={name}>
                        <span className={font.class}>{font.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview Text */}
            <div className="space-y-3">
              <Label>Preview</Label>
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">Sample text:</p>
                <p style={{ fontSize: `${fontSize}px` }}>
                  The quick brown fox jumps over the lazy dog. This is how your text will appear with the current
                  settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Layout Spacing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Layout Spacing
          </CardTitle>
          <CardDescription>Adjust the overall spacing and density of the interface</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <Label htmlFor="spacing">Spacing Density</Label>
              <Select value={spacing} onValueChange={(nSS) => setSpacing(nSS as typeof spacing)}>
                <SelectTrigger id="spacing">
                  <SelectValue placeholder="Select spacing" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SPACING_SIZES).map(([name, option]) => (
                    <SelectItem key={option.value + '-spacing'} value={name}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2 lg:col-span-2">
              <Label>Current Spacing</Label>
              <div className="rounded-lg border p-4 bg-muted/50 mt-3">
                <div className="space-y-2">
                  <div className="h-4 bg-primary/20 rounded"></div>
                  <div className="h-4 bg-primary/20 rounded w-3/4"></div>
                  <div className="h-4 bg-primary/20 rounded w-1/2"></div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  This preview shows how elements will be spaced with the &quot;
                  {SPACING_SIZES[spacing].label}&quot; setting.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Accessibility</CardTitle>
            <CardDescription>Coming soon - High contrast, reduced motion, and more</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Language</CardTitle>
            <CardDescription>Coming soon - Interface language preferences</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notifications</CardTitle>
            <CardDescription>Coming soon - Customize your notification preferences</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Separator />

      <div className="flex justify-end">
        <Button className='cursor-pointer' onClick={reset}>
          Reset
        </Button>
      </div>
    </div>
  )
}
