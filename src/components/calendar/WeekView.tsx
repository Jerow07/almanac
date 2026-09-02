import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { getWeekDays, DAYS_OF_WEEK, isToday, formatDateKey } from '../../utils/dateUtils';
import { TaskCard } from '../tasks/TaskCard';
import { Plus } from 'lucide-react';

export const WeekView: React.FC = () => {
  const { currentDate, filteredTasks, openNewTaskModal } = useCalendar();
  const weekDays = getWeekDays(currentDate);

  // Group tasks by date
  const tasksByDate = React.useMemo(() => {
    const map: Record<string, typeof filteredTasks> = {};
    filteredTasks.forEach((t) => {
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    });
    return map;
  }, [filteredTasks]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden w-full max-w-full">
      <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-slate-100 min-h-[600px]">
        {weekDays.map((day, idx) => {
          const dateKey = formatDateKey(day);
          const dayTasks = tasksByDate[dateKey] || [];
          const currentDay = isToday(day);
          const dayInfo = DAYS_OF_WEEK[idx];

          return (
            <div
              key={dateKey}
              className={`flex flex-col p-3 transition-colors ${
                currentDay ? 'bg-pink-50/20' : 'bg-white'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {dayInfo.short}
                  </p>
                  <p
                    className={`text-base font-extrabold ${
                      currentDay ? 'text-pink-600' : 'text-slate-800'
                    }`}
                  >
                    {day.getDate()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openNewTaskModal(dateKey)}
                  className="w-7 h-7 rounded-xl bg-slate-50 hover:bg-pink-500 hover:text-white text-slate-400 flex items-center justify-center transition-all shadow-sm"
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
                    className="h-24 flex items-center justify-center border-2 border-dashed border-slate-100 hover:border-pink-200 rounded-2xl cursor-pointer text-slate-300 hover:text-pink-400 transition-all text-xs"
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
