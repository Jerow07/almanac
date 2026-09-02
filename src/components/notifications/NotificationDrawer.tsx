import React from 'react';
import { createPortal } from 'react-dom';
import { useNotification } from '../../context/NotificationContext';
import { Bell, Check, Trash2, BellRing, Sparkles, AlertCircle } from 'lucide-react';
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

  return createPortal(
    <>
      {/* Full-screen Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[9998]"
        onClick={onClose}
      />

      {/* Floating Notification Card (Always on top of everything) */}
      <div className="fixed inset-x-3 sm:inset-x-auto sm:right-6 top-16 w-auto sm:w-96 bg-white rounded-3xl shadow-2xl border border-pink-100 z-[9999] overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
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
        {isSupported && permissionStatus === 'denied' && (
          <div className="p-3.5 bg-rose-50 border-b border-rose-100/80 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900">
              <p className="font-bold">Avisos bloqueados en Android</p>
              <p className="text-[11px] text-rose-700 mt-1 leading-relaxed">
                Chrome tiene bloqueadas las notificaciones para este enlace. Para habilitarlas:
              </p>
              <ol className="list-decimal ml-4 mt-1.5 space-y-1 text-[11px] text-rose-800 font-medium">
                <li>Toca el ícono del <strong>candado o ajustes</strong> a la izquierda de la URL en Chrome.</li>
                <li>Toca en <strong>Permisos</strong> ➔ activa <strong>Notificaciones</strong>.</li>
                <li>Recarga la web.</li>
              </ol>
            </div>
          </div>
        )}

        {isSupported && permissionStatus === 'default' && (
          <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100/60 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <p className="font-semibold">¿Activar avisos en pantalla?</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Para que te lleguen avisos cuando Zahria o tú agreguen compromisos.
              </p>
              <button
                type="button"
                onClick={requestPermission}
                className="mt-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-[11px] shadow-xs transition-colors active:scale-95"
              >
                Permitir avisos
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="divide-y divide-slate-100 overflow-y-auto flex-1 max-h-[350px]">
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

                  {!notif.read && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notif.id)}
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
    </>,
    document.body
  );
};
