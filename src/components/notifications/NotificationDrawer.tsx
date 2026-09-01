import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { Bell, Check, Trash2, BellRing, Sparkles } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    permissionStatus,
    isSupported,
    requestPermission,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useNotification();

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 sm:hidden"
        onClick={onClose}
      />

      <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-14 w-auto sm:w-96 bg-white rounded-3xl shadow-2xl border border-pink-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
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
              className="text-pink-600 hover:text-pink-700 font-medium"
              title="Marcar todas como leídas"
            >
              Leídas
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={clearNotifications}
              className="text-slate-400 hover:text-rose-500"
              title="Limpiar avisos"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Permission banner if needed */}
      {isSupported && permissionStatus !== 'granted' && (
        <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100/60 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <p className="font-semibold">¿Activar avisos en pantalla?</p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              Recibe notificaciones en tu celular o navegador antes de cada tarea.
            </p>
            <button
              type="button"
              onClick={requestPermission}
              className="mt-2 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-[11px] shadow-sm transition-all"
            >
              Permitir notificaciones
            </button>
          </div>
        </div>
      )}

      {/* Notification list */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2 stroke-1" />
            <p className="text-xs font-medium text-slate-600">No hay avisos pendientes</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Aquí aparecerán las alertas programadas para Jerónimo y Zahria.
            </p>
          </div>
        ) : (
          notifications.map((n) => {
            let timeAgo = '';
            try {
              timeAgo = formatDistanceToNow(parseISO(n.timestamp), {
                addSuffix: true,
                locale: es,
              });
            } catch {
              timeAgo = '';
            }

            return (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`p-3.5 flex items-start justify-between gap-2 transition-colors cursor-pointer ${
                  n.read ? 'bg-white hover:bg-slate-50' : 'bg-pink-50/40 hover:bg-pink-50/70'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500 flex-shrink-0" />
                    )}
                    <p className={`text-xs font-semibold ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>
                      {n.title}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{timeAgo}</p>
                </div>

                {!n.read && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(n.id);
                    }}
                    className="p-1 rounded-full text-slate-300 hover:text-emerald-600 hover:bg-emerald-50"
                    title="Marcar como leída"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold text-slate-500 hover:text-slate-700"
        >
          Cerrar
        </button>
      </div>
    </div>
  </>
);
};
