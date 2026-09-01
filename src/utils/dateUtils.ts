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
