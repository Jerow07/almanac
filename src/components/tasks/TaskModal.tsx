import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCalendar } from '../../context/CalendarContext';
import { Assignee, TaskCategory, Priority, RecurrenceType, ReminderOffset } from '../../types';
import { CATEGORIES, PROFILES } from '../../utils/constants';
import { WEEK_DAYS_SELECTOR, parseISO } from '../../utils/dateUtils';
import { X, Calendar, Clock, Bell, RefreshCw, Trash2, Heart } from 'lucide-react';

export const TaskModal: React.FC = () => {
  const {
    isTaskModalOpen,
    editingTask,
    selectedDateForNewTask,
    closeTaskModal,
    addTask,
    updateTask,
    deleteTask,
  } = useCalendar();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [assignee, setAssignee] = useState<Assignee>('both');
  const [category, setCategory] = useState<TaskCategory>('pareja');
  const [priority, setPriority] = useState<Priority>('medium');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [reminder, setReminder] = useState<ReminderOffset>('1_hour');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setDate(editingTask.date);
      setTime(editingTask.time || '12:00');
      setEndTime(editingTask.endTime || '');
      setAllDay(editingTask.allDay);
      setAssignee(editingTask.assignee);
      setCategory(editingTask.category);
      setPriority(editingTask.priority);
      setRecurrence(editingTask.recurrence);
      setRecurrenceDays(
        editingTask.recurrenceDays && editingTask.recurrenceDays.length > 0
          ? editingTask.recurrenceDays
          : [parseISO(editingTask.date).getDay()]
      );
      setReminder(editingTask.reminder);
    } else {
      // Default new task: start completely blank (no forced date or time)
      setTitle('');
      setDescription('');
      setDate(selectedDateForNewTask || '');
      setTime('');
      setEndTime('');
      setAllDay(false);
      setAssignee('both');
      setCategory('pareja');
      setPriority('medium');
      setRecurrence('none');
      const initialDay = selectedDateForNewTask
        ? parseISO(selectedDateForNewTask).getDay()
        : new Date().getDay();
      setRecurrenceDays([initialDay]);
      setReminder('1_hour');
    }
  }, [editingTask, selectedDateForNewTask, isTaskModalOpen]);

  const toggleRecurrenceDay = (dayIndex: number) => {
    setRecurrenceDays((prev) => {
      if (prev.includes(dayIndex)) {
        if (prev.length === 1) return prev; // keep at least 1 day
        return prev.filter((d) => d !== dayIndex);
      }
      return [...prev, dayIndex];
    });
  };

  if (!isTaskModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title: title.trim(),
        description: description.trim(),
        date,
        time: allDay ? undefined : (time || undefined),
        endTime: allDay ? undefined : (endTime || undefined),
        allDay,
        assignee,
        category,
        priority,
        recurrence,
        recurrenceDays: recurrence === 'weekly' ? recurrenceDays : undefined,
        reminder,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        date,
        time: allDay ? undefined : (time || undefined),
        endTime: allDay ? undefined : (endTime || undefined),
        allDay,
        assignee,
        category,
        priority,
        completed: false,
        recurrence,
        recurrenceDays: recurrence === 'weekly' ? recurrenceDays : undefined,
        reminder,
      });
    }
  };

  const handleDelete = () => {
    if (editingTask && confirm('¿Eliminar esta tarea de su almanaque?')) {
      deleteTask(editingTask.id);
      closeTaskModal();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={closeTaskModal}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-pink-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 border-b border-pink-100/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-pink-500">
              <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {editingTask ? 'Editar compromiso' : 'Nueva tarea o plan juntos'}
              </h3>
              <p className="text-xs text-slate-500">Almanaque de Jerónimo & Zahria</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeTaskModal}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto overflow-x-hidden space-y-4 text-slate-700 flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              ¿Qué tenemos planeado? *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Comprar regalo, Turno médico, Paseo el finde..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-sm transition-all"
              autoFocus
            />
          </div>

          {/* Assignee selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              ¿Quién se encarga?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['jeronimo', 'zahria', 'both'] as Assignee[]).map((person) => {
                const isSelected = assignee === person;
                const profile = PROFILES[person];
                return (
                  <button
                    key={person}
                    type="button"
                    onClick={() => setAssignee(person)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? person === 'jeronimo'
                          ? 'border-blue-500 bg-blue-50/80 shadow-sm'
                          : person === 'zahria'
                          ? 'border-pink-500 bg-pink-50/80 shadow-sm'
                          : 'border-purple-500 bg-purple-50/80 shadow-sm'
                        : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <span className="text-xl mb-0.5">{profile.icon}</span>
                    <span className="text-xs font-bold text-slate-800">{profile.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Fecha *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm bg-white"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Hora
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allDay}
                    onChange={(e) => setAllDay(e.target.checked)}
                    className="rounded text-pink-500 focus:ring-pink-400 cursor-pointer"
                  />
                  <span>Todo el día</span>
                </label>
              </div>

              {!allDay ? (
                <div>
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1 min-w-0">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full pl-7 pr-1 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs font-semibold text-slate-700 bg-white"
                        title="Hora de inicio"
                      />
                      <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5 pointer-events-none" />
                    </div>
                    <span className="text-slate-400 text-xs font-bold px-0.5">a</span>
                    <div className="relative flex-1 min-w-0">
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        placeholder="Hasta"
                        className="w-full pl-7 pr-1 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs font-semibold text-slate-700 bg-white"
                        title="Hora de fin (opcional)"
                      />
                      <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 pl-1">
                    Inicio y fin (ej. 18:00 a 20:00 hs)
                  </p>
                </div>
              ) : (
                <div className="py-2.5 px-3 bg-slate-50 text-slate-400 rounded-xl text-xs text-center border border-slate-100">
                  Sin horario específico (todo el día)
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Categoría
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? `${cat.badgeBg} ${cat.badgeText} ring-2 ring-pink-400 shadow-sm font-semibold scale-105`
                        : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority & Reminder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm bg-white"
              >
                <option value="low">🌱 Normal / Tranqui</option>
                <option value="medium">⚡ Importante</option>
                <option value="high">🔥 Muy Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                <span className="inline-flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5 text-amber-500" />
                  Aviso / Notificación
                </span>
              </label>
              <select
                value={reminder}
                onChange={(e) => setReminder(e.target.value as ReminderOffset)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm bg-white"
              >
                <option value="none">Sin recordatorio</option>
                <option value="at_time">Al momento exacto</option>
                <option value="15_min">15 minutos antes</option>
                <option value="1_hour">1 hora antes</option>
                <option value="1_day">1 día antes</option>
              </select>
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              <span className="inline-flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                Repetición
              </span>
            </label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm bg-white"
            >
              <option value="none">No se repite</option>
              <option value="daily">Todos los días</option>
              <option value="weekly">Semanal (elegir días de la semana)</option>
              <option value="monthly">Todos los meses</option>
              <option value="yearly">Todos los años (Aniversarios/Cumples)</option>
            </select>

            {/* Custom Days of Week Selector when Weekly is chosen */}
            {recurrence === 'weekly' && (
              <div className="mt-2.5 p-3 bg-pink-50/50 rounded-2xl border border-pink-100/80">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold text-slate-700">
                    ¿Qué días se repite?
                  </p>
                  <span className="text-[10px] text-pink-600 font-semibold">
                    {recurrenceDays.length} días seleccionados
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {WEEK_DAYS_SELECTOR.map((day) => {
                    const isSelected = recurrenceDays.includes(day.dayIndex);
                    return (
                      <button
                        key={day.dayIndex}
                        type="button"
                        onClick={() => toggleRecurrenceDay(day.dayIndex)}
                        className={`h-9 flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-pink-500 text-white shadow-sm shadow-pink-200 scale-102'
                            : 'bg-white text-slate-600 hover:bg-pink-100/40 border border-slate-200'
                        }`}
                        title={day.label}
                      >
                        <span>{day.short}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                  Ej. Toca <strong>L, X y V</strong> para Lunes, Miércoles y Viernes
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Detalles o notas (opcional)
            </label>
            <textarea
              rows={2}
              placeholder="¿Algún detalle para recordar juntos? Lugar, lista o número de teléfono..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            {editingTask ? (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeTaskModal}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
              >
                {editingTask ? 'Guardar Cambios' : 'Crear en el Almanaque'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
