
"use client";

import { useApp } from "@/context/app-provider";
import { TaskItem } from "./task-item";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format, isToday } from "date-fns";
import type { Task } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";

interface TaskListProps {
  handleEditTask: (task: Task) => void;
  handleAddNewTask: () => void;
}

export function TaskList({ handleEditTask, handleAddNewTask }: TaskListProps) {
  const { tasks, selectedDate, isLoaded } = useApp();

  if (!isLoaded) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                 <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-10 w-28" />
            </CardHeader>
            <CardContent className="space-y-4">
                 <Skeleton className="h-10 w-64" />
                 <Skeleton className="h-20 w-full" />
                 <Skeleton className="h-20 w-full" />
                 <Skeleton className="h-20 w-full" />
            </CardContent>
        </Card>
    )
  }

  const dayOfWeek = format(selectedDate, 'eee').toLowerCase() as 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

  const tasksForSelectedDay = tasks.filter(task => {
    const startDate = task.startDate ? new Date(task.startDate) : null;
    const endDate = task.endDate ? new Date(task.endDate) : null;

    if (startDate && selectedDate < startDate) return false;
    if (endDate && selectedDate > endDate) return false;

    if (task.frequency === 'daily' || task.type === 'chained') {
      return task.days.includes(dayOfWeek);
    }
    if (task.frequency === 'weekly') {
      return task.days.includes(dayOfWeek);
    }
    return false;
  });

  const normalTasks = tasksForSelectedDay.filter((task) => task.type === "normal");
  const streakTasks = tasksForSelectedDay.filter((task) => task.type === "streak" || task.type === "chained");

  const dateText = isToday(selectedDate)
    ? "Today's Tasks"
    : `Tasks for ${format(selectedDate, "MMMM d")}`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{dateText}</CardTitle>
          <CardDescription>{format(selectedDate, "eeee, MMMM do, yyyy")}</CardDescription>
        </div>
        <Button size="sm" onClick={handleAddNewTask}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({tasksForSelectedDay.length})</TabsTrigger>
            <TabsTrigger value="streaks">Streaks ({streakTasks.length})</TabsTrigger>
            <TabsTrigger value="normal">Normal ({normalTasks.length})</TabsTrigger>
          </TabsList>
          {tasksForSelectedDay.length > 0 ? (
            <>
              <TabsContent value="all" className="space-y-4 mt-4">
                {tasksForSelectedDay.map((task) => (
                  <TaskItem key={task.id} task={task} onEdit={() => handleEditTask(task)} />
                ))}
              </TabsContent>
              <TabsContent value="streaks" className="space-y-4 mt-4">
                {streakTasks.map((task) => (
                  <TaskItem key={task.id} task={task} onEdit={() => handleEditTask(task)} />
                ))}
              </TabsContent>
              <TabsContent value="normal" className="space-y-4 mt-4">
                {normalTasks.map((task) => (
                  <TaskItem key={task.id} task={task} onEdit={() => handleEditTask(task)} />
                ))}
              </TabsContent>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
                <p>No tasks for this day.</p>
                <p className="text-sm">Add a new task or select another date.</p>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
