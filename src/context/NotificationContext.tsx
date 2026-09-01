import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationService, AppNotification } from '../services/notifications';
import { useCalendar } from './CalendarContext';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  permissionStatus: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tasks } = useCalendar();
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

  // Periodic reminder checking
  useEffect(() => {
    const check = () => {
      notificationService.checkTaskReminders(tasks, (newAlert) => {
        setNotifications((prev) => [newAlert, ...prev].slice(0, 20)); // Keep last 20
      });
    };

    // Immediate check
    check();

    // Check every 30 seconds
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [tasks]);

  const requestPermission = async () => {
    const status = await notificationService.requestPermission();
    setPermissionStatus(status);
    if (status === 'granted') {
      notificationService.showSystemNotification('¡Notificaciones activadas en Almanac! 💖', {
        body: 'Te avisaremos a ti y a Zahria antes de cada tarea importante.',
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

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        permissionStatus,
        isSupported,
        requestPermission,
        markAsRead,
        markAllAsRead,
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
