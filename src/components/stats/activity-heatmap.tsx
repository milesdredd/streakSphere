
"use client";

import { useEffect, useState, useMemo } from "react";
import { useApp } from "@/context/app-provider";
import { format, eachDayOfInterval, startOfYear, endOfYear } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Task } from "@/lib/types";

const getColor = (count: number) => {
  if (count === 0) return "bg-muted/50";
  if (count < 2) return "bg-accent/40";
  if (count < 4) return "bg-accent/60";
  if (count < 6) return "bg-accent/80";
  return "bg-accent";
};

export function ActivityHeatmap() {
  const { completions, tasks } = useApp();
  const [isClient, setIsClient] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("overall");

  const streakTasks = useMemo(() => {
    return tasks.filter(task => task.type === 'streak' || task.type === 'chained');
  }, [tasks]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const data = useMemo(() => {
    if (!isClient) return [];
    const today = new Date();
    const startDate = startOfYear(today);
    const endDate = endOfYear(today);
    const dates = eachDayOfInterval({ start: startDate, end: today });

    const filteredCompletions = selectedTab === 'overall' 
      ? completions 
      : completions.filter(c => c.taskId === selectedTab);

    const completionsByDate = filteredCompletions.reduce((acc, comp) => {
      if (comp.status === 'done') {
        const date = comp.date;
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return dates.map(date => {
      const dateString = format(date, "yyyy-MM-dd");
      return {
        date: dateString,
        count: completionsByDate[dateString] || 0,
      };
    });
  }, [completions, isClient, selectedTab]);

  const monthLabels = useMemo(() => {
    if (!isClient || data.length === 0) return [];
    const labels = [];
    let lastMonth = -1;
    const today = new Date();
    const startDate = startOfYear(today);
    const dates = eachDayOfInterval({ start: startDate, end: today });

    for (let i = 0; i < dates.length; i += 7) {
      const date = dates[i];
      const month = date.getMonth();
      if (month !== lastMonth) {
        labels.push({
          label: format(date, 'MMM'),
          index: Math.floor(i / 7),
        });
        lastMonth = month;
      }
    }
    return labels;
  }, [data, isClient]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Heatmap</CardTitle>
          <CardDescription>Your task completion history for the current year.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="h-48 w-full animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Heatmap</CardTitle>
        <CardDescription>Your task completion history for the current year.</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="overflow-x-auto h-auto">
            <TabsTrigger value="overall">Overall</TabsTrigger>
            {streakTasks.map(task => (
              <TabsTrigger key={task.id} value={task.id}>{task.name}</TabsTrigger>
            ))}
          </TabsList>
        <div className="overflow-x-auto mt-4">
          <TooltipProvider>
            <div className="relative flex justify-start gap-3">
               <div className="flex flex-col text-xs text-muted-foreground mt-6 sticky left-0 z-10 bg-card pr-2">
                  {weekDays.map((day, i) => i % 2 !== 0 ? <div key={day} className="h-4 leading-4 mt-[11px] first:mt-0">{day}</div> : <div key={day} className="h-4"></div>)}
               </div>
              <div className="overflow-visible">
                   <div className="flex gap-[3px] mb-1">
                      {monthLabels.map(month => (
                          <div key={month.index} className="text-xs text-muted-foreground" style={{ marginLeft: `${month.index * 17}px`}}>
                              {month.label}
                          </div>
                      ))}
                   </div>
                <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
                  {data.map(({ date, count }) => (
                    <Tooltip key={date}>
                      <TooltipTrigger asChild>
                        <div className={`w-4 h-4 rounded-sm ${getColor(count)}`} />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {count} {count === 1 ? "task" : "tasks"} on {format(new Date(date), "MMM d, yyyy")}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>
          </TooltipProvider>
        </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
