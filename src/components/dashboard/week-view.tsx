"use client";

import { useApp } from "@/context/app-provider";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";

export function WeekView() {
  const { selectedDate, setSelectedDate, isLoaded } = useApp();

  if (!isLoaded) {
    return (
       <Card>
        <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
        </CardContent>
       </Card>
    )
  }

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Sunday as the start of the week
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => (
            <Button
              key={day.toString()}
              variant={isSameDay(day, selectedDate) ? "default" : "outline"}
              onClick={() => setSelectedDate(day)}
              className="flex flex-col h-auto p-2"
            >
              <span className="text-xs">{format(day, "eee")}</span>
              <span className="text-lg font-bold">{format(day, "d")}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
