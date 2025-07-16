"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart"

const chartData = [
  { day: "Sunday", minutes: 186 },
  { day: "Monday", minutes: 305 },
  { day: "Tuesday", minutes: 237 },
  { day: "Wednesday", minutes: 73 },
  { day: "Thursday", minutes: 209 },
  { day: "Friday", minutes: 214 },
  { day: "Saturday", minutes: 190 },
]

const chartConfig = {
  minutes: {
    label: "Minutes",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function DashboardChart() {
  return (
    <Card className='h-max'>
      <CardHeader>
        <CardTitle>Activity Minutes</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer className='h-64 w-full' config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value: string) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="minutes" fill="var(--color-minutes)" radius={8} width={16}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this week <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total minutes of learning activity
        </div>
      </CardFooter>
    </Card>
  )
}
