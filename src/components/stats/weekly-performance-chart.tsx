
"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { useApp } from "@/context/app-provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  tasks: {
    label: "Tasks Completed",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

export function WeeklyPerformanceChart() {
  const { completions } = useApp();

  const chartData = useMemo(() => {
    const today = new Date();
    const last7Days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    });

    const completionsByDate = completions.reduce((acc, comp) => {
      if (comp.status === "done") {
        const date = comp.date;
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return last7Days.map((day) => {
      const dateString = format(day, "yyyy-MM-dd");
      return {
        date: format(day, "eee"),
        tasks: completionsByDate[dateString] || 0,
      };
    });
  }, [completions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Performance</CardTitle>
        <CardDescription>Tasks completed over the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-48 w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
             <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="tasks" fill="var(--color-tasks)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
