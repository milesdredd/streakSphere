"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useApp } from "@/context/app-provider";
import type { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import { addDays, addWeeks, addMonths, addYears, differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears, startOfToday } from "date-fns";

const daysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const durationUnits = ["days", "weeks", "months", "years"] as const;
const frequencyPeriods = ["day", "week", "month"] as const;

const taskSchema = z.object({
  name: z.string().min(3, { message: "Task name must be at least 3 characters." }),
  type: z.enum(["normal", "streak", "chained"]),
  frequencyCount: z.coerce.number().min(1).optional(),
  frequencyPeriod: z.enum(frequencyPeriods).optional(),
  days: z.array(z.enum(daysOfWeek)).nonempty({ message: "Please select at least one day." }),
  duration: z.coerce.number().min(0).optional(),
  durationUnit: z.enum(durationUnits).optional(),
  cooldownHours: z.coerce.number().min(0).optional(),
  cooldownMinutes: z.coerce.number().min(0).optional(),
});

interface TaskDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  task: Task | null;
}

const getDuration = (start?: string, end?: string): [number | undefined, typeof durationUnits[number] | undefined] => {
    if (!start || !end) return [undefined, undefined];

    const startDate = new Date(start);
    const endDate = new Date(end);

    const yearDiff = differenceInYears(endDate, startDate);
    if (yearDiff > 0 && differenceInDays(endDate, addYears(startDate, yearDiff)) === 0) return [yearDiff, 'years'];

    const monthDiff = differenceInMonths(endDate, startDate);
    if (monthDiff > 0 && differenceInDays(endDate, addMonths(startDate, monthDiff)) === 0) return [monthDiff, 'months'];

    const weekDiff = differenceInWeeks(endDate, startDate);
    if (weekDiff > 0 && differenceInDays(endDate, addWeeks(startDate, weekDiff)) === 0) return [weekDiff, 'weeks'];
    
    return [differenceInDays(endDate, startDate) + 1, 'days'];
};

export function TaskDialog({ isOpen, setIsOpen, task }: TaskDialogProps) {
  const { addTask, updateTask } = useApp();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: "",
      type: "streak",
      frequencyCount: 1,
      frequencyPeriod: "day",
      days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      duration: 1,
      durationUnit: "months",
      cooldownHours: 1,
      cooldownMinutes: 0,
    },
  });

  useEffect(() => {
    if (task) {
      const [duration, durationUnit] = getDuration(task.startDate, task.endDate);
      form.reset({
        name: task.name,
        type: task.type,
        frequencyCount: task.frequencyCount || 1,
        frequencyPeriod: task.frequencyPeriod || 'day',
        days: task.days,
        duration: duration,
        durationUnit: durationUnit,
        cooldownHours: task.cooldownHours ?? 1,
        cooldownMinutes: task.cooldownMinutes ?? 0,
      });
    } else {
      form.reset({
        name: "",
        type: "streak",
        frequencyCount: 1,
        frequencyPeriod: "day",
        days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        duration: 1,
        durationUnit: "months",
        cooldownHours: 1,
        cooldownMinutes: 0,
      });
    }
  }, [task, form, isOpen]);
  
  const type = form.watch("type");
  const frequencyPeriod = form.watch("frequencyPeriod");
  
  useEffect(() => {
    if (frequencyPeriod === "day") {
      form.setValue("days", ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]);
    } else if (frequencyPeriod === "week") {
        if(form.getValues("days").length > 1) {
            form.setValue("days", [daysOfWeek[new Date().getDay()]]);
        }
    }
  }, [frequencyPeriod, form]);

  const onSubmit = (data: z.infer<typeof taskSchema>) => {
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (data.duration && data.durationUnit) {
        const now = startOfToday();
        startDate = now.toISOString();
        switch(data.durationUnit) {
            case 'days':
                endDate = addDays(now, data.duration - 1).toISOString();
                break;
            case 'weeks':
                endDate = addWeeks(now, data.duration).toISOString();
                break;
            case 'months':
                endDate = addMonths(now, data.duration).toISOString();
                break;
            case 'years':
                endDate = addYears(now, data.duration).toISOString();
                break;
        }
    }
    
    let frequency: 'daily' | 'weekly' | undefined = undefined;
    if (data.frequencyPeriod === 'day') {
      frequency = 'daily';
    } else if (data.frequencyPeriod === 'week') {
      frequency = 'weekly';
    }

    const taskData: Omit<Task, "id" | "createdAt"> & { id?: string, createdAt?: string } = {
        ...data,
        frequency: frequency || 'daily',
        startDate: startDate,
        endDate: endDate,
    };

    if (task) {
      updateTask({ ...task, ...taskData });
      toast({ title: "Task Updated", description: `"${data.name}" has been updated.` });
    } else {
      addTask(taskData);
      toast({ title: "Task Added", description: `"${data.name}" has been added.` });
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update the details of your task." : "Create a new task to track."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Morning Run" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Duration</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 30" {...field} value={field.value ?? ''}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="durationUnit"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a unit" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {durationUnits.map(unit => (
                                        <SelectItem key={unit} value={unit} className="capitalize">{unit}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="streak" />
                        </FormControl>
                        <FormLabel className="font-normal">Streak</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="normal" />
                        </FormControl>
                        <FormLabel className="font-normal">Normal</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="chained" />
                        </FormControl>
                        <FormLabel className="font-normal">Chained</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(type === "streak") && (
              <div className="grid grid-cols-2 gap-4">
                  <FormField
                      control={form.control}
                      name="frequencyCount"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>Repeat</FormLabel>
                              <FormControl>
                                  <Input type="number" placeholder="e.g., 3" {...field} value={field.value ?? ''}/>
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="frequencyPeriod"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>Period</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                  <SelectTrigger>
                                      <SelectValue placeholder="Select a period" />
                                  </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                      {frequencyPeriods.map(unit => (
                                          <SelectItem key={unit} value={unit} className="capitalize">per {unit}</SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
              </div>
            )}

            {type === "chained" && (
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="cooldownHours"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cooldown Hours</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 1" {...field} value={field.value ?? ''}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="cooldownMinutes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cooldown Minutes</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 30" {...field} value={field.value ?? ''}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}
            
            {frequencyPeriod === "week" && (
              <FormField
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of the week</FormLabel>
                    <FormControl>
                      <ToggleGroup type="multiple" variant="outline" onValueChange={(value) => field.onChange(value.length > 0 ? value as any[] : form.getValues("days"))} defaultValue={field.value}>
                        {daysOfWeek.map(day => (
                          <ToggleGroupItem key={day} value={day} className="capitalize" aria-label={day}>{day.slice(0,1)}</ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    </FormControl>
                     <FormDescription>Select the day(s) of the week for this task.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}


            <DialogFooter>
              <Button type="submit">Save Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
