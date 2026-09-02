import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { MONTHS } from '../../utils/dateUtils';
import { sounds } from '../../utils/sound';
import { ChevronLeft, ChevronRight, X, Calendar, Sparkles } from 'lucide-react';

interface MonthPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
  onSelectDate: (date: Date) => void;
}

export const MonthPickerModal: React.FC<MonthPickerModalProps> = ({
  isOpen,
  onClose,
  currentDate,
  onSelectDate,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(() => currentDate.getFullYear());

  if (!isOpen) return null;

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const handleSelectMonth = (monthIndex: number) => {
    sounds.playClick();
    // Keep day 1 to avoid month overflow issues (e.g. 31st on Feb)
    const newDate = new Date(selectedYear, monthIndex, 1);
    onSelectDate(newDate);
    onClose();
  };

  const handleGoToToday = () => {
    sounds.playPop();
    onSelectDate(new Date());
    onClose();
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9998] animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Floating Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed inset-x-4 top-24 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-88 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-pink-100 dark:border-slate-800 z-[9999] overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col transition-colors"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 dark:from-slate-850 dark:via-purple-950/40 dark:to-slate-850 border-b border-pink-100/60 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-pink-500" />
            <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Ir a un mes rápidamente
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Year Navigator */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/60">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setSelectedYear((prev) => prev - 1);
            }}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-2xs transition-all cursor-pointer active:scale-95"
            title="Año anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-extrabold text-base text-slate-800 dark:text-slate-100">
            {selectedYear}
          </span>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setSelectedYear((prev) => prev + 1);
            }}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-2xs transition-all cursor-pointer active:scale-95"
            title="Año siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Months 3x4 Grid */}
        <div className="p-4 grid grid-cols-3 gap-2">
          {MONTHS.map((monthName, idx) => {
            const isCurrentlyViewed = selectedYear === currentYear && idx === currentMonth;
            const isThisMonth = selectedYear === todayYear && idx === todayMonth;

            return (
              <button
                key={monthName}
                type="button"
                onClick={() => handleSelectMonth(idx)}
                className={`relative py-2.5 px-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isCurrentlyViewed
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200 dark:shadow-none scale-102 font-extrabold'
                    : isThisMonth
                    ? 'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-2 border-pink-300 dark:border-pink-800 font-extrabold'
                    : 'bg-slate-50/80 dark:bg-slate-800/80 hover:bg-pink-50/50 dark:hover:bg-slate-700 hover:text-pink-600 dark:hover:text-pink-400 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700/80'
                }`}
              >
                <span>{monthName.slice(0, 3)}</span>
                <span className="text-[9px] opacity-75 font-normal">
                  {monthName}
                </span>

                {isThisMonth && !isCurrentlyViewed && (
                  <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-pink-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer: Quick Jump to Current Month */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleGoToToday}
            className="text-xs font-bold text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 flex items-center gap-1.5 py-1 px-3 rounded-xl hover:bg-pink-50 dark:hover:bg-pink-950/40 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ir al mes actual (Hoy)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 py-1 px-3 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};
