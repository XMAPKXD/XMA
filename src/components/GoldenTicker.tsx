import React from 'react';
import { Sparkles, Trophy, Flame } from 'lucide-react';

interface GoldenTickerProps {
  tickerText: string;
}

export const GoldenTicker: React.FC<GoldenTickerProps> = ({ tickerText }) => {
  return (
    <div className="relative bg-gradient-to-r from-[#0d0e12] via-[#1b170e] to-[#0d0e12] border-y border-amber-500/30 overflow-hidden py-2 shadow-inner">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d0e12] via-transparent to-[#0d0e12] z-10 pointer-events-none" />
      
      <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-amber-200/90 whitespace-nowrap animate-shimmer">
        <div className="flex items-center gap-2 pl-4 z-20 shrink-0 bg-amber-500/20 px-3 py-0.5 rounded-full border border-amber-400/40 text-amber-300">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-extrabold text-[11px]">XMA FLASH</span>
        </div>

        <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 inline" />
            {tickerText}
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-2 text-slate-300">
            <Flame className="w-3.5 h-3.5 text-amber-500 inline" />
            VOTAÇÃO ABERTA EM TODAS AS CATEGORIAS METÁLICAS
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-2 text-amber-300">
            <Trophy className="w-3.5 h-3.5 text-amber-400 inline" />
            CERIMÔNIA DE GALA PK XD AO VIVO NO PALCO XMA
          </span>
        </div>
      </div>
    </div>
  );
};
