"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { api } from "~/trpc/react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart";

const chartConfig = {
  minutes: {
    label: "Minutes",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function DashboardChart() {
  // Fetch last 7 days of learning data
  const { data: weeklyData, isLoading } = api.lessonTracker.getWeeklySummary.useQuery();

  if (isLoading) {
    return (
      <Card className="h-max">
        <CardHeader>
          <CardTitle>Activity Minutes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const chartData = weeklyData?.map((day) => ({
    day: day.dayName,
    minutes: Math.round(day.totalDurationSeconds / 60),
  })) ?? [];

  const totalMinutes = chartData.reduce((sum, day) => sum + day.minutes, 0);
  const avgMinutes = totalMinutes / 7;
  const previousWeekAvg = avgMinutes * 0.95; // Mock previous week for trend
  const trendPercentage = ((avgMinutes - previousWeekAvg) / previousWeekAvg * 100).toFixed(1);

  return (
    <Card className="h-max">
      <CardHeader>
        <CardTitle>Activity Minutes</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-64 w-full" config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 20 }}
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
            <Bar dataKey="minutes" fill="var(--color-minutes)" radius={8}>
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
          {parseFloat(trendPercentage) >= 0 ? "Trending up" : "Trending down"} by {Math.abs(parseFloat(trendPercentage))}% this week
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total minutes of learning activity
        </div>
      </CardFooter>
    </Card>
  );
}