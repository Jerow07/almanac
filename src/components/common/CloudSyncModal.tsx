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

  const handleDisconnect = () => {
    if (confirm('¿Desconectar de la nube y volver al modo local?')) {
      saveStoredCloudConfig(null);
      setUrl('');
      setAnonKey('');
      setStatusMessage({ type: 'info', text: 'Desconectado. Ahora se guardará únicamente en este navegador.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 border-b border-purple-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Sincronización en la Nube</h3>
              <p className="text-xs text-slate-500">Para que Jerónimo y Zahria vean los cambios en vivo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600">
          {/* Status banner */}
          <div
            className={`p-3.5 rounded-2xl flex items-center gap-3 border ${
              isConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {isConnected ? (
              <>
                <Cloud className="w-6 h-6 text-emerald-500 flex-shrink-0 fill-emerald-100" />
                <div>
                  <p className="font-bold">¡Conectado a la Nube! 🌐</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Tú y Zahria pueden agregar y completar tareas desde cualquier celular o PC y se actualizan al instante.
                  </p>
                </div>
              </>
            ) : (
              <>
                <CloudOff className="w-6 h-6 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="font-bold">Modo Local (Sin sincronizar)</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Actualmente las tareas se guardan solo en la memoria de este navegador. Conecta Supabase (gratis) para sincronizar entre sus dos celulares.
                  </p>
                </div>
              </>
            )}
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-xl font-medium text-xs ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-100 text-emerald-800'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          {/* Setup guide */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <p className="font-bold text-slate-800">¿Cómo conectar la nube gratis en 2 minutos?</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>
                Crea una cuenta gratuita en{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-600 font-bold underline inline-flex items-center gap-0.5"
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
                className="absolute top-2 right-2 px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded-md text-[10px] flex items-center gap-1 font-sans transition-all"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? '¡Copiado!' : 'Copiar SQL'}
              </button>
            </div>

              <p className="text-[11px] text-slate-500">
                3. Ve a <strong>Project Settings ➔ API</strong> y copia la <strong>URL</strong> y la clave <strong>anon key</strong> aquí abajo:
              </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-3 pt-1">
            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                Project URL
              </label>
              <input
                type="url"
                required
                placeholder="https://xxxxxxxxxxxx.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                Anon Key (Clave Pública)
              </label>
              <input
                type="password"
                required
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {isConnected ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-rose-600 hover:text-rose-700 font-semibold"
                >
                  Desconectar
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                disabled={isTesting}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                {isTesting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {isConnected ? 'Actualizar Conexión' : 'Conectar y Sincronizar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
