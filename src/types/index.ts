export type Partner = 'jeronimo' | 'zahria';

export type Assignee = 'jeronimo' | 'zahria' | 'both';

export type Priority = 'low' | 'medium' | 'high';

export type TaskCategory = 
  | 'hogar' 
  | 'pareja' 
  | 'compras' 
  | 'finanzas' 
  | 'salud' 
  | 'viajes' 
  | 'trabajo' 
  | 'otro';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export type ReminderOffset = 'at_time' | '15_min' | '1_hour' | '1_day' | 'none';

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm (hora de inicio)
  endTime?: string; // HH:mm (hora de fin, opcional)
  allDay: boolean;
  assignee: Assignee;
  category: TaskCategory;
  priority: Priority;
  completed: boolean;
  completedAt?: string;
  completedBy?: Partner;
  recurrence: RecurrenceType;
  reminder: ReminderOffset;
  createdBy?: Partner;
  createdAt: string;
  updatedAt: string;
}

export type CalendarViewType = 'month' | 'week' | 'year' | 'agenda';

export interface CategoryInfo {
  id: TaskCategory;
  name: string;
  icon: string;
  color: string; // Tailwind color class or hex
  badgeBg: string;
  badgeText: string;
}

export interface UserProfileInfo {
  id: Assignee;
  name: string;
  shortName: string;
  avatarColor: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  icon: string;
}
