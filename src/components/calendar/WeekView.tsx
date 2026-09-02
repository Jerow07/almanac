import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { getWeekDays, DAYS_OF_WEEK, isToday, formatDateKey, isTaskOnDate } from '../../utils/dateUtils';
import { TaskCard } from '../tasks/TaskCard';
import { Plus } from 'lucide-react';

export const WeekView: React.FC = () => {
  const { currentDate, filteredTasks, openNewTaskModal } = useCalendar();
  const weekDays = getWeekDays(currentDate);

  // Group tasks by date (including recurring tasks expansion for this week)
  const tasksByDate = React.useMemo(() => {
    const map: Record<string, typeof filteredTasks> = {};
    weekDays.forEach((day) => {
      const dateKey = formatDateKey(day);
      map[dateKey] = filteredTasks
        .filter((t) => isTaskOnDate(t, day))
        .map((t) => (t.date === dateKey ? t : { ...t, date: dateKey }));
    });
    return map;
  }, [filteredTasks, weekDays]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden w-full max-w-full transition-colors duration-200">
      <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 min-h-[600px]">
        {weekDays.map((day, idx) => {
          const dateKey = formatDateKey(day);
          const dayTasks = tasksByDate[dateKey] || [];
          const currentDay = isToday(day);
          const dayInfo = DAYS_OF_WEEK[idx];

          return (
            <div
              key={dateKey}
              className={`flex flex-col p-3 transition-colors ${
                currentDay ? 'bg-pink-50/20 dark:bg-pink-950/20' : 'bg-white dark:bg-slate-900'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {dayInfo.short}
                  </p>
                  <p
                    className={`text-base font-extrabold ${
                      currentDay ? 'text-pink-600 dark:text-pink-400' : 'text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {day.getDate()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openNewTaskModal(dateKey)}
                  className="w-7 h-7 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-pink-500 hover:text-white text-slate-400 dark:text-slate-400 flex items-center justify-center transition-all shadow-sm cursor-pointer active:scale-95"
                  title="Nueva tarea"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>

              {/* Tasks for the day */}
              <div className="flex-1 space-y-2 overflow-y-auto">
                {dayTasks.length === 0 ? (
                  <div
                    onClick={() => openNewTaskModal(dateKey)}
                    className="h-24 flex items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 hover:border-pink-200 dark:hover:border-pink-800/80 rounded-2xl cursor-pointer text-slate-300 dark:text-slate-600 hover:text-pink-400 dark:hover:text-pink-400 transition-all text-xs"
                  >
                    <span>+ Agregar plan</span>
                  </div>
                ) : (
                  dayTasks.map((task) => <TaskCard key={task.id} task={task} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
