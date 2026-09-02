import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { TaskCard } from '../tasks/TaskCard';
import { Task } from '../../types';
import { formatFriendlyDate, formatDateKey, isTaskOnDate } from '../../utils/dateUtils';
import { addDays } from 'date-fns';
import { Plus, CheckCircle2, CalendarHeart } from 'lucide-react';

export const AgendaView: React.FC = () => {
  const { filteredTasks, openNewTaskModal } = useCalendar();

  const now = React.useMemo(() => new Date(), []);
  const todayStr = React.useMemo(() => formatDateKey(now), [now]);
  const tomorrowDate = React.useMemo(() => addDays(now, 1), [now]);
  const tomorrowStr = React.useMemo(() => formatDateKey(tomorrowDate), [tomorrowDate]);

  // Group tasks into logical sections
  const { overdue, today, tomorrow, upcoming, completed } = React.useMemo(() => {
    const overdue: Task[] = [];
    const today: Task[] = [];
    const tomorrow: Task[] = [];
    const upcoming: Task[] = [];
    const completed: Task[] = [];

    filteredTasks.forEach((task) => {
      if (task.completed) {
        completed.push(task);
        return;
      }

      const isRecurring = Boolean(task.recurrence && task.recurrence !== 'none');

      if (isRecurring) {
        if (isTaskOnDate(task, now)) {
          today.push(task);
        } else if (isTaskOnDate(task, tomorrowDate)) {
          tomorrow.push(task);
        } else {
          // Look ahead up to 30 days for upcoming occurrence
          for (let i = 2; i <= 30; i++) {
            const nextDate = addDays(now, i);
            if (isTaskOnDate(task, nextDate)) {
              upcoming.push({ ...task, date: formatDateKey(nextDate) });
              break;
            }
          }
        }
        return;
      }

      // Single non-recurring task
      if (task.date === todayStr) {
        today.push(task);
      } else if (task.date === tomorrowStr) {
        tomorrow.push(task);
      } else if (task.date < todayStr) {
        overdue.push(task);
      } else if (task.date > tomorrowStr) {
        upcoming.push(task);
      }
    });

    // Sort chronologically
    const sortFn = (a: Task, b: Task) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || '');
    overdue.sort(sortFn);
    today.sort(sortFn);
    tomorrow.sort(sortFn);
    upcoming.sort(sortFn);

    return { overdue, today, tomorrow, upcoming, completed };
  }, [filteredTasks, now, todayStr, tomorrowDate, tomorrowStr]);

  const totalActive = overdue.length + today.length + tomorrow.length + upcoming.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Empty State */}
      {totalActive === 0 && completed.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <CalendarHeart className="w-14 h-14 text-pink-400 mx-auto mb-3 stroke-1" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">¡Almanaque completamente al día!</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            No tienen tareas pendientes registradas con los filtros actuales. ¿Tienen algún nuevo
            plan juntos?
          </p>
          <button
            type="button"
            onClick={() => openNewTaskModal()}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Crear nueva tarea o cita
          </button>
        </div>
      )}

      {/* Overdue */}
      {overdue.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Atrasadas ({overdue.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {overdue.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      )}

      {/* Today */}
      {today.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌟</span>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                Para Hoy ({today.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">{formatFriendlyDate(todayStr)}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {today.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      )}

      {/* Tomorrow */}
      {tomorrow.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌿</span>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Mañana ({tomorrow.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tomorrow.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Próximos días ({upcoming.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upcoming.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              ¡Completadas con éxito! ({completed.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-80">
            {completed.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
