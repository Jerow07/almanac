import React, { useState, useEffect } from 'react';
import {
  getStoredCloudConfig,
  saveStoredCloudConfig,
  getSupabase,
  supabaseSync
} from '../../services/supabase';
import { useCalendar } from '../../context/CalendarContext';
import { Cloud, CloudOff, X, Check, Copy, ExternalLink, RefreshCw, Sparkles } from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_SCHEMA = `CREATE TABLE IF NOT EXISTS almanac_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  time TEXT,
  all_day BOOLEAN DEFAULT false,
  assignee TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TEXT,
  recurrence TEXT DEFAULT 'none',
  reminder TEXT DEFAULT 'none',
  created_at TEXT,
  updated_at TEXT
);

-- Habilitar tiempo real (Realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE almanac_tasks;

-- Habilitar acceso compartido
ALTER TABLE almanac_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acceso total para Almanac" ON almanac_tasks
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Tabla para notificaciones push en segundo plano
CREATE TABLE IF NOT EXISTS almanac_push_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE almanac_push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acceso total subscripciones push" ON almanac_push_subscriptions
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Tabla para registro de recordatorios enviados
CREATE TABLE IF NOT EXISTS almanac_reminders_sent (
  id TEXT PRIMARY KEY,
  task_id TEXT,
  reminded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE almanac_reminders_sent ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acceso total reminders sent" ON almanac_reminders_sent
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
`;

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose }) => {
  const { tasks, syncFromCloud } = useCalendar();
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const config = getStoredCloudConfig();
      if (config) {
        setUrl(config.url);
        setAnonKey(config.anonKey);
      } else {
        setUrl('');
        setAnonKey('');
      }
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConnected = Boolean(getStoredCloudConfig());

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) return;

    setIsTesting(true);
    setStatusMessage(null);

    try {
      saveStoredCloudConfig({ url: url.trim(), anonKey: anonKey.trim() });
      const client = getSupabase();
      if (!client) throw new Error('No se pudo inicializar Supabase');

      // Test connection
      const { error } = await client.from('almanac_tasks').select('id').limit(1);
      if (error) {
        throw error;
      }

      // Upload local tasks if cloud is empty
      await supabaseSync.uploadAll(tasks);
      await syncFromCloud();

      setStatusMessage({
        type: 'success',
        text: '¡Conexión exitosa! Ahora tú y Zahria verán las tareas sincronizadas en vivo.',
      });
    } catch (err: any) {
      saveStoredCloudConfig(null);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Error al conectar. Verifica que la tabla "tasks" esté creada.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRefresh = async () => {
    setIsTesting(true);
    setStatusMessage(null);
    try {
      await syncFromCloud();
      setStatusMessage({
        type: 'success',
        text: '¡Conexión actualizada y almanaque sincronizado con la nube! ✨',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Error al actualizar la conexión.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = () => {
    if (confirm('¿Desconectar de la nube y volver al modo local?')) {
      saveStoredCloudConfig(null);
      setUrl('');
      setAnonKey('');
      setStatusMessage({ type: 'info', text: 'Desconectado. Ahora se guardará únicamente en este navegador.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-purple-100 dark:border-slate-800 flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 dark:from-slate-850 dark:via-purple-950/40 dark:to-slate-850 border-b border-purple-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Sincronización en la Nube</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Para que Jerónimo y Zahria vean los cambios en vivo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 dark:text-slate-300">
          {/* Status banner */}
          <div
            className={`p-4 rounded-2xl flex items-center gap-3.5 border ${
              isConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            }`}
          >
            {isConnected ? (
              <>
                <Cloud className="w-7 h-7 text-emerald-500 dark:text-emerald-400 flex-shrink-0 fill-emerald-100 dark:fill-emerald-950/60" />
                <div>
                  <p className="font-bold text-sm">¡Conectado a la Nube! 🌐</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5 leading-relaxed">
                    Tú y Zahria pueden agregar y completar tareas desde cualquier celular o PC y se actualizan al instante.
                  </p>
                </div>
              </>
            ) : (
              <>
                <CloudOff className="w-7 h-7 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm">Modo Local (Sin sincronizar)</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5 leading-relaxed">
                    Actualmente las tareas se guardan solo en este dispositivo. Conecta Supabase para sincronizar entre sus dos celulares.
                  </p>
                </div>
              </>
            )}
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-xl font-medium text-xs ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                  : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          {/* CONNECTED VIEW: Clean and simple, only refresh button */}
          {isConnected ? (
            <div className="space-y-4 pt-1">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isTesting}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-xs sm:text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Actualizando datos...' : 'Actualizar Conexión'}</span>
              </button>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-xs text-rose-500/80 hover:text-rose-600 hover:underline cursor-pointer"
                >
                  Desconectar
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            /* NOT CONNECTED VIEW: Setup guide & Form */
            <>
              <div className="space-y-2 bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-800 dark:text-slate-100">¿Cómo conectar la nube gratis en 2 minutos?</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300">
                  <li>
                    Crea una cuenta gratuita en{' '}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-600 dark:text-purple-400 font-bold underline inline-flex items-center gap-0.5"
                    >
                      supabase.com <ExternalLink className="w-2.5 h-2.5" />
                    </a>{' '}
                    y crea un nuevo proyecto.
                  </li>
                  <li>
                    En el menú lateral de Supabase, ve a <strong>SQL Editor</strong> y pega este código:
                  </li>
                </ol>

                {/* SQL Snippet */}
                <div className="relative bg-slate-900 text-slate-100 p-2.5 rounded-xl font-mono text-[10px] overflow-x-auto">
                  <pre>{SQL_SCHEMA}</pre>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="absolute top-2 right-2 px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded-md text-[10px] flex items-center gap-1 font-sans transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? '¡Copiado!' : 'Copiar SQL'}
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  3. Ve a <strong>Project Settings ➔ API</strong> y copia la <strong>URL</strong> y la clave <strong>anon key</strong> aquí abajo:
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="space-y-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider text-[10px]">
                    Project URL
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://xxxxxxxxxxxx.supabase.co"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider text-[10px]">
                    Anon Key (Clave Pública)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isTesting}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {isTesting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Conectar y Sincronizar</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
