import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addYears,
  subYears,
  parseISO,
  isPast,
  isFuture
} from 'date-fns';
import { es } from 'date-fns/locale';

export const DAYS_OF_WEEK = [
  { short: 'Lun', full: 'Lunes' },
  { short: 'Mar', full: 'Martes' },
  { short: 'Mié', full: 'Miércoles' },
  { short: 'Jue', full: 'Jueves' },
  { short: 'Vie', full: 'Viernes' },
  { short: 'Sáb', full: 'Sábado' },
  { short: 'Dom', full: 'Domingo' }
];

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Returns complete matrix of days to render a monthly calendar grid (starting on Monday)
 */
export const getMonthGridDays = (currentDate: Date) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  
  // Week starts on Monday (weekStartsOn: 1)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  return eachDayOfInterval({ start: startDate, end: endDate });
};

/**
 * Returns days for a full week starting from Monday
 */
export const getWeekDays = (currentDate: Date) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: weekStart, end: weekEnd });
};

/**
 * Format a date nicely in Spanish (e.g. "Septiembre 2026")
 */
export const formatMonthHeader = (date: Date): string => {
  const monthName = format(date, 'LLLL', { locale: es });
  const year = format(date, 'yyyy');
  return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
};

/**
 * Format full friendly date (e.g. "Martes, 1 de Septiembre")
 */
export const formatFriendlyDate = (dateStr: string): string => {
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Hoy';
    return format(date, "EEEE, d 'de' MMMM", { locale: es });
  } catch {
    return dateStr;
  }
};

/**
 * Format standard YYYY-MM-DD string
 */
export const formatDateKey = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const WEEK_DAYS_SELECTOR = [
  { dayIndex: 1, short: 'L', label: 'Lun' },
  { dayIndex: 2, short: 'M', label: 'Mar' },
  { dayIndex: 3, short: 'X', label: 'Mié' },
  { dayIndex: 4, short: 'J', label: 'Jue' },
  { dayIndex: 5, short: 'V', label: 'Vie' },
  { dayIndex: 6, short: 'S', label: 'Sáb' },
  { dayIndex: 0, short: 'D', label: 'Dom' },
];

/**
 * Checks whether a task should appear on a given target date based on its recurrence rule.
 */
export const isTaskOnDate = (
  task: { date: string; recurrence?: string; recurrenceDays?: number[] },
  targetDate: Date | string
): boolean => {
  const targetDateObj = typeof targetDate === 'string' ? parseISO(targetDate) : targetDate;
  const targetDateKey = formatDateKey(targetDateObj);
  const taskStartDate = parseISO(task.date);
  const taskStartKey = task.date;

  // Cannot occur before the task start date
  if (targetDateKey < taskStartKey) {
    return false;
  }

  // Exact start date always matches
  if (targetDateKey === taskStartKey) {
    return true;
  }

  if (!task.recurrence || task.recurrence === 'none') {
    return false;
  }

  if (task.recurrence === 'daily') {
    return true;
  }

  if (task.recurrence === 'weekly') {
    const dayOfWeek = targetDateObj.getDay(); // 0 (Sun) to 6 (Sat)
    if (task.recurrenceDays && task.recurrenceDays.length > 0) {
      return task.recurrenceDays.includes(dayOfWeek);
    }
    // Default weekly: matches the day of the week of the start date
    return dayOfWeek === taskStartDate.getDay();
  }

  if (task.recurrence === 'monthly') {
    return targetDateObj.getDate() === taskStartDate.getDate();
  }

  if (task.recurrence === 'yearly') {
    return (
      targetDateObj.getMonth() === taskStartDate.getMonth() &&
      targetDateObj.getDate() === taskStartDate.getDate()
    );
  }

  return false;
};

/**
 * Friendly label for recurrence and selected days
 */
export const formatRecurrenceLabel = (
  recurrence?: string,
  recurrenceDays?: number[]
): string => {
  if (!recurrence || recurrence === 'none') return '';
  if (recurrence === 'daily') return 'Diario';
  if (recurrence === 'monthly') return 'Mensual';
  if (recurrence === 'yearly') return 'Anual';
  if (recurrence === 'weekly') {
    if (recurrenceDays && recurrenceDays.length > 0 && recurrenceDays.length < 7) {
      const dayNames = [
        { d: 1, name: 'Lun' },
        { d: 2, name: 'Mar' },
        { d: 3, name: 'Mié' },
        { d: 4, name: 'Jue' },
        { d: 5, name: 'Vie' },
        { d: 6, name: 'Sáb' },
        { d: 0, name: 'Dom' },
      ];
      const selectedNames = dayNames
        .filter((item) => recurrenceDays.includes(item.d))
        .map((item) => item.name);
      return selectedNames.length > 0 ? selectedNames.join(', ') : 'Semanal';
    }
    return 'Semanal';
  }
  return '';
};

export {
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addYears,
  subYears,
  parseISO,
  isPast,
  isFuture
};
