
"use client";

import { useState } from "react";
import { TaskList } from "@/components/dashboard/task-list";
import { OverviewCards } from "@/components/stats/overview-cards";
import { ActivityHeatmap } from "@/components/stats/activity-heatmap";
import { WeeklyPerformanceChart } from "@/components/stats/weekly-performance-chart";
import { NotesCard } from "@/components/dashboard/notes-card";
import { WeekView } from "@/components/dashboard/week-view";
import { TaskDialog } from "@/components/dashboard/task-dialog";
import type { Task } from "@/lib/types";

export default function DashboardPage() {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskDialogOpen(true);
  };
  
  const handleAddNewTask = () => {
    setEditingTask(null);
    setIsTaskDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        <WeekView />
        <div className="grid gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
          <div className="lg:col-span-2 xl:col-span-3 space-y-6">
            <TaskList handleEditTask={handleEditTask} handleAddNewTask={handleAddNewTask} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              <ActivityHeatmap />
              <WeeklyPerformanceChart />
            </div>
          </div>
          <div className="space-y-6 lg:col-span-1 xl:col-span-1">
            <OverviewCards handleEditTask={handleEditTask} />
            <NotesCard />
          </div>
        </div>
      </div>
      <TaskDialog
        isOpen={isTaskDialogOpen}
        setIsOpen={setIsTaskDialogOpen}
        task={editingTask}
      />
    </>
  );
}
