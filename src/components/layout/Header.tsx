import React, { useState, useRef, useEffect } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { useNotification } from '../../context/NotificationContext';
import { formatMonthHeader } from '../../utils/dateUtils';
import { NotificationDrawer } from '../notifications/NotificationDrawer';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Volume2,
  VolumeX,
  Bell,
  Heart,
  Download,
  Upload,
  Sparkles,
  CalendarDays,
  ListTodo,
  Cloud,
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
  } = useCalendar();

  const { unreadCount } = useNotification();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isBackupMenuOpen, setIsBackupMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
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
    <header ref={headerRef} className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100/70 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Top row */}
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Couple Names */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-500 fill-pink-500 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Almanac
                </h1>
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-slate-500">
                <button
                  type="button"
                  onClick={() => setCurrentUser('jeronimo')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all flex items-center gap-1 ${
                    currentUser === 'jeronimo'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-blue-700 bg-blue-50/70 hover:bg-blue-100/70'
                  }`}
                  title="Configurar este dispositivo como Jerónimo"
                >
                  <span>👨🏻‍💻</span>
                  <span>Jerónimo</span>
                  {currentUser === 'jeronimo' && <span className="text-[9px] opacity-90 hidden xs:inline">(Tú)</span>}
                </button>

                <span className="text-pink-400 text-xs">♥</span>

                <button
                  type="button"
                  onClick={() => setCurrentUser('zahria')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all flex items-center gap-1 ${
                    currentUser === 'zahria'
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'text-pink-700 bg-pink-50/70 hover:bg-pink-100/70'
                  }`}
                  title="Configurar este dispositivo como Zahria"
                >
                  <span>👩🏻‍🎨</span>
                  <span>Zahria</span>
                  {currentUser === 'zahria' && <span className="text-[9px] opacity-90 hidden xs:inline">(Tú)</span>}
                </button>
              </div>
            </div>
          </div>

          {/* Center Date Navigator (Desktop & Tablet) */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => navigateDate('prev')}
              className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-xl transition-all shadow-sm"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigateDate('today')}
              className="px-3 py-1 text-xs font-bold text-pink-600 hover:bg-pink-50 rounded-xl transition-all"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => navigateDate('next')}
              className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-xl transition-all shadow-sm"
              title="Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-xs font-bold text-slate-800 border-l border-slate-200">
              {formatMonthHeader(currentDate)}
            </span>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Cloud Sync Button */}
            <button
              type="button"
              onClick={openCloudModal}
              className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
                isCloudConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
              }`}
              title={isCloudConnected ? 'Sincronización en la Nube Activa (En Vivo)' : 'Conectar con la Nube para sincronizar'}
            >
              {isCloudConnected ? (
                <Cloud className="w-4 h-4 text-emerald-600 fill-emerald-100" />
              ) : (
                <Cloud className="w-4 h-4 text-slate-400" />
              )}
              <span className="hidden sm:inline text-[11px]">
                {isCloudConnected ? 'En Vivo' : 'Conectar Nube'}
              </span>
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition-all ${
                soundEnabled
                  ? 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'
                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
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
                className="relative p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all"
                title="Avisos y recordatorios"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
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
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all hidden sm:flex"
                title="Copia de seguridad y respaldo"
              >
                <Download className="w-4 h-4" />
              </button>

              {isBackupMenuOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      exportTasksBackup();
                      setIsBackupMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-pink-50 rounded-xl transition-colors text-left"
                  >
                    <Download className="w-3.5 h-3.5 text-pink-500" />
                    Descargar Respaldo JSON
                  </button>
                  <label className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer text-left">
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
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden xs:inline">Nueva Tarea</span>
              <span className="xs:hidden">Crear</span>
            </button>
          </div>
        </div>

        {/* Bottom row: Mobile date navigator + View Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 mt-3 pt-2.5 border-t border-slate-100">
          {/* Mobile Date Controls */}
          <div className="flex md:hidden items-center justify-between w-full sm:w-auto gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => navigateDate('prev')}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => navigateDate('today')}
                className="px-2.5 py-1 text-xs font-bold text-pink-600 bg-pink-50 rounded-lg"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => navigateDate('next')}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-xs font-bold text-slate-800">
              {formatMonthHeader(currentDate)}
            </span>
          </div>

          {/* View Selector Pills */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl w-full sm:w-auto justify-between sm:justify-start gap-1">
            <button
              type="button"
              onClick={() => setView('month')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                view === 'month'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-pink-500" />
              <span>Mes</span>
            </button>

            <button
              type="button"
              onClick={() => setView('week')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                view === 'week'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
              <span>Semana</span>
            </button>

            <button
              type="button"
              onClick={() => setView('year')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                view === 'year'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Año</span>
            </button>

            <button
              type="button"
              onClick={() => setView('agenda')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                view === 'agenda'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5 text-amber-500" />
              <span>Agenda</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
