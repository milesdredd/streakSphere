"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { format, startOfToday, addHours, addMinutes, isBefore } from "date-fns";
import { type Task, type Completion, type Note } from "@/lib/types";
import { initialTasks } from "@/lib/data";

interface AppContextType {
  tasks: Task[];
  completions: Completion[];
  notes: Note[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskCompletion: (
    taskId: string,
    date: Date,
    status?: Completion["status"]
  ) => void;
  getCompletionsForDate: (date: Date) => Completion[];
  getNoteForDate: (date: Date) => Note | undefined;
  updateNote: (date: Date, text: string) => void;
  isLoaded: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem("streak-sphere-tasks");
    const savedCompletions = localStorage.getItem("streak-sphere-completions");
    const savedNotes = localStorage.getItem("streak-sphere-notes");

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks(initialTasks);
    }
    
    if (savedCompletions) {
      setCompletions(JSON.parse(savedCompletions));
    }
    
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }

    setSelectedDate(startOfToday());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("streak-sphere-tasks", JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("streak-sphere-completions", JSON.stringify(completions));
    }
  }, [completions, isLoaded]);

  useEffect(() => {
    if(isLoaded) {
      localStorage.setItem("streak-sphere-notes", JSON.stringify(notes));
    }
  }, [notes, isLoaded]);

  const addTask = (taskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...taskData,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    setCompletions((prev) => prev.filter((comp) => comp.taskId !== taskId));
  };

  const toggleTaskCompletion = (
    taskId: string,
    date: Date,
    newStatus: Completion["status"] = "done"
  ) => {
    const dateString = format(date, "yyyy-MM-dd");
    const task = tasks.find(t => t.id === taskId);

    if (task?.type === 'chained') {
        const completionsForDay = completions.filter(c => c.taskId === taskId && c.date === dateString);
        const lastCompletion = completionsForDay.sort((a,b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
        
        if (lastCompletion && lastCompletion.completedAt) {
            const cooldownEndsAt = addMinutes(addHours(new Date(lastCompletion.completedAt), task.cooldownHours || 0), task.cooldownMinutes || 0);
            if (isBefore(new Date(), cooldownEndsAt)) {
                return; // On cooldown
            }
        }

        const newCompletion: Completion = {
            id: `comp-${Date.now()}`,
            taskId,
            date: dateString,
            status: 'done',
            completedAt: new Date().toISOString(),
        };
        setCompletions((prev) => [...prev, newCompletion]);

    } else {
        const existingCompletionIndex = completions.findIndex(
            (c) => c.taskId === taskId && c.date === dateString
        );

        if (existingCompletionIndex > -1) {
            const existingCompletion = completions[existingCompletionIndex];
            if (existingCompletion.status === newStatus) {
                // If toggling the same status, remove it (mark as incomplete)
                setCompletions((prev) =>
                    prev.filter((_, index) => index !== existingCompletionIndex)
                );
            } else {
                // If changing status, update it
                setCompletions((prev) =>
                    prev.map((c, index) =>
                        index === existingCompletionIndex ? { ...c, status: newStatus } : c
                    )
                );
            }
        } else {
            // If no completion exists, add a new one
            const newCompletion: Completion = {
                id: `comp-${Date.now()}`,
                taskId,
                date: dateString,
                status: newStatus,
            };
            setCompletions((prev) => [...prev, newCompletion]);
        }
    }
  };

  const getCompletionsForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return completions.filter((c) => c.date === dateString);
  };

  const getNoteForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return notes.find((n) => n.date === dateString);
  };

  const updateNote = (date: Date, text: string) => {
    const dateString = format(date, "yyyy-MM-dd");
    const existingNoteIndex = notes.findIndex((n) => n.date === dateString);

    if (existingNoteIndex > -1) {
      if (text === "") {
        setNotes((prev) =>
          prev.filter((_, index) => index !== existingNoteIndex)
        );
      } else {
        setNotes((prev) =>
          prev.map((n, index) =>
            index === existingNoteIndex ? { ...n, text } : n
          )
        );
      }
    } else if (text !== "") {
      const newNote: Note = { date: dateString, text };
      setNotes((prev) => [...prev, newNote]);
    }
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        completions,
        notes,
        selectedDate,
        setSelectedDate,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        getCompletionsForDate,
        getNoteForDate,
        updateNote,
        isLoaded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
