export type Task = {
  id: string;
  name: string;
  type: 'normal' | 'streak' | 'chained';
  frequency: 'daily' | 'weekly';
  frequencyCount?: number;
  frequencyPeriod?: 'day' | 'week' | 'month';
  days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  createdAt: string; // ISO date string
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  cooldownHours?: number;
  cooldownMinutes?: number;
};

export type Completion = {
  id: string;
  taskId: string;
  date: string; // YYYY-MM-DD
  status: 'done' | 'missed' | 'skipped';
  completedAt?: string; // ISO string for chained tasks
};

export type Note = {
  date: string; // YYYY-MM-DD
  text: string;
};
