import React from 'react';
import { Nominee, Category } from '../types';
import { X, Trophy, CheckCircle2, Flame, Award, Heart, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NomineeDetailModalProps {
  nominee: Nominee | null;
  category: Category | null;
  onClose: () => void;
  onVote: (categoryId: string, nomineeId: string) => void;
  hasVotedForCategory: boolean;
  votedNomineeId?: string;
  totalCategoryVotes: number;
}

export const NomineeDetailModal: React.FC<NomineeDetailModalProps> = ({
  nominee,
  category,
  onClose,
  onVote,
  hasVotedForCategory,
  votedNomineeId,
  totalCategoryVotes
}) => {
  if (!nominee || !category) return null;

  const isWinner = category.status === 'winner_revealed' && category.winnerNomineeId === nominee.id;
  const isUserVoted = votedNomineeId === nominee.id;
  const votePercentage = totalCategoryVotes > 0 
    ? Math.round((nominee.votes / totalCategoryVotes) * 100) 
    : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-2xl bg-[#111218] border border-amber-500/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.2)] z-10"
        >
          {/* Header Banner */}
          <div className="relative h-44 sm:h-52 bg-gradient-to-br from-[#1d1912] via-[#2a2315] to-[#12131a] overflow-hidden p-6 flex flex-col justify-between border-b border-amber-500/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.25),transparent_60%)]" />
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 border border-amber-400/40 text-amber-300">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                {category.title}
              </span>

              <button
                id="close-nominee-modal-btn"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-black/60 border border-zinc-700 text-zinc-300 hover:text-white hover:border-amber-400 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-cinzel">
                {nominee.name}
              </h2>
              {nominee.handle && (
                <p className="text-amber-400/90 text-sm font-semibold">{nominee.handle}</p>
              )}
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Avatar & Key Stats */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 bg-gradient-to-tr from-amber-500 via-amber-200 to-amber-700 shadow-xl shadow-amber-500/20">
                  <img
                    src={nominee.avatarUrl}
                    alt={nominee.name}
                    className="w-full h-full object-cover rounded-xl bg-black"
                  />
                </div>
                {isWinner && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-400 to-amber-600 text-black p-1.5 rounded-full shadow-lg border-2 border-black animate-bounce">
                    <Trophy className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  {nominee.pkxdId && nominee.pkxdId !== '#000' && !nominee.pkxdId.startsWith('#nom-') && (
                    <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-zinc-900 border border-zinc-700 text-zinc-300">
                      ID: {nominee.pkxdId}
                    </span>
                  )}
                  {nominee.badge && (
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500/30 to-amber-300/10 border border-amber-400 text-amber-300">
                      {nominee.badge}
                    </span>
                  )}
                  {isWinner && (
                    <span className="px-3 py-1 rounded-lg text-xs font-extrabold uppercase bg-amber-400 text-black shadow-md flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Vencedor Oficial
                    </span>
                  )}
                </div>

                {nominee.bio && nominee.bio !== nominee.projectTitle && (
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    {nominee.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Project / Work Nominated (if present and meaningful) */}
            {nominee.projectDescription && (
              <div className="p-5 rounded-2xl bg-[#161722] border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <Award className="w-4 h-4" />
                  <span>Observação / Indicação</span>
                </div>
                <p className="text-zinc-300 text-sm">
                  {nominee.projectDescription}
                </p>
              </div>
            )}

            {/* Real-Time Vote Bar in Modal */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900 via-[#191924] to-zinc-900 border border-amber-500/20 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-zinc-300 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Contagem em Tempo Real
                </span>
                <span className="font-bold text-amber-300">
                  {nominee.votes.toLocaleString('pt-BR')} votos ({votePercentage}%)
                </span>
              </div>

              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${votePercentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
              >
                Fechar
              </button>

              {category.status === 'voting_open' && (
                <button
                  id={`modal-vote-btn-${nominee.id}`}
                  onClick={() => {
                    onVote(category.id, nominee.id);
                  }}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                    isUserVoted
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-gold-metallic-btn text-black font-extrabold cursor-pointer'
                  }`}
                >
                  {isUserVoted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Voto Confirmado</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 fill-black" />
                      <span>{hasVotedForCategory ? 'Mudar Voto para Este' : 'Votar Neste Indicado'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
