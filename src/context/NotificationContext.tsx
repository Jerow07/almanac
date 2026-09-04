import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationService, AppNotification } from '../services/notifications';
import { useCalendar } from './CalendarContext';
import { sounds } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';
import { formatFriendlyDate } from '../utils/dateUtils';
import { Task } from '../types';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  notificationsEnabled: boolean;
  toggleNotificationsEnabled: () => void;
  permissionStatus: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tasks, currentUser } = useCalendar();
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() =>
    notificationService.getEnabled()
  );

  const toggleNotificationsEnabled = () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    notificationService.setEnabled(next);
    sounds.playPop();
  };
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('almanac_recent_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    notificationService.getPermission()
  );

  const isSupported = notificationService.isSupported();

  // Save notifications to storage
  useEffect(() => {
    try {
      localStorage.setItem('almanac_recent_notifications', JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);


  // Listen to remote partner actions (e.g., partner adds or completes a task)
  useEffect(() => {
    const handlePartnerAction = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: 'insert' | 'complete'; task: Task }>;
      if (!customEvent.detail) return;
      const { type, task } = customEvent.detail;

      const partnerName = currentUser === 'jeronimo' ? 'Zahria' : 'Jerónimo';
      const otherPartnerKey = currentUser === 'jeronimo' ? 'zahria' : 'jeronimo';

      if (type === 'insert') {
        const isCreatedByPartner =
          task.createdBy === otherPartnerKey ||
          task.id.startsWith(`task_${otherPartnerKey}_`);

        if (isCreatedByPartner) {
          let title = `¡${partnerName} agregó un plan! 💖`;
          if (task.assignee === currentUser) {
            title = `¡${partnerName} te asignó una tarea! 📌`;
          } else if (task.assignee === 'both') {
            title = `¡${partnerName} agregó un plan juntos! 💑`;
          } else {
            title = `¡${partnerName} agregó su tarea! 🌸`;
          }

          const timeInfo = task.time
            ? ` a las ${task.time}${task.endTime ? `-${task.endTime}` : ''} hs`
            : '';
          const message = `"${task.title}" para el ${formatFriendlyDate(task.date)}${timeInfo}`;

          // 1. Play alert sound (if enabled)
          if (notificationsEnabled) {
            sounds.playNotification();
          }

          // 2. Native browser push notification
          notificationService.showSystemNotification(title, {
            body: message,
            tag: task.id,
          });

          // 3. Add to notification drawer
          setNotifications((prev) => [
            {
              id: 'partner_' + Date.now(),
              taskId: task.id,
              title,
              message,
              timestamp: new Date().toISOString(),
              read: false,
            },
            ...prev,
          ].slice(0, 25));
        }
      } else if (type === 'complete') {
        const completer = task.completedBy;

        // If completed by ourselves, NEVER show notification to ourselves!
        if (completer && completer === currentUser) {
          return;
        }

        const partnerName = completer === 'zahria' ? 'Zahria' : 'Jerónimo';

        let title = '';
        let message = '';

        if (task.assignee === currentUser) {
          // The partner completed a task that was assigned to YOU!
          title = `¡${partnerName} completó tu tarea! 💖`;
          message = `"${task.title}" (¡Te dio una mano con tu pendiente!)`;
        } else if (task.assignee === 'both') {
          // The partner completed a shared couple plan!
          title = `¡${partnerName} completó el plan juntos! 💑`;
          message = `"${task.title}" (¡Plan en pareja cumplido!)`;
        } else {
          // The partner completed their own task!
          title = `¡${partnerName} completó su tarea! 👏`;
          message = `"${task.title}"`;
        }

        if (notificationsEnabled) {
          sounds.playSuccessChime();
          triggerConfetti();
        }

        notificationService.showSystemNotification(title, {
          body: message,
          tag: task.id,
        });

        setNotifications((prev) => [
          {
            id: 'complete_' + Date.now(),
            taskId: task.id,
            title,
            message,
            timestamp: new Date().toISOString(),
            read: false,
          },
          ...prev,
        ].slice(0, 25));
      }
    };

    window.addEventListener('almanac:partner-action', handlePartnerAction);
    return () => window.removeEventListener('almanac:partner-action', handlePartnerAction);
  }, [currentUser, notificationsEnabled]);

  // Ensure push subscription is registered for this user
  useEffect(() => {
    if (permissionStatus === 'granted') {
      notificationService.subscribeToPush(currentUser);
    }
  }, [currentUser, permissionStatus]);

  const requestPermission = async () => {
    const status = await notificationService.requestPermission();
    setPermissionStatus(status);
    if (status === 'granted') {
      await notificationService.subscribeToPush(currentUser);
      notificationService.showSystemNotification('¡Notificaciones activadas en Almanac! 💖', {
        body: 'Te avisaremos a ti y a Zahria antes de cada tarea y cuando agreguen planes.',
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
    try {
      localStorage.removeItem('almanac_recent_notifications');
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        notificationsEnabled,
        toggleNotificationsEnabled,
        permissionStatus,
        isSupported,
        requestPermission,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
