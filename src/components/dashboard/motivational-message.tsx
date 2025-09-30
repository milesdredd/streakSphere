"use client";

import { useState } from "react";
import { generateDailyMotivation } from "@/ai/flows/daily-motivation";
import { useApp } from "@/context/app-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, Bot } from "lucide-react";
import { calculateStreak } from "@/lib/streaks";
import { format } from "date-fns";
import { Skeleton } from "../ui/skeleton";

export function MotivationalMessage() {
  const { tasks, completions, selectedDate } = useApp();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateMessage = async () => {
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const dayOfWeek = format(selectedDate, 'eee').toLowerCase() as 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
      const tasksForDay = tasks.filter(task => task.days.includes(dayOfWeek));
      const completionsForDay = completions.filter(
        (c) => c.date === format(selectedDate, "yyyy-MM-dd") && c.status === "done"
      );
      
      const highestStreak = tasks.reduce((maxStreak, task) => {
        if (task.type === 'streak') {
            const { currentStreak } = calculateStreak(task, completions);
            return Math.max(maxStreak, currentStreak);
        }
        return maxStreak;
      }, 0);

      const input = {
        tasksCompleted: completionsForDay.length,
        totalTasks: tasksForDay.length,
        streak: highestStreak,
      };

      const result = await generateDailyMotivation(input);
      setMessage(result.message);
    } catch (e) {
      setError("Failed to generate message. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Motivation</CardTitle>
        <CardDescription>Get a personalized boost from our AI coach.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <Skeleton className="h-20 w-full" />}
        {!isLoading && message && (
          <Alert>
            <Bot className="h-4 w-4" />
            <AlertTitle>Your Daily Boost!</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        {!isLoading && error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleGenerateMessage} disabled={isLoading} className="w-full">
          <Sparkles className="mr-2 h-4 w-4" />
          {isLoading ? "Generating..." : "Get My Motivation"}
        </Button>
      </CardContent>
    </Card>
  );
}
