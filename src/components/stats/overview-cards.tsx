
"use client";

import { useApp } from "@/context/app-provider";
import { calculateStreak } from "@/lib/streaks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Flame, Trophy, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { eachDayOfInterval, isBefore, isWithinInterval, format, differenceInDays } from "date-fns";
import type { Task, Completion } from "@/lib/types";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

interface OverviewCardsProps {
    handleEditTask: (task: Task) => void;
}

export function OverviewCards({ handleEditTask }: OverviewCardsProps) {
  const { tasks, completions, deleteTask } = useApp();

  const totalCompletions = completions.filter(c => c.status === 'done').length;

  let longestStreakOverall = 0;
  const streakTasks = tasks.filter(task => task.type === 'streak' || task.type === 'chained');

  streakTasks.forEach(task => {
      const { longestStreak } = calculateStreak(task, completions);
      if (longestStreak > longestStreakOverall) {
        longestStreakOverall = longestStreak;
      }
  });

  const getProgress = (task: Task) => {
    if (!task.startDate || !task.endDate) return 0;
    const start = new Date(task.startDate);
    const end = new Date(task.endDate);

    if (isBefore(end, start)) return 0;

    const dayOfWeekKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
    const interval = eachDayOfInterval({ start, end });
    
    let totalPossibleCompletions = 0;
    if (task.type === 'chained' && task.frequencyCount && task.frequencyPeriod === 'day') {
        const totalDays = interval.filter(d => task.days.includes(dayOfWeekKey[d.getDay()])).length;
        totalPossibleCompletions = totalDays * task.frequencyCount;
    } else {
        totalPossibleCompletions = interval.filter(d => task.days.includes(dayOfWeekKey[d.getDay()])).length;
    }

    if (totalPossibleCompletions === 0) return 0;
    
    const completedCount = completions.filter(c =>
      c.taskId === task.id &&
      c.status === 'done' &&
      isWithinInterval(new Date(c.date), { start, end })
    ).length;

    return (completedCount / totalPossibleCompletions) * 100;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Completions</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCompletions}</div>
        </CardContent>
      </Card>
      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">All Streaks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {streakTasks.length > 0 ? streakTasks.map(task => {
                const progress = getProgress(task);
                const { currentStreak } = calculateStreak(task, completions);
                return (
                    <div key={task.id} className="space-y-1 group">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium">{task.name}</span>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center text-amber-600 dark:text-amber-500">
                                    <Flame className="w-4 h-4 mr-1" />
                                    <span>{currentStreak}d</span>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        <span>Edit</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => deleteTask(task.id)}
                                        className="text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Delete</span>
                                    </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        {progress > 0 && (
                            <div className="flex items-center gap-2">
                                <Progress value={progress} className="h-2 bg-red-100 dark:bg-red-900/50" >
                                    <div 
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${progress}%`,
                                            backgroundColor: `hsl(${progress * 1.2}, 70%, 50%)`
                                        }}
                                    />
                                </Progress>
                                <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                            </div>
                        )}
                    </div>
                )
            }) : <p className="text-sm text-muted-foreground">No streak tasks yet.</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{longestStreakOverall} days</div>
        </CardContent>
      </Card>
    </div>
  );
}
