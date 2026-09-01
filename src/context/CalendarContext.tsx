import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Task, Assignee, CalendarViewType, TaskCategory } from '../types';
import { storageService } from '../services/storage';
import { sounds } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';
import {
  getSupabase,
  supabaseSync,
  mapDbToTask,
  getStoredCloudConfig
} from '../services/supabase';
import {
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addYears,
  subYears
} from '../utils/dateUtils';

interface CalendarContextType {
  tasks: Task[];
  filteredTasks: Task[];
  currentDate: Date;
  view: CalendarViewType;
  assigneeFilter: 'all' | Assignee;
  categoryFilter: 'all' | TaskCategory;
  searchQuery: string;
  soundEnabled: boolean;
  isTaskModalOpen: boolean;
  editingTask: Task | null;
  selectedDateForNewTask: string | null;
  isCloudModalOpen: boolean;
  isCloudConnected: boolean;
  
  // Actions
  setView: (view: CalendarViewType) => void;
  setCurrentDate: (date: Date) => void;
  setAssigneeFilter: (filter: 'all' | Assignee) => void;
  setCategoryFilter: (filter: 'all' | TaskCategory) => void;
  setSearchQuery: (query: string) => void;
  toggleSound: () => void;
  navigateDate: (direction: 'prev' | 'next' | 'today') => void;
  
  // Task management
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  
  // Modal handlers
  openNewTaskModal: (dateStr?: string) => void;
  openEditTaskModal: (task: Task) => void;
  closeTaskModal: () => void;
  openCloudModal: () => void;
  closeCloudModal: () => void;
  syncFromCloud: () => Promise<void>;
  importTasksFromFile: (file: File) => Promise<void>;
  exportTasksBackup: () => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => storageService.loadTasks());
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarViewType>('month');
  const [assigneeFilter, setAssigneeFilter] = useState<'all' | Assignee>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | TaskCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sounds.isEnabled());
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(() => Boolean(getStoredCloudConfig()));

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedDateForNewTask, setSelectedDateForNewTask] = useState<string | null>(null);

  // Sync from Cloud function
  const syncFromCloud = useCallback(async () => {
    const cloudTasks = await supabaseSync.fetchTasks();
    if (cloudTasks) {
      setTasks(cloudTasks);
      storageService.saveTasks(cloudTasks);
      setIsCloudConnected(true);
    }
  }, []);

  // Supabase Real-Time Listener (WebSockets)
  useEffect(() => {
    const client = getSupabase();
    if (!client) {
      setIsCloudConnected(false);
      return;
    }

    setIsCloudConnected(true);

    // Initial fetch from cloud
    syncFromCloud();

    // Subscribe to live Postgres changes
    const channel = client
      .channel('almanac_live_tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTask = mapDbToTask(payload.new);
            setTasks((prev) => {
              if (prev.some((t) => t.id === newTask.id)) return prev;
              return [newTask, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapDbToTask(payload.new);
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            setTasks((prev) => prev.filter((t) => t.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [syncFromCloud]);

  // Sync to localStorage
  useEffect(() => {
    storageService.saveTasks(tasks);
  }, [tasks]);

  const toggleSound = () => {
    const next = sounds.toggle();
    setSoundEnabled(next);
  };

  const navigateDate = (direction: 'prev' | 'next' | 'today') => {
    sounds.playClick();
    if (direction === 'today') {
      setCurrentDate(new Date());
      return;
    }

    setCurrentDate((prev) => {
      switch (view) {
        case 'week':
          return direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1);
        case 'year':
          return direction === 'next' ? addYears(prev, 1) : subYears(prev, 1);
        case 'month':
        case 'agenda':
        default:
          return direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1);
      }
    });
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    sounds.playPop();
    closeTaskModal();

    // Push to Supabase if connected
    supabaseSync.upsertTask(newTask);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    let updatedTask: Task | null = null;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          updatedTask = { ...t, ...updates, updatedAt: new Date().toISOString() };
          return updatedTask;
        }
        return t;
      })
    );
    sounds.playPop();
    closeTaskModal();

    if (updatedTask) {
      supabaseSync.upsertTask(updatedTask);
    }
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    sounds.playClick();

    // Remove from Supabase if connected
    supabaseSync.deleteTask(id);
  };

  const toggleComplete = (id: string) => {
    let targetTask: Task | null = null;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isNowCompleted = !t.completed;
          if (isNowCompleted) {
            sounds.playSuccessChime();
            triggerConfetti();
          } else {
            sounds.playClick();
          }
          targetTask = {
            ...t,
            completed: isNowCompleted,
            completedAt: isNowCompleted ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
          };
          return targetTask;
        }
        return t;
      })
    );

    if (targetTask) {
      supabaseSync.upsertTask(targetTask);
    }
  };

  const openNewTaskModal = (dateStr?: string) => {
    sounds.playPop();
    setEditingTask(null);
    setSelectedDateForNewTask(dateStr || new Date().toISOString().split('T')[0]);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    sounds.playPop();
    setEditingTask(task);
    setSelectedDateForNewTask(task.date);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setSelectedDateForNewTask(null);
  };

  const openCloudModal = () => {
    sounds.playPop();
    setIsCloudModalOpen(true);
  };

  const closeCloudModal = () => {
    setIsCloudModalOpen(false);
    setIsCloudConnected(Boolean(getStoredCloudConfig()));
  };

  const importTasksFromFile = async (file: File) => {
    try {
      const imported = await storageService.importBackup(file);
      setTasks(imported);
      supabaseSync.uploadAll(imported);
      sounds.playSuccessChime();
    } catch {
      alert('Error al importar archivo de respaldo.');
    }
  };

  const exportTasksBackup = () => {
    storageService.exportBackup(tasks);
    sounds.playPop();
  };

  // Filtered tasks computation
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (assigneeFilter !== 'all') {
        if (assigneeFilter === 'both' && t.assignee !== 'both') return false;
        if (assigneeFilter === 'jeronimo' && t.assignee !== 'jeronimo' && t.assignee !== 'both') return false;
        if (assigneeFilter === 'zahria' && t.assignee !== 'zahria' && t.assignee !== 'both') return false;
      }

      if (categoryFilter !== 'all' && t.category !== categoryFilter) {
        return false;
      }

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(query);
        const matchDesc = t.description?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc) return false;
      }

      return true;
    });
  }, [tasks, assigneeFilter, categoryFilter, searchQuery]);

  return (
    <CalendarContext.Provider
      value={{
        tasks,
        filteredTasks,
        currentDate,
        view,
        assigneeFilter,
        categoryFilter,
        searchQuery,
        soundEnabled,
        isTaskModalOpen,
        editingTask,
        selectedDateForNewTask,
        isCloudModalOpen,
        isCloudConnected,
        setView,
        setCurrentDate,
        setAssigneeFilter,
        setCategoryFilter,
        setSearchQuery,
        toggleSound,
        navigateDate,
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
        openNewTaskModal,
        openEditTaskModal,
        closeTaskModal,
        openCloudModal,
        closeCloudModal,
        syncFromCloud,
        importTasksFromFile,
        exportTasksBackup,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
