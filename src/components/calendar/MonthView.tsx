import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import {
  getMonthGridDays,
  DAYS_OF_WEEK,
  isSameMonth,
  isToday,
  formatDateKey,
  formatFriendlyDate,
  isTaskOnDate,
} from '../../utils/dateUtils';
import { TaskCard } from '../tasks/TaskCard';
import { sounds } from '../../utils/sound';
import { Plus, Calendar as CalendarIcon, Sparkles } from 'lucide-react';

export const MonthView: React.FC = () => {
  const { currentDate, filteredTasks, openNewTaskModal } = useCalendar();
  const days = getMonthGridDays(currentDate);

  // Selected date state (defaults to today)
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    formatDateKey(new Date())
  );

  // Group tasks by date string (including recurring task expansion for the displayed month grid)
  const tasksByDate = React.useMemo(() => {
    const map: Record<string, typeof filteredTasks> = {};
    days.forEach((day) => {
      const dateKey = formatDateKey(day);
      map[dateKey] = filteredTasks
        .filter((t) => isTaskOnDate(t, day))
        .map((t) => (t.date === dateKey ? t : { ...t, date: dateKey }));
    });
    return map;
  }, [filteredTasks, days]);

  const selectedDayTasks = tasksByDate[selectedDate] || [];

  const handleDayClick = (dateKey: string) => {
    sounds.playClick();
    setSelectedDate(dateKey);
  };

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      {/* Month Calendar Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden w-full max-w-full transition-colors duration-200">
        {/* Weekday Header */}
        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 text-center py-2.5">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day.short} className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span className="hidden sm:inline">{day.full}</span>
              <span className="sm:hidden">{day.short}</span>
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800 min-h-[360px] sm:min-h-[580px]">
          {days.map((day) => {
            const dateKey = formatDateKey(day);
            const dayTasks = tasksByDate[dateKey] || [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);
            const isSelected = selectedDate === dateKey;

            // Check distinct assignees for colored dots
            const hasJeronimo = dayTasks.some((t) => t.assignee === 'jeronimo');
            const hasZahria = dayTasks.some((t) => t.assignee === 'zahria');
            const hasBoth = dayTasks.some((t) => t.assignee === 'both');

            return (
              <div
                key={dateKey}
                onClick={() => handleDayClick(dateKey)}
                className={`group relative p-1 sm:p-2 transition-all flex flex-col justify-between cursor-pointer min-h-[56px] sm:min-h-[105px] ${
                  !isCurrentMonth
                    ? 'bg-slate-50/30 dark:bg-slate-950/40 opacity-40 dark:opacity-30'
                    : isSelected
                    ? 'bg-pink-50/40 dark:bg-pink-950/30 ring-2 ring-inset ring-pink-400/80 z-10'
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/60'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrentDay
                        ? 'bg-pink-500 text-white shadow-md'
                        : isSelected
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 group-hover:text-pink-600 dark:group-hover:text-pink-400'
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
                    className="hidden sm:flex w-5 h-5 rounded-md items-center justify-center text-slate-300 dark:text-slate-600 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/50 transition-all opacity-0 group-hover:opacity-100"
                    title="Agregar tarea en este día"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>

                {/* MOBILE VIEW: Cute colored dots & badge */}
                <div className="flex md:hidden items-center justify-center gap-1 py-1 mt-auto">
                  {hasJeronimo && (
                    <span
                      className="w-2 h-2 rounded-full bg-blue-500 shadow-xs"
                      title="Jerónimo"
                    />
                  )}
                  {hasZahria && (
                    <span
                      className="w-2 h-2 rounded-full bg-pink-500 shadow-xs"
                      title="Zahria"
                    />
                  )}
                  {hasBoth && (
                    <span
                      className="w-2 h-2 rounded-full bg-purple-500 shadow-xs"
                      title="Juntos"
                    />
                  )}
                  {dayTasks.length > 3 && (
                    <span className="text-[9px] font-bold text-slate-400">
                      +{dayTasks.length}
                    </span>
                  )}
                </div>

                {/* DESKTOP VIEW: Full compact task pills */}
                <div className="hidden md:block mt-1 space-y-1 flex-1 overflow-hidden">
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

      {/* SELECTED DAY INSPECTOR (Especially helpful on mobile) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-pink-100/80 dark:border-slate-800 shadow-sm animate-in fade-in duration-150 transition-colors">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100 capitalize">
                {formatFriendlyDate(selectedDate)}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {selectedDayTasks.length === 0
                  ? 'Sin planes registrados'
                  : `${selectedDayTasks.length} ${
                      selectedDayTasks.length === 1 ? 'plan anotado' : 'planes anotados'
                    }`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openNewTaskModal(selectedDate)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 dark:bg-pink-950/60 hover:bg-pink-100 dark:hover:bg-pink-900/60 text-pink-600 dark:text-pink-300 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Agregar tarea</span>
          </button>
        </div>

        {/* Day tasks card list */}
        {selectedDayTasks.length === 0 ? (
          <div
            onClick={() => openNewTaskModal(selectedDate)}
            className="py-6 px-4 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 hover:border-pink-200 dark:hover:border-pink-800/80 rounded-2xl cursor-pointer transition-all group"
          >
            <Sparkles className="w-6 h-6 text-slate-300 dark:text-slate-600 group-hover:text-pink-400 mx-auto mb-1.5 transition-colors" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
              No hay tareas para este día
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Toca aquí para programar un plan o recordatorio juntos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {selectedDayTasks.map((task) => (
              <TaskCard key={task.id} task={task} compact={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
