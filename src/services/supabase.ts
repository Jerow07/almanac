import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Task } from '../types';

export interface CloudConfig {
  url: string;
  anonKey: string;
}

const CONFIG_KEY = 'almanac_supabase_credentials';

export const getStoredCloudConfig = (): CloudConfig | null => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey && envUrl !== 'https://your-project.supabase.co') {
    return { url: envUrl, anonKey: envKey };
  }

  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }

  return null;
};

export const saveStoredCloudConfig = (config: CloudConfig | null) => {
  if (!config) {
    localStorage.removeItem(CONFIG_KEY);
  } else {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }
};

let clientInstance: SupabaseClient | null = null;
let currentConfigStr = '';

export const getSupabase = (): SupabaseClient | null => {
  const config = getStoredCloudConfig();
  if (!config?.url || !config?.anonKey) {
    clientInstance = null;
    return null;
  }

  const configStr = `${config.url}_${config.anonKey}`;
  if (clientInstance && currentConfigStr === configStr) {
    return clientInstance;
  }

  try {
    clientInstance = createClient(config.url, config.anonKey);
    currentConfigStr = configStr;
    return clientInstance;
  } catch (err) {
    console.error('Error initializing Supabase client:', err);
    return null;
  }
};

// Map database column names (snake_case) to Task interface (camelCase)
export const mapDbToTask = (row: any): Task => {
  let createdBy: 'jeronimo' | 'zahria' | undefined = undefined;
  if (row.created_by) {
    createdBy = row.created_by;
  } else if (typeof row.id === 'string') {
    if (row.id.startsWith('task_zahria_')) createdBy = 'zahria';
    else if (row.id.startsWith('task_jeronimo_')) createdBy = 'jeronimo';
  }

  let completedAt: string | undefined = undefined;
  let completedBy: 'jeronimo' | 'zahria' | undefined = undefined;
  if (row.completed_at) {
    if (typeof row.completed_at === 'string' && row.completed_at.includes('_by_')) {
      const [datePart, byPart] = row.completed_at.split('_by_');
      completedAt = datePart;
      if (byPart === 'jeronimo' || byPart === 'zahria') {
        completedBy = byPart;
      }
    } else {
      completedAt = row.completed_at;
    }
  }

  let startTime: string | undefined = undefined;
  let endTime: string | undefined = undefined;
  if (row.time && typeof row.time === 'string') {
    if (row.time.includes(' - ')) {
      const parts = row.time.split(' - ');
      startTime = parts[0]?.trim() || undefined;
      endTime = parts[1]?.trim() || undefined;
    } else {
      startTime = row.time.trim();
    }
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    date: row.date,
    time: startTime,
    endTime,
    allDay: Boolean(row.all_day),
    assignee: row.assignee,
    category: row.category,
    priority: row.priority,
    completed: Boolean(row.completed),
    completedAt,
    completedBy,
    recurrence: row.recurrence || 'none',
    reminder: row.reminder || 'none',
    createdBy,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
};

export const mapTaskToDb = (task: Task) => {
  let completedAtValue: string | null = null;
  if (task.completed) {
    const isoDate = task.completedAt || new Date().toISOString();
    completedAtValue = task.completedBy ? `${isoDate}_by_${task.completedBy}` : isoDate;
  }

  let timeValue: string | null = null;
  if (!task.allDay && task.time) {
    timeValue = task.endTime ? `${task.time} - ${task.endTime}` : task.time;
  }

  return {
    id: task.id,
    title: task.title,
    description: task.description || null,
    date: task.date,
    time: timeValue,
    all_day: task.allDay,
    assignee: task.assignee,
    category: task.category,
    priority: task.priority,
    completed: task.completed,
    completed_at: completedAtValue,
    recurrence: task.recurrence,
    reminder: task.reminder,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
  };
};

export const supabaseSync = {
  /**
   * Fetch all tasks from Supabase
   */
  async fetchTasks(): Promise<Task[] | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('almanac_tasks')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.warn('Supabase fetch error:', error);
      return null;
    }

    return (data || []).map(mapDbToTask);
  },

  /**
   * Save / Upsert a single task
   */
  async upsertTask(task: Task): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    const { error } = await supabase.from('almanac_tasks').upsert(mapTaskToDb(task));
    if (error) {
      console.error('Supabase upsert error:', error);
      return false;
    }
    return true;
  },

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    const { error } = await supabase.from('almanac_tasks').delete().eq('id', id);
    if (error) {
      console.error('Supabase delete error:', error);
      return false;
    }
    return true;
  },

  /**
   * Upload all local tasks to cloud (Initial migration)
   */
  async uploadAll(tasks: Task[]): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    const dbRows = tasks.map(mapTaskToDb);
    const { error } = await supabase.from('almanac_tasks').upsert(dbRows);
    return !error;
  }
};
