import { Task } from '../types';
import { sounds } from '../utils/sound';

export interface AppNotification {
  id: string;
  taskId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

class NotificationService {
  private notifiedTaskIds: Set<string> = new Set();

  constructor() {
    try {
      const stored = localStorage.getItem('almanac_notified_tasks');
      if (stored) {
        this.notifiedTaskIds = new Set(JSON.parse(stored));
      }
    } catch {
      this.notifiedTaskIds = new Set();
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return 'denied';
    }
  }

  /**
   * Display native system notification
   */
  public showSystemNotification(title: string, options?: NotificationOptions) {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return;
    }

    try {
      const n = new Notification(title, {
        icon: '/calendar-heart.svg',
        badge: '/calendar-heart.svg',
        ...options,
      });

      n.onclick = () => {
        window.focus();
        n.close();
      };
    } catch {
      // Notification failed
    }
  }

  /**
   * Evaluates if any tasks are due according to their reminder configuration
   */
  public checkTaskReminders(tasks: Task[], onAlert?: (notif: AppNotification) => void): AppNotification[] {
    const now = new Date();
    const newAlerts: AppNotification[] = [];

    tasks.forEach((task) => {
      if (task.completed || task.reminder === 'none') return;

      // Determine task trigger datetime
      const taskTime = task.time || '09:00';
      const taskDateTime = new Date(`${task.date}T${taskTime}:00`);

      if (isNaN(taskDateTime.getTime())) return;

      let reminderTime = new Date(taskDateTime.getTime());
      switch (task.reminder) {
        case '15_min':
          reminderTime = new Date(taskDateTime.getTime() - 15 * 60 * 1000);
          break;
        case '1_hour':
          reminderTime = new Date(taskDateTime.getTime() - 60 * 60 * 1000);
          break;
        case '1_day':
          reminderTime = new Date(taskDateTime.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'at_time':
        default:
          break;
      }

      // If reminder time has passed within the last 2 hours and hasn't been notified yet
      const diffMs = now.getTime() - reminderTime.getTime();
      const notificationKey = `${task.id}_${task.date}_${task.reminder}`;

      if (diffMs >= 0 && diffMs <= 2 * 60 * 60 * 1000) {
        if (!this.notifiedTaskIds.has(notificationKey)) {
          this.notifiedTaskIds.add(notificationKey);
          this.saveNotifiedKeys();

          const alertObj: AppNotification = {
            id: 'notif_' + Math.random().toString(36).substring(2, 9),
            taskId: task.id,
            title: `Recordatorio: ${task.title}`,
            message: task.allDay
              ? `Para hoy: ${task.title}`
              : `Programado a las ${task.time} (${task.date})`,
            timestamp: new Date().toISOString(),
            read: false,
          };

          newAlerts.push(alertObj);

          // Play alert chime
          sounds.playNotification();

          // Native browser notification
          this.showSystemNotification(alertObj.title, {
            body: alertObj.message,
            tag: task.id,
          });

          if (onAlert) {
            onAlert(alertObj);
          }
        }
      }
    });

    return newAlerts;
  }

  private saveNotifiedKeys() {
    try {
      localStorage.setItem(
        'almanac_notified_tasks',
        JSON.stringify(Array.from(this.notifiedTaskIds))
      );
    } catch {
      // LocalStorage quota or error
    }
  }
}

export const notificationService = new NotificationService();
