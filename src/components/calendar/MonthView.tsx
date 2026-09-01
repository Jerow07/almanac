import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import {
  getMonthGridDays,
  DAYS_OF_WEEK,
  isSameMonth,
  isToday,
  formatDateKey,
} from '../../utils/dateUtils';
import { TaskCard } from '../tasks/TaskCard';
import { Plus } from 'lucide-react';

export const MonthView: React.FC = () => {
  const { currentDate, filteredTasks, openNewTaskModal } = useCalendar();
  const days = getMonthGridDays(currentDate);

  // Group tasks by date string
  const tasksByDate = React.useMemo(() => {
    const map: Record<string, typeof filteredTasks> = {};
    filteredTasks.forEach((t) => {
      if (!map[t.date]) {
        map[t.date] = [];
      }
      map[t.date].push(t);
    });
    return map;
  }, [filteredTasks]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70 text-center py-2.5">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day.short} className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span className="hidden sm:inline">{day.full}</span>
            <span className="sm:hidden">{day.short}</span>
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[580px]">
        {days.map((day) => {
          const dateKey = formatDateKey(day);
          const dayTasks = tasksByDate[dateKey] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={dateKey}
              onClick={() => openNewTaskModal(dateKey)}
              className={`group relative p-1.5 sm:p-2 transition-all flex flex-col justify-between cursor-pointer min-h-[95px] sm:min-h-[110px] ${
                !isCurrentMonth ? 'bg-slate-50/40 opacity-40' : 'bg-white hover:bg-pink-50/20'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrentDay
                      ? 'bg-pink-500 text-white shadow-md'
                      : 'text-slate-700 group-hover:text-pink-600'
                  }`}
                >
                  {day.getDate()}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openNewTaskModal(dateKey);
                  }}
                  className="w-5 h-5 rounded-md flex items-center justify-center text-slate-300 hover:text-pink-500 hover:bg-pink-50 transition-all opacity-0 group-hover:opacity-100"
                  title="Agregar tarea en este día"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>

              {/* Tasks List */}
              <div className="mt-1 space-y-1 flex-1 overflow-hidden">
                {dayTasks.slice(0, 3).map((task) => (
                  <TaskCard key={task.id} task={task} compact={true} />
                ))}

                {dayTasks.length > 3 && (
                  <div className="text-[10px] font-semibold text-slate-500 text-center py-0.5 bg-slate-100 rounded-md">
                    +{dayTasks.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
