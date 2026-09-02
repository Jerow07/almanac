import React, { useState, useRef, useEffect } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { useNotification } from '../../context/NotificationContext';
import { NotificationDrawer } from '../notifications/NotificationDrawer';
import { MonthPickerModal } from '../calendar/MonthPickerModal';
import { useTheme } from '../../context/ThemeContext';
import { formatMonthHeader, isCurrentPeriod } from '../../utils/dateUtils';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  Sparkles,
  ListTodo,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Heart,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Download,
  Upload,
  Cloud,
  Sun,
  Moon,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentDate,
    view,
    setView,
    navigateDate,
    soundEnabled,
    toggleSound,
    openNewTaskModal,
    exportTasksBackup,
    importTasksFromFile,
    openCloudModal,
    isCloudConnected,
    currentUser,
    setCurrentUser,
    setCurrentDate,
  } = useCalendar();

  const { unreadCount, notificationsEnabled } = useNotification();
  const { theme, toggleTheme } = useTheme();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isBackupMenuOpen, setIsBackupMenuOpen] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const isCurrent = isCurrentPeriod(currentDate, view);
  const navLabel = view === 'week' ? 'semana' : view === 'year' ? 'año' : 'mes';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsBackupMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importTasksFromFile(file);
      setIsBackupMenuOpen(false);
    }
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-pink-100/70 dark:border-slate-800 shadow-xs transition-colors duration-200 w-full max-w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 w-full">
        {/* Top row */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-3 w-full">
          {/* Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 p-0.5 shadow-md flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 fill-pink-500 animate-pulse" />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent truncate">
                Almanac
              </h1>

              {/* Desktop Device Switcher */}
              <div className="hidden sm:flex items-center gap-1 mt-0.5 text-slate-500 dark:text-slate-400">
                <button
                  type="button"
                  onClick={() => setCurrentUser('jeronimo')}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                    currentUser === 'jeronimo'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-blue-700 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100/70 dark:hover:bg-blue-900/40'
                  }`}
                  title="Configurar este dispositivo como Jerónimo"
                >
                  <span>👨🏻‍💻</span>
                  <span>Jerónimo</span>
                  {currentUser === 'jeronimo' && <span className="text-[9px] opacity-90">(Tú)</span>}
                </button>

                <span className="text-pink-400 text-xs">♥</span>

                <button
                  type="button"
                  onClick={() => setCurrentUser('zahria')}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                    currentUser === 'zahria'
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'text-pink-700 dark:text-pink-400 bg-pink-50/70 dark:bg-pink-950/40 hover:bg-pink-100/70 dark:hover:bg-pink-900/40'
                  }`}
                  title="Configurar este dispositivo como Zahria"
                >
                  <span>👩🏻‍🎨</span>
                  <span>Zahria</span>
                  {currentUser === 'zahria' && <span className="text-[9px] opacity-90">(Tú)</span>}
                </button>
              </div>
            </div>
          </div>

          {/* Center Date Navigator (Desktop & Tablet) */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex-shrink-0">
            <button
              type="button"
              onClick={() => navigateDate('prev')}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
              title={`${navLabel.charAt(0).toUpperCase() + navLabel.slice(1)} anterior`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Quick Month Picker trigger */}
            <button
              type="button"
              onClick={() => setIsMonthPickerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold text-slate-800 dark:text-slate-100 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer group shadow-2xs"
              title="Toca para elegir mes o año rápidamente"
            >
              <span>{formatMonthHeader(currentDate)}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 group-hover:text-pink-500 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => navigateDate('next')}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
              title={`${navLabel.charAt(0).toUpperCase() + navLabel.slice(1)} siguiente`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {!isCurrent && (
              <button
                type="button"
                onClick={() => navigateDate('today')}
                className="ml-1 px-2.5 py-1 text-xs font-bold text-pink-600 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/60 hover:bg-pink-100 dark:hover:bg-pink-900/60 rounded-xl border border-pink-200/80 dark:border-pink-800/60 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                title="Volver a hoy"
              >
                <span>↩</span>
                <span>Hoy</span>
              </button>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Sun / Moon Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                theme === 'dark'
                  ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-amber-500'
              }`}
              title={theme === 'dark' ? 'Cambiar a modo Claro (Día ☀️)' : 'Cambiar a modo Oscuro (Noche 🌙)'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 fill-amber-400 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 fill-slate-500 text-slate-500" />
              )}
            </button>

            {/* Cloud Sync Button */}
            <button
              type="button"
              onClick={openCloudModal}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
                isCloudConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-850 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title={isCloudConnected ? 'Sincronización en la Nube Activa (En Vivo)' : 'Conectar con la Nube para sincronizar'}
            >
              {isCloudConnected ? (
                <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950/60" />
              ) : (
                <Cloud className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              )}
              <span className="hidden sm:inline text-[11px]">
                {isCloudConnected ? 'En Vivo' : 'Conectar'}
              </span>
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all ${
                soundEnabled
                  ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-850 hover:bg-purple-100 dark:hover:bg-purple-900/50'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title={soundEnabled ? 'Sonidos activados (Clic para silenciar)' : 'Sonidos desactivados'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                title={notificationsEnabled ? 'Avisos y recordatorios' : 'Notificaciones en pausa'}
              >
                {notificationsEnabled ? (
                  <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                ) : (
                  <BellOff className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                )}
                {unreadCount > 0 && notificationsEnabled && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-bounce">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <NotificationDrawer
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
              />
            </div>

            {/* Backup button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsBackupMenuOpen(!isBackupMenuOpen)}
                className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all hidden sm:flex cursor-pointer"
                title="Copia de seguridad y respaldo"
              >
                <Download className="w-4 h-4" />
              </button>

              {isBackupMenuOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 z-50 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      exportTasksBackup();
                      setIsBackupMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-pink-50 dark:hover:bg-slate-700/80 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-pink-500" />
                    Descargar Respaldo JSON
                  </button>
                  <label className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700/80 rounded-xl transition-colors cursor-pointer text-left">
                    <Upload className="w-3.5 h-3.5 text-blue-500" />
                    Restaurar Respaldo
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Primary "+ Nueva Tarea" Button */}
            <button
              type="button"
              onClick={() => openNewTaskModal()}
              className="flex items-center justify-center gap-1.5 p-2 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              title="Nueva Tarea"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Nueva Tarea</span>
            </button>
          </div>
        </div>

        {/* Mobile Device Identity Banner */}
        <div className="flex sm:hidden items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Este celu:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentUser('jeronimo')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                currentUser === 'jeronimo'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-700 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100/80 dark:hover:bg-blue-900/40'
              }`}
            >
              <span>👨🏻‍💻 Jerónimo</span>
              {currentUser === 'jeronimo' && <span className="text-[9px] opacity-90">(Tú)</span>}
            </button>
            <span className="text-pink-400 text-xs">♥</span>
            <button
              type="button"
              onClick={() => setCurrentUser('zahria')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                currentUser === 'zahria'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'text-pink-700 dark:text-pink-400 bg-pink-50/80 dark:bg-pink-950/40 hover:bg-pink-100/80 dark:hover:bg-pink-900/40'
              }`}
            >
              <span>👩🏻‍🎨 Zahria</span>
              {currentUser === 'zahria' && <span className="text-[9px] opacity-90">(Tú)</span>}
            </button>
          </div>
        </div>

        {/* Bottom row: Mobile date navigator + View Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-2 sm:mt-3 pt-2 sm:pt-2.5 border-t border-slate-100 dark:border-slate-800">
          {/* Mobile Date Controls */}
          <div className="flex md:hidden items-center justify-between w-full sm:w-auto gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => navigateDate('prev')}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 cursor-pointer"
                title={`${navLabel.charAt(0).toUpperCase() + navLabel.slice(1)} anterior`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Quick Month Picker trigger */}
              <button
                type="button"
                onClick={() => setIsMonthPickerOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-extrabold text-slate-800 dark:text-slate-100 hover:text-pink-600 dark:hover:text-pink-400 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl transition-all active:scale-95 group cursor-pointer"
                title="Toca para elegir mes o año rápidamente"
              >
                <span>{formatMonthHeader(currentDate)}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-pink-500" />
              </button>

              <button
                type="button"
                onClick={() => navigateDate('next')}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 cursor-pointer"
                title={`${navLabel.charAt(0).toUpperCase() + navLabel.slice(1)} siguiente`}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {!isCurrent && (
              <button
                type="button"
                onClick={() => navigateDate('today')}
                className="px-2 py-1 text-[11px] font-bold text-pink-600 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-800/80 rounded-xl flex items-center gap-1 active:scale-95 cursor-pointer"
                title="Volver a hoy"
              >
                <span>↩</span>
                <span>Hoy</span>
              </button>
            )}
          </div>

          {/* View Selector Pills */}
          <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-2xl w-full sm:w-auto justify-between sm:justify-start gap-1">
            <button
              type="button"
              onClick={() => setView('month')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                view === 'month'
                  ? 'bg-white dark:bg-slate-750 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-pink-500" />
              <span>Mes</span>
            </button>

            <button
              type="button"
              onClick={() => setView('week')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                view === 'week'
                  ? 'bg-white dark:bg-slate-750 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
              <span>Semana</span>
            </button>

            <button
              type="button"
              onClick={() => setView('year')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                view === 'year'
                  ? 'bg-white dark:bg-slate-750 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Año</span>
            </button>

            <button
              type="button"
              onClick={() => setView('agenda')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                view === 'agenda'
                  ? 'bg-white dark:bg-slate-750 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5 text-emerald-500" />
              <span>Agenda</span>
            </button>
          </div>
        </div>
      </div>

      <MonthPickerModal
        isOpen={isMonthPickerOpen}
        onClose={() => setIsMonthPickerOpen(false)}
        currentDate={currentDate}
        onSelectDate={setCurrentDate}
      />
    </header>
  );
};
