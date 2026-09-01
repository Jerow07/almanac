import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import {
  MONTHS,
  getMonthGridDays,
  formatDateKey,
  isToday,
  isSameMonth,
} from '../../utils/dateUtils';

export const YearView: React.FC = () => {
  const { currentDate, setCurrentDate, setView, filteredTasks, openNewTaskModal } = useCalendar();
  const year = currentDate.getFullYear();

  // Group tasks by date
  const tasksByDate = React.useMemo(() => {
    const map: Record<string, typeof filteredTasks> = {};
    filteredTasks.forEach((t) => {
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    });
    return map;
  }, [filteredTasks]);

  const handleMonthClick = (monthIndex: number) => {
    const newDate = new Date(year, monthIndex, 1);
    setCurrentDate(newDate);
    setView('month');
  };

  return (
    <div className="space-y-4">
      {/* Year Banner */}
      <div className="flex items-center justify-between bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-6 rounded-3xl text-white shadow-md">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-pink-200">
            Visión Panorámica Anual
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-0.5">{year}</h2>
          <p className="text-xs text-white/80 mt-1">
            Revisen las fechas y planes más importantes de su año juntos.
          </p>
        </div>
        <div className="text-3xl sm:text-4xl">✨</div>
      </div>

      {/* 12 Months Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {MONTHS.map((monthName, monthIndex) => {
          const monthDate = new Date(year, monthIndex, 1);
          const days = getMonthGridDays(monthDate);

          return (
            <div
              key={monthName}
              onClick={() => handleMonthClick(monthIndex)}
              className="bg-white rounded-2xl p-3.5 border border-slate-100 hover:border-pink-300 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-800 group-hover:text-pink-600 transition-colors">
                  {monthName}
                </h3>
                <span className="text-[10px] text-slate-400 group-hover:text-pink-500 font-medium">
                  Ver mes →
                </span>
              </div>

              {/* Mini Calendar Matrix */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                  <span key={i} className="font-bold text-slate-400">
                    {d}
                  </span>
                ))}

                {days.map((day) => {
                  const dateKey = formatDateKey(day);
                  const hasTasks = tasksByDate[dateKey] && tasksByDate[dateKey].length > 0;
                  const isCurMonth = isSameMonth(day, monthDate);
                  const isCurDay = isToday(day);

                  return (
                    <div
                      key={dateKey}
                      onClick={(e) => {
                        e.stopPropagation();
                        openNewTaskModal(dateKey);
                      }}
                      className={`relative py-1 rounded-md flex flex-col items-center justify-center transition-colors ${
                        !isCurMonth
                          ? 'opacity-20'
                          : isCurDay
                          ? 'bg-pink-500 text-white font-bold'
                          : 'hover:bg-pink-50 text-slate-700'
                      }`}
                    >
                      <span>{day.getDate()}</span>
                      {hasTasks && isCurMonth && (
                        <span
                          className={`w-1 h-1 rounded-full mt-0.5 ${
                            isCurDay ? 'bg-white' : 'bg-pink-500'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
