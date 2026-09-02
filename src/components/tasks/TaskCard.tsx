import React from 'react';
import { Task } from '../../types';
import { useCalendar } from '../../context/CalendarContext';
import { AssigneeBadge, CategoryBadge, PriorityBadge } from '../common/Badge';
import { formatRecurrenceLabel } from '../../utils/dateUtils';
import { Clock, Check, Edit2, Trash2, Bell } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, compact = false }) => {
  const { toggleComplete, openEditTaskModal, deleteTask } = useCalendar();

  if (compact) {
    return (
      <div
        onClick={() => openEditTaskModal(task)}
        className={`group relative flex items-center justify-between gap-1.5 px-2 py-1 rounded-lg text-xs transition-all cursor-pointer border ${
          task.completed
            ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 line-through opacity-75'
            : task.assignee === 'jeronimo'
            ? 'bg-blue-50/70 dark:bg-blue-950/60 hover:bg-blue-100/70 dark:hover:bg-blue-900/60 border-blue-200/80 dark:border-blue-800/80 text-blue-900 dark:text-blue-200'
            : task.assignee === 'zahria'
            ? 'bg-pink-50/70 dark:bg-pink-950/60 hover:bg-pink-100/70 dark:hover:bg-pink-900/60 border-pink-200/80 dark:border-pink-800/80 text-pink-900 dark:text-pink-200'
            : 'bg-purple-50/70 dark:bg-purple-950/60 hover:bg-purple-100/70 dark:hover:bg-purple-900/60 border-purple-200/80 dark:border-purple-800/80 text-purple-900 dark:text-purple-200'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleComplete(task.id);
            }}
            className={`flex-shrink-0 w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
              task.completed
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400 bg-white dark:bg-slate-800'
            }`}
          >
            {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </button>
          <span className="truncate font-medium">{task.title}</span>
        </div>

        {task.time && !task.allDay && (
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal flex-shrink-0">
            {task.time}{task.endTime ? ` - ${task.endTime}` : ''}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`group relative p-3.5 rounded-2xl border transition-all shadow-sm hover:shadow-md ${
        task.completed
          ? 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-pink-200 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox button */}
        <button
          type="button"
          onClick={() => toggleComplete(task.id)}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm scale-95'
              : 'border-slate-300 dark:border-slate-600 hover:border-pink-400 bg-white dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-pink-950/40'
          }`}
          title={task.completed ? 'Marcar como pendiente' : '¡Completada!'}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <AssigneeBadge assignee={task.assignee} />
            <CategoryBadge category={task.category} />
            <PriorityBadge priority={task.priority} />
            {task.reminder !== 'none' && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400 dark:text-slate-500 font-medium ml-auto">
                <Bell className="w-3 h-3 text-amber-500" />
              </span>
            )}
          </div>

          <h4
            onClick={() => openEditTaskModal(task)}
            className={`font-semibold text-sm cursor-pointer hover:text-pink-600 dark:hover:text-pink-400 transition-colors ${
              task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'
            }`}
          >
            {task.title}
          </h4>

          {task.description && (
            <p
              className={`text-xs mt-1 line-clamp-2 ${
                task.completed ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                {task.allDay
                  ? 'Todo el día'
                  : task.time
                  ? task.endTime
                    ? `${task.time} a ${task.endTime} hs`
                    : `${task.time} hs`
                  : 'Sin hora'}
              </span>
              {task.recurrence && task.recurrence !== 'none' && (
                <span className="text-[10px] bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-1 border border-pink-100/60 dark:border-pink-900/60">
                  <span className="text-[11px]">🔄</span>
                  <span>{formatRecurrenceLabel(task.recurrence, task.recurrenceDays)}</span>
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => openEditTaskModal(task)}
                className="p-1 rounded-md text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                title="Editar tarea"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                className="p-1 rounded-md text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                title="Eliminar tarea"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
