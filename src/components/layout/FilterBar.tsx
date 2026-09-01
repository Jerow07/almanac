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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2 space-y-3">
      {/* Upper row: Couple filter + Search box */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Person Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
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
                ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
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
                : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-50'
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
                : 'bg-white text-pink-800 border-pink-200 hover:bg-pink-50'
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
                : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-50'
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
            className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all shadow-sm"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Lower row: Category filters */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 rounded-xl font-medium transition-all ${
              categoryFilter === 'all'
                ? 'bg-slate-200 text-slate-800 font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
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
                    ? `${cat.badgeBg} ${cat.badgeText} font-bold ring-1 ring-pink-300`
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Progress summary */}
        <div className="hidden lg:flex items-center gap-2 text-slate-400 whitespace-nowrap pl-4">
          <span className="text-xs">
            {completedCount} de {filteredTasks.length} listas
          </span>
          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
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
