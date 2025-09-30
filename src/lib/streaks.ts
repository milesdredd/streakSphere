import { type Completion, type Task } from "@/lib/types";
import {
  isSameDay,
  subDays,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  format,
} from "date-fns";

export function calculateStreak(
  task: Task,
  completions: Completion[]
): { currentStreak: number; longestStreak: number; lastCompletionDate: Date | null } {
  if (task.type !== "streak" && task.type !== "chained") {
    return { currentStreak: 0, longestStreak: 0, lastCompletionDate: null };
  }

  const taskCompletions = completions
    .filter((c) => c.taskId === task.id && c.status === "done")
    .map((c) => new Date(c.date))
    .sort((a, b) => b.getTime() - a.getTime());

  if (taskCompletions.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastCompletionDate: null };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let lastCompletionDate: Date | null = taskCompletions[0];
  
  const uniqueCompletionDates = taskCompletions.filter((date, index, self) =>
    index === self.findIndex((d) => isSameDay(d, date))
  );

  const frequency = (task.type === 'chained') ? 'daily' : task.frequency;

  if (frequency === "daily") {
    let currentDate = new Date();
    
    // Check if today or yesterday was completed
    const todayCompleted = uniqueCompletionDates.some(compDate => isSameDay(compDate, currentDate));
    const yesterdayCompleted = uniqueCompletionDates.some(compDate => isSameDay(compDate, subDays(currentDate, 1)));

    if (todayCompleted || yesterdayCompleted) {
        if(todayCompleted) {
            currentStreak = 1;
        } else {
            currentStreak = 0; // Will be incremented to 1 just below
        }

        // Find the most recent completion to start counting from
        let lastStreakDate = uniqueCompletionDates.find(d => isSameDay(d, currentDate)) || uniqueCompletionDates.find(d => isSameDay(d, subDays(currentDate, 1)));

        if (lastStreakDate) {
            if (isSameDay(lastStreakDate, subDays(currentDate, 1))) {
                currentStreak = 1;
            }

            let streakContinues = true;
            let dayToTest = subDays(lastStreakDate, 1);
            let i = uniqueCompletionDates.indexOf(lastStreakDate) + 1;

            while(streakContinues && i < uniqueCompletionDates.length) {
                if (isSameDay(uniqueCompletionDates[i], dayToTest)) {
                    currentStreak++;
                    dayToTest = subDays(dayToTest, 1);
                    i++;
                } else if (isSameDay(uniqueCompletionDates[i], subDays(dayToTest,1))) {
                    streakContinues = false; // Gap in streak
                } else {
                    i++; // Might be multiple completions on same day, skip
                }
            }
        }
    }


    // Calculate longest streak
    if (uniqueCompletionDates.length > 0) {
        longestStreak = 1;
        let tempLongest = 1;
        for (let i = 1; i < uniqueCompletionDates.length; i++) {
            const expectedDate = subDays(uniqueCompletionDates[i-1], 1);
            if (isSameDay(uniqueCompletionDates[i], expectedDate)) {
                tempLongest++;
            } else {
                tempLongest = 1;
            }
            if (tempLongest > longestStreak) {
                longestStreak = tempLongest;
            }
        }
    }

  } else if (frequency === "weekly") {
    // Simplified weekly streak logic
    // Counts consecutive weeks with at least one completion
    const completionWeeks = [
      ...new Set(
        uniqueCompletionDates.map((date) =>
          format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd")
        )
      ),
    ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (completionWeeks.length > 0) {
      const thisWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
      const lastWeekStart = format(startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }), "yyyy-MM-dd");

      if (completionWeeks[0] === thisWeekStart || completionWeeks[0] === lastWeekStart) {
        currentStreak = 1;
        for (let i = 0; i < completionWeeks.length - 1; i++) {
          const week = new Date(completionWeeks[i]);
          const prevWeek = new Date(completionWeeks[i + 1]);
          if (
            format(startOfWeek(subDays(week, 7), { weekStartsOn: 1 }), "yyyy-MM-dd") === 
            format(startOfWeek(prevWeek, { weekStartsOn: 1 }), "yyyy-MM-dd")
          ) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // Calculate longest weekly streak
    if (completionWeeks.length > 0) {
        longestStreak = 1;
        let tempLongest = 1;
        for (let i = 0; i < completionWeeks.length - 1; i++) {
            const week = new Date(completionWeeks[i]);
            const prevWeek = new Date(completionWeeks[i + 1]);
            if (
              format(startOfWeek(subDays(week, 7), { weekStartsOn: 1 }), "yyyy-MM-dd") === 
              format(startOfWeek(prevWeek, { weekStartsOn: 1 }), "yyyy-MM-dd")
            ) {
                tempLongest++;
            } else {
                tempLongest = 1;
            }
            if (tempLongest > longestStreak) {
                longestStreak = tempLongest;
            }
        }
    }
  }

  return { currentStreak, longestStreak, lastCompletionDate };
}
