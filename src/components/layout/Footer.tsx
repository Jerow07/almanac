import React from 'react';
import { Heart, Smartphone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 py-8 border-t border-slate-200/60 bg-white/50 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-1.5 font-medium">
          <span>Almanac • Organizado con</span>
          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
          <span>por Jerónimo & Zahria</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 bg-slate-100/70 px-3 py-1.5 rounded-full">
          <Smartphone className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[11px]">
            Tip: Añade este sitio a la pantalla de inicio de tu celular para abrirlo como una App.
          </span>
        </div>
      </div>
    </footer>
  );
};
