import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { Assignee, TaskCategory } from '../../types';
import { CATEGORIES, PROFILES } from '../../utils/constants';
import { Search, Filter, X } from 'lucide-react';

export const FilterBar: React.FC = () => {
  const {
    assigneeFilter,
    setAssigneeFilter,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    filteredTasks,
    tasks,
  } = useCalendar();

  const completedCount = filteredTasks.filter((t) => t.completed).length;

  return (
    <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 pt-3 pb-2 space-y-2.5 overflow-hidden">
      {/* Upper row: Couple filter + Search box */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full">
        {/* Person Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full max-w-full">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1 hidden sm:inline-flex">
            <Filter className="w-3.5 h-3.5" />
            Ver:
          </span>

          {/* ALL */}
          <button
            type="button"
            onClick={() => setAssigneeFilter('all')}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border ${
              assigneeFilter === 'all'
                ? 'bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-700 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            🌟 Todo ({tasks.length})
          </button>

          {/* JERONIMO */}
          <button
            type="button"
            onClick={() => setAssigneeFilter('jeronimo')}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-1.5 ${
              assigneeFilter === 'jeronimo'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-900/60 hover:bg-blue-50 dark:hover:bg-blue-950/40'
            }`}
          >
            <span>{PROFILES.jeronimo.icon}</span>
            <span>{PROFILES.jeronimo.name}</span>
          </button>

          {/* ZAHRIA */}
          <button
            type="button"
            onClick={() => setAssigneeFilter('zahria')}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-1.5 ${
              assigneeFilter === 'zahria'
                ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-pink-800 dark:text-pink-400 border-pink-200 dark:border-pink-900/60 hover:bg-pink-50 dark:hover:bg-pink-950/40'
            }`}
          >
            <span>{PROFILES.zahria.icon}</span>
            <span>{PROFILES.zahria.name}</span>
          </button>

          {/* AMBOS / JUNTOS */}
          <button
            type="button"
            onClick={() => setAssigneeFilter('both')}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-1.5 ${
              assigneeFilter === 'both'
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-purple-800 dark:text-purple-400 border-purple-200 dark:border-purple-900/60 hover:bg-purple-50 dark:hover:bg-purple-950/40'
            }`}
          >
            <span>{PROFILES.both.icon}</span>
            <span>Juntos</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Buscar en el almanaque..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all shadow-sm"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Lower row: Category filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs w-full max-w-full">
        <div className="flex items-center gap-1.5 flex-nowrap">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 rounded-xl font-medium transition-all ${
              categoryFilter === 'all'
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Todas las categorías
          </button>

          {CATEGORIES.map((cat) => {
            const isSelected = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(isSelected ? 'all' : cat.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all whitespace-nowrap ${
                  isSelected
                    ? `${cat.badgeBg} ${cat.badgeText} font-bold ring-1 ring-pink-300 dark:ring-pink-700`
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Progress summary */}
        <div className="hidden lg:flex items-center gap-2 text-slate-400 dark:text-slate-500 whitespace-nowrap pl-4">
          <span className="text-xs">
            {completedCount} de {filteredTasks.length} listas
          </span>
          <div className="w-16 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{
                width: `${
                  filteredTasks.length > 0 ? (completedCount / filteredTasks.length) * 100 : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
