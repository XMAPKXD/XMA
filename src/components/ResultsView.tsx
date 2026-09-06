import React, { useState } from 'react';
import { 
  Trophy, 
  Crown, 
  Award, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Users, 
  ArrowRight,
  Eye,
  Radio
} from 'lucide-react';
import { motion } from 'motion/react';
import { Category, Nominee } from '../types';

interface ResultsViewProps {
  categories: Category[];
  onNavigateToCeremony: () => void;
  onSelectNomineeDetail?: (nominee: Nominee, category: Category) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  categories,
  onNavigateToCeremony,
  onSelectNomineeDetail
}) => {
  // Check which categories have winners revealed
  const categoriesWithWinners = categories.filter((c) => c.status === 'winner_revealed' && c.winnerNomineeId);
  const hasAnyWinner = categoriesWithWinners.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>GALERIA DE CAMPEÕES</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-cinzel text-white tracking-tight">
          RESULTADOS DO XMA 2026
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
          O momento máximo do ano: os vencedores oficiais coroados com o Troféu Titânio Dourado do multiverso PK XD.
        </p>

        {/* Live Stage Teaser Button */}
        <div className="pt-2">
          <button
            onClick={onNavigateToCeremony}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg hover:scale-105 transition-all"
          >
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Ver Cerimônia ao Vivo e Abertura dos Envelopes</span>
          </button>
        </div>
      </div>

      {/* Pre-event state if no winners revealed yet */}
      {!hasAnyWinner ? (
        <div className="rounded-3xl bg-gradient-to-b from-[#141522] via-[#0d0e17] to-[#07080c] border border-amber-500/30 p-8 sm:p-14 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-2xl bg-amber-400/10 border-2 border-amber-400/40 mx-auto flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/20">
            <Clock className="w-10 h-10" />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
              Divulgação Oficial: 25 de Setembro de 2026
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-cinzel text-white">
              OS VENCEDORES SERÃO REVELADOS NO DIA 25
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              As votações acontecem de 10 a 20 de Setembro. No dia 25 de Setembro às 19:00, a Cerimônia de Gala Oficial ao Vivo abrirá os envelopes dourados e consagrará os grandes campeões aqui no site oficial!
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onNavigateToCeremony}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Acessar Palco da Cerimônia</span>
            </button>
          </div>
        </div>
      ) : (
        /* Post-event Winners Showcase */
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categoriesWithWinners.map((category) => {
              const winner = category.nominees.find((n) => n.id === category.winnerNomineeId);
              if (!winner) return null;

              const totalVotes = category.nominees.reduce((sum, n) => sum + (n.votes || 0), 0);
              const percentage = totalVotes > 0 ? Math.round(((winner.votes || 0) / totalVotes) * 100) : 0;

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl bg-gradient-to-b from-[#161726] to-[#0c0d15] border-2 border-amber-400/60 p-6 sm:p-8 shadow-2xl shadow-amber-500/15 relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="space-y-6">
                    {/* Top Ribbon */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black tracking-widest uppercase bg-gradient-to-r from-amber-400 to-yellow-300 text-black px-3.5 py-1 rounded-full shadow-md">
                        🏆 VENCEDOR OFICIAL
                      </span>
                      <span className="text-xs font-mono text-zinc-400">
                        {category.title}
                      </span>
                    </div>

                    {/* Winner Big Showcase */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                      <div className="relative shrink-0">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-zinc-900 border-2 border-amber-400 shadow-xl shadow-amber-400/30">
                          <img
                            src={winner.avatarUrl}
                            alt={winner.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-tr from-amber-400 to-yellow-300 text-black p-1.5 rounded-xl shadow">
                          <Crown className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-2xl font-black font-cinzel text-white">
                          {winner.name}
                        </h3>
                        <span className="text-xs font-mono text-amber-300 block">
                          {winner.handle} • {winner.pkxdId || '#PKXD'}
                        </span>
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed pt-1">
                          {winner.bio || winner.projectDescription}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-black/50 border border-zinc-800 text-center">
                      <div>
                        <div className="text-xl font-black font-cinzel text-amber-400">
                          {percentage}%
                        </div>
                        <div className="text-[10px] font-mono uppercase text-zinc-400 mt-0.5">
                          Aprovação Popular
                        </div>
                      </div>
                      <div>
                        <div className="text-xl font-black font-cinzel text-white">
                          {(winner.votes || 0).toLocaleString('pt-BR')}
                        </div>
                        <div className="text-[10px] font-mono uppercase text-zinc-400 mt-0.5">
                          Votos Auditados
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Winner Action */}
                  <div className="mt-6 pt-4 border-t border-zinc-850 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectNomineeDetail) {
                          onSelectNomineeDetail(winner, category);
                        }
                      }}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ver Ficha Técnica</span>
                    </button>

                    <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Troféu Entregue</span>
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
