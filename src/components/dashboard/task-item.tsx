"use client";

import { useApp } from "@/context/app-provider";
import type { Task } from "@/lib/types";
import { calculateStreak } from "@/lib/streaks";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Flame, MoreVertical, Pencil, Trash2, Hourglass } from "lucide-react";
import { format, isBefore, startOfToday, eachDayOfInterval, isWithinInterval, isAfter, differenceInDays, addHours, addMinutes, differenceInMilliseconds } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

interface TaskItemProps {
  task: Task;
  onEdit: () => void;
}

const Countdown = ({ to }: { to: Date }) => {
    const [diff, setDiff] = useState(differenceInMilliseconds(to, new Date()));

    useEffect(() => {
        const timer = setInterval(() => {
            const newDiff = differenceInMilliseconds(to, new Date());
            if (newDiff <= 0) {
                clearInterval(timer);
                setDiff(0);
            } else {
                setDiff(newDiff);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [to]);

    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return (
        <div className="flex items-center text-xs text-muted-foreground">
            <Hourglass className="w-3 h-3 mr-1" />
            <span>
                {hours > 0 && `${hours}h `}
                {minutes > 0 && `${minutes}m `}
                {seconds}s
            </span>
        </div>
    );
}


export function TaskItem({ task, onEdit }: TaskItemProps) {
  const { completions, toggleTaskCompletion, deleteTask, selectedDate } =
    useApp();
  const dateString = format(selectedDate, "yyyy-MM-dd");

  const completionsForDay = completions.filter(
    (c) => c.taskId === task.id && c.date === dateString
  );

  const lastCompletion = task.type === 'chained' ? completionsForDay.sort((a,b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0] : completionsForDay[0];

  const { currentStreak } = calculateStreak(task, completions);

  const handleToggle = () => {
    if (isAfter(selectedDate, startOfToday())) return;
    toggleTaskCompletion(task.id, selectedDate);
  };

  const isChecked = task.type === 'chained' ? false : lastCompletion?.status === "done";
  const isPast = isBefore(selectedDate, startOfToday());
  const isFuture = isAfter(selectedDate, startOfToday());
  const isMissed = isPast && !lastCompletion;

  const cooldownEndsAt = lastCompletion && task.type === 'chained' && lastCompletion.completedAt ? addMinutes(addHours(new Date(lastCompletion.completedAt), task.cooldownHours || 0), task.cooldownMinutes || 0) : null;
  const onCooldown = cooldownEndsAt ? isBefore(new Date(), cooldownEndsAt) : false;

  const getProgress = () => {
    if (!task.startDate || !task.endDate) return 0;
    const start = new Date(task.startDate);
    const end = new Date(task.endDate);

    if (isBefore(end, start)) return 0;

    const dayOfWeekKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
    const interval = eachDayOfInterval({ start, end });
    
    let totalPossibleCompletions = 0;
    if (task.type === 'chained') {
        const totalDays = interval.filter(d => task.days.includes(dayOfWeekKey[d.getDay()])).length;
        const cooldownMinutes = (task.cooldownHours || 0) * 60 + (task.cooldownMinutes || 0);
        const dailyCount = cooldownMinutes > 0 ? Math.floor((24 * 60) / cooldownMinutes) : 1;
        totalPossibleCompletions = totalDays * dailyCount;
    } else if ((task.type === 'streak' || task.type === 'normal') && task.frequencyCount && task.frequencyPeriod) {
        let countMultiplier = 1;
        if (task.frequencyPeriod === 'day') {
            countMultiplier = interval.filter(d => task.days.includes(dayOfWeekKey[d.getDay()])).length;
        } else if (task.frequencyPeriod === 'week') {
            countMultiplier = Math.ceil(interval.length / 7);
        } else if (task.frequencyPeriod === 'month') {
            countMultiplier = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
        }
        totalPossibleCompletions = task.frequencyCount * countMultiplier;
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
  
  const progress = getProgress();

  const getFrequencyText = () => {
    if (task.type === 'chained') return 'Chained';
    if (task.frequencyCount && task.frequencyPeriod) {
        if (task.frequencyCount === 1 && task.frequencyPeriod === 'day') return 'Daily';
        if (task.frequencyCount === 1 && task.frequencyPeriod === 'week') return 'Weekly';
        return `${task.frequencyCount} times a ${task.frequencyPeriod}`;
    }
    return task.frequency;
  }

  const getChainedTaskDailyGoal = () => {
    const cooldownMinutes = (task.cooldownHours || 0) * 60 + (task.cooldownMinutes || 0);
    if (cooldownMinutes > 0) {
      return Math.floor((24 * 60) / cooldownMinutes);
    }
    return '∞';
  }

  return (
    <div
      className={`flex items-center p-3 rounded-lg border transition-colors ${
        isChecked ? "bg-accent/30 border-accent/50" : "bg-card"
      } ${isMissed ? "opacity-60" : ""}`}
    >
      <Checkbox
        id={`task-${task.id}`}
        checked={isChecked}
        onCheckedChange={handleToggle}
        className="mr-4"
        aria-label={`Mark ${task.name} as done`}
        disabled={isFuture || onCooldown}
      />
      <div className="flex-1">
        <label
          htmlFor={`task-${task.id}`}
          className={`font-medium cursor-pointer ${
            isChecked ? "line-through text-muted-foreground" : ""
          } ${isFuture || onCooldown ? "cursor-not-allowed" : ""}`}
        >
          {task.name}
        </label>
        <div className="flex items-center gap-4">
          <p className="text-xs text-muted-foreground capitalize">{getFrequencyText()}</p>
           {task.type === "chained" && (
            <p className="text-xs text-muted-foreground">
              ({completionsForDay.length} / {getChainedTaskDailyGoal()} completed)
            </p>
          )}
          {(task.type === "streak" || task.type === 'chained') && currentStreak > 0 && (
            <div className="flex items-center text-sm text-amber-600 dark:text-amber-500">
              <Flame className="w-4 h-4 mr-1" />
              <span>{currentStreak} day streak</span>
            </div>
          )}
          {onCooldown && cooldownEndsAt && <Countdown to={cooldownEndsAt} />}
          {progress !== null && progress > 0 && (
            <div className="flex-1 max-w-[200px] mt-1.5 flex items-center gap-2">
                <Progress value={progress} className="h-2 bg-red-100 dark:bg-red-900/50">
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
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
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
  );
}
