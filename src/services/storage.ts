import { Task } from '../types';
import { INITIAL_TASKS } from '../utils/constants';

const TASKS_STORAGE_KEY = 'almanac_tasks_data';

export const storageService = {
  /**
   * Load tasks from localStorage or return default initial demo tasks
   */
  loadTasks: (): Task[] => {
    try {
      const data = localStorage.getItem(TASKS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
        return INITIAL_TASKS;
      }
      return JSON.parse(data);
    } catch (err) {
      console.error('Error loading tasks from localStorage:', err);
      return INITIAL_TASKS;
    }
  },

  /**
   * Save full tasks list to localStorage
   */
  saveTasks: (tasks: Task[]): void => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error('Error saving tasks to localStorage:', err);
    }
  },

  /**
   * Export tasks as a JSON file backup for the couple
   */
  exportBackup: (tasks: Task[]): void => {
    const jsonStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `almanac-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  /**
   * Import tasks from a JSON file backup
   */
  importBackup: async (file: File): Promise<Task[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            resolve(parsed);
          } else {
            reject(new Error('Formato inválido'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
};
