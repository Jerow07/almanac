import React from 'react';
import { createPortal } from 'react-dom';
import { useNotification } from '../../context/NotificationContext';
import { notificationService } from '../../services/notifications';
import { sounds } from '../../utils/sound';
import { Bell, Check, Trash2, BellRing, BellOff } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    notificationsEnabled,
    toggleNotificationsEnabled,
    permissionStatus,
    isSupported,
    requestPermission,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
  } = useNotification();

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Full-screen Backdrop (closes modal on tap) */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[9998]"
        onClick={onClose}
      />

      {/* Floating Notification Card (Always on top of everything) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed inset-x-3 sm:inset-x-auto sm:right-6 top-16 w-auto sm:w-96 bg-white rounded-3xl shadow-2xl border border-pink-100 z-[9999] overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100/60">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-pink-500" />
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Avisos & Recordatorios
            </h4>
          </div>
          {notifications.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-pink-600 hover:text-pink-700 font-medium cursor-pointer"
                title="Marcar todas como leídas"
              >
                Leídas
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => {
                  clearNotifications();
                  sounds.playPop();
                }}
                className="text-slate-400 hover:text-rose-500 font-medium flex items-center gap-1 cursor-pointer"
                title="Limpiar todos los avisos"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>
            </div>
          )}
        </div>

        {/* Master In-App Notifications Switch */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/90 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2.5">
            {notificationsEnabled ? (
              <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center flex-shrink-0">
                <Bell className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0">
                <BellOff className="w-4 h-4" />
              </div>
            )}
            <div>
              <p className="font-bold text-slate-800 text-xs">
                {notificationsEnabled ? 'Avisos: Activos' : 'Avisos: En Pausa'}
              </p>
              <p className="text-[11px] text-slate-500">
                {notificationsEnabled
                  ? 'Recibes alertas de planes y tareas'
                  : 'Silenciados dentro de Almanac'}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleNotificationsEnabled();
            }}
            className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors cursor-pointer flex-shrink-0 ${
              notificationsEnabled ? 'bg-pink-500' : 'bg-slate-300'
            }`}
            title={notificationsEnabled ? 'Pausar avisos' : 'Activar avisos'}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                notificationsEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Permission Prompt for Android if not yet granted */}
        {isSupported && permissionStatus === 'default' && (
          <div className="p-3 bg-pink-50/80 border-b border-pink-100 flex items-center justify-between gap-2 text-xs">
            <div>
              <p className="font-bold text-pink-900">🔔 Activar avisos en Android</p>
              <p className="text-[11px] text-pink-700">Toca aquí para autorizar alertas</p>
            </div>
            <button
              type="button"
              onClick={requestPermission}
              className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer flex-shrink-0 active:scale-95"
            >
              Permitir
            </button>
          </div>
        )}

        {/* Permission Denied Guide for Android */}
        {isSupported && permissionStatus === 'denied' && (
          <div className="p-3 bg-rose-50 border-b border-rose-100 text-xs">
            <p className="font-bold text-rose-800 flex items-center gap-1">
              <span>⚠️</span>
              <span>Notificaciones bloqueadas en Android</span>
            </p>
            <p className="text-[11px] text-rose-700 mt-1 leading-relaxed">
              Tu teléfono tiene las notificaciones desactivadas para Almanac. Para recibirlas: mantén presionado el ícono de <strong>Almanac</strong> en el celular ➔ <strong>Info de la app (ⓘ)</strong> ➔ <strong>Notificaciones</strong> ➔ <strong>Permitir</strong>.
            </p>
          </div>
        )}

        {/* Notifications List */}
        <div className="divide-y divide-slate-100 overflow-y-auto flex-1 max-h-[320px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
              <p className="text-xs font-semibold">No hay avisos pendientes</p>
              <p className="text-[11px] mt-0.5">¡Están al día con todos los planes!</p>
            </div>
          ) : (
            notifications.map((notif) => {
              let timeFormatted = '';
              try {
                timeFormatted = formatDistanceToNow(parseISO(notif.timestamp), {
                  addSuffix: true,
                  locale: es,
                });
              } catch {
                timeFormatted = 'reciente';
              }

              return (
                <div
                  key={notif.id}
                  className={`p-3 transition-colors flex items-start justify-between gap-2.5 ${
                    notif.read ? 'bg-white opacity-70' : 'bg-pink-50/20'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {!notif.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 flex-shrink-0" />
                      )}
                      <h5 className="font-bold text-xs text-slate-800 truncate">
                        {notif.title}
                      </h5>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {timeFormatted}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!notif.read && (
                      <button
                        type="button"
                        onClick={() => markAsRead(notif.id)}
                        className="p-1 rounded-full text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                        title="Marcar como leída"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        deleteNotification(notif.id);
                        sounds.playClick();
                      }}
                      className="p-1 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 cursor-pointer"
                      title="Eliminar este aviso"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Test Button */}
        <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between px-4">
          <button
            type="button"
            onClick={() => {
              notificationService.showSystemNotification('¡Prueba de Almanac! 💖', {
                body: '¡Excelente! Las notificaciones en tu Android están funcionando.',
              });
              sounds.playNotification();
            }}
            className="text-xs font-bold text-pink-600 hover:text-pink-700 cursor-pointer flex items-center gap-1 py-1 px-2 rounded-xl hover:bg-pink-50 transition-colors active:scale-95"
            title="Enviar una notificación de prueba ahora"
          >
            <span>🔔</span>
            <span>Probar notificación</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 py-1 px-3 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};
