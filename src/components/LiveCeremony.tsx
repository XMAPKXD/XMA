import React, { useState } from 'react';
import { Category, Nominee, CeremonySettings, CeremonySegment, LiveChatMessage } from '../types';
import { 
  Trophy, 
  Crown, 
  Sparkles, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Send, 
  Flame, 
  Award, 
  Mail, 
  Star,
  Users,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerWinnerTrophyBlast, triggerGoldenConfetti } from '../utils/confetti';
import { playFanfare, playVoteChime } from '../utils/audio';

interface LiveCeremonyProps {
  categories: Category[];
  settings: CeremonySettings;
  segments: CeremonySegment[];
  chatMessages: LiveChatMessage[];
  onSendMessage: (text: string) => void;
  onOpenEnvelope: (categoryId: string) => void;
  onToggleSound: () => void;
}

export const LiveCeremony: React.FC<LiveCeremonyProps> = ({
  categories,
  settings,
  segments,
  chatMessages,
  onSendMessage,
  onOpenEnvelope,
  onToggleSound
}) => {
  const [selectedCategoryForEnvelope, setSelectedCategoryForEnvelope] = useState<string>(
    categories[0]?.id || ''
  );
  const [envelopeRevealedMap, setEnvelopeRevealedMap] = useState<Record<string, boolean>>({});
  const [chatInput, setChatInput] = useState<string>('');

  const activeCategory = categories.find((c) => c.id === selectedCategoryForEnvelope) || categories[0];
  const sortedNominees = activeCategory
    ? [...activeCategory.nominees].sort((a, b) => b.votes - a.votes)
    : [];

  const topNominee = sortedNominees[0];
  const isWinnerRevealed = activeCategory?.status === 'winner_revealed';
  const isLocalEnvelopeOpen = envelopeRevealedMap[activeCategory?.id || ''] || isWinnerRevealed;

  const handleOpenEnvelopeLocal = () => {
    if (!activeCategory) return;
    setEnvelopeRevealedMap((prev) => ({
      ...prev,
      [activeCategory.id]: true
    }));
    playFanfare();
    triggerWinnerTrophyBlast();
    onOpenEnvelope(activeCategory.id);
  };

  const handleSendCommunityMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    playVoteChime();
    setChatInput('');
  };

  // Count all revealed winners
  const revealedWinnersCount = categories.filter((c) => c.status === 'winner_revealed').length;

  return (
    <div className="space-y-10 pb-16">
      {/* Grand Gala Ceremony Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#171822] via-[#2d2313] to-[#12131b] border-2 border-amber-500/50 p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 border border-amber-400/50 text-amber-300">
              <Award className="w-3.5 h-3.5" />
              <span>Gala Oficial de Premiação & Resultados</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-cinzel">
              Palco de Premiação <span className="text-gold-metallic">XMA 2026</span>
            </h1>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              Abra os <strong>Envelopes Dourados Interativos</strong> para revelar os vencedores oficiais eleitos pelos votos em massa e votos verificados da comunidade PK XD!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0e0f16] border border-amber-500/40 text-center space-y-2 shrink-0 min-w-[200px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Vencedores Revelados
            </span>
            <div className="text-3xl font-extrabold text-amber-300 font-mono">
              {revealedWinnersCount} / {categories.length}
            </div>
            <span className="text-[10px] text-emerald-400 font-bold block">
              Apuração Oficial Auditada
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Envelope Stage + Champions Hall & Community Mural */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Interactive Envelope Stage (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Category Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat, idx) => {
              const isSelected = cat.id === selectedCategoryForEnvelope;
              const isRevealed = cat.status === 'winner_revealed';

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryForEnvelope(cat.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-black border-amber-300 shadow-md font-extrabold scale-105'
                      : 'bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800'
                  }`}
                >
                  <span>{cat.title}</span>
                  {isRevealed && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                </button>
              );
            })}
          </div>

          {/* Interactive Golden Envelope Component */}
          {activeCategory && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#13141d] border-2 border-amber-500/40 shadow-2xl space-y-6 text-center">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  {activeCategory.sponsor || 'XMA Gala'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-cinzel">
                  {activeCategory.title}
                </h2>
                <p className="text-xs text-zinc-400 max-w-lg mx-auto">
                  {activeCategory.subtitle}
                </p>
              </div>

              {/* Envelope Animation Container */}
              <div className="relative py-6 max-w-md mx-auto">
                <AnimatePresence mode="wait">
                  {!isLocalEnvelopeOpen ? (
                    <motion.div
                      key="closed-envelope"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.05, opacity: 0 }}
                      className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#2a2212] to-[#14151e] border-2 border-amber-400/80 shadow-[0_0_40px_rgba(245,158,11,0.25)] space-y-5"
                    >
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-600 p-0.5 mx-auto shadow-lg shadow-amber-500/30">
                        <div className="w-full h-full bg-[#0a0a0e] rounded-[22px] flex items-center justify-center">
                          <Mail className="w-10 h-10 text-amber-400 animate-bounce" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm font-extrabold uppercase tracking-widest text-amber-300 font-cinzel">
                          Envelope Dourado Lacrado
                        </div>
                        <p className="text-xs text-zinc-400">
                          Os votos foram contabilizados e o resultado oficial está pronto para ser anunciado!
                        </p>
                      </div>

                      <button
                        onClick={handleOpenEnvelopeLocal}
                        id="open-envelope-btn"
                        className="w-full py-4 rounded-2xl bg-gold-metallic-btn text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-98 transition-transform"
                      >
                        <Crown className="w-4 h-4" />
                        <span>Abrir Envelope do Vencedor</span>
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="opened-envelope"
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#312711] via-[#1a1710] to-[#12131b] border-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.4)] space-y-6"
                    >
                      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-black shadow-md">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Grande Campeão XMA 2026</span>
                      </div>

                      {topNominee ? (
                        <div className="space-y-4">
                          <div className="relative inline-block">
                            <img
                              src={topNominee.avatarUrl}
                              alt={topNominee.name}
                              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-amber-400 shadow-2xl mx-auto"
                            />
                            <div className="absolute -top-3 -right-3 bg-amber-400 text-black p-2 rounded-full shadow-lg">
                              <Crown className="w-5 h-5" />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-cinzel">
                              {topNominee.name}
                            </h3>
                            <p className="text-sm text-amber-400 font-bold">
                              {topNominee.handle} • <span className="font-mono text-zinc-300">{topNominee.pkxdId}</span>
                            </p>
                            <p className="text-xs text-zinc-300 font-medium pt-1">
                              Trabalho Vencedor: <strong>{topNominee.projectTitle}</strong>
                            </p>
                          </div>

                          <div className="p-3 rounded-2xl bg-black/60 border border-amber-500/30 text-xs text-amber-300 font-mono">
                            👑 Total de Votos Conquistados: <strong>{topNominee.votes.toLocaleString('pt-BR')}</strong>
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 text-zinc-400 text-xs">
                          Nenhum indicado cadastrado para esta categoria ainda.
                        </div>
                      )}

                      <button
                        onClick={() => {
                          playFanfare();
                          triggerWinnerTrophyBlast();
                        }}
                        className="px-6 py-2.5 rounded-xl bg-gold-metallic-btn text-black font-extrabold text-xs uppercase flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-lg shadow-amber-500/20"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Soltar Chuva de Ouro</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Other Nominees in this Category */}
              <div className="pt-4 border-t border-zinc-800 text-left space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Todos os Concorrentes da Categoria
                </span>

                {sortedNominees.length === 0 ? (
                  <p className="text-xs text-zinc-500">Nenhum concorrente cadastrado nesta categoria.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {sortedNominees.map((nom, i) => (
                      <div
                        key={nom.id}
                        className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            i === 0 ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {i + 1}
                          </span>
                          <div>
                            <div className="font-bold text-white truncate max-w-[130px]">{nom.name}</div>
                            <div className="text-[10px] text-zinc-400">{nom.handle}</div>
                          </div>
                        </div>
                        <span className="font-mono text-amber-300 font-bold">
                          {nom.votes.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Cols: Champions Hall & Community Mural */}
        <div className="lg:col-span-5 space-y-6">
          {/* Champions Hall */}
          <div className="p-6 rounded-3xl bg-[#14151e] border border-amber-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-sm font-bold text-white font-cinzel">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Hall dos Campeões XMA</span>
              </div>
              <span className="text-[10px] font-mono text-amber-400 font-bold">
                Edição 2026
              </span>
            </div>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {categories.map((cat) => {
                const winner = cat.nominees.find((n) => n.id === cat.winnerNomineeId) || cat.nominees[0];
                const isRevealed = cat.status === 'winner_revealed';

                return (
                  <div
                    key={cat.id}
                    className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {winner?.avatarUrl ? (
                        <img
                          src={winner.avatarUrl}
                          alt={winner.name}
                          className="w-10 h-10 rounded-xl object-cover border border-amber-500/40"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500">
                          <Trophy className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="text-[10px] uppercase font-bold text-amber-400 truncate max-w-[160px]">
                          {cat.title}
                        </div>
                        <div className="font-bold text-white">
                          {isRevealed && winner ? winner.name : isRevealed ? 'Sem indicados' : 'Em Apuração...'}
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isRevealed ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {isRevealed ? '🏆 Vencedor' : 'Votação'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Community Cheers / Messages Wall */}
          <div className="p-6 rounded-3xl bg-[#14151e] border border-amber-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-sm font-bold text-white font-cinzel">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Mural da Torcida PK XD</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">
                {chatMessages.length} mensagens
              </span>
            </div>

            {/* Messages Feed */}
            <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    msg.userRole === 'admin'
                      ? 'bg-amber-500/10 border-amber-400/50'
                      : 'bg-zinc-900/90 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className={msg.userRole === 'admin' ? 'text-amber-300' : 'text-zinc-200'}>
                        {msg.userName}
                      </span>
                      {msg.userRole === 'admin' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-black font-extrabold">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500">{msg.timestamp}</span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed text-[11px]">
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>

            {/* Send Cheer Input */}
            <form onSubmit={handleSendCommunityMessage} className="flex gap-2 pt-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Envie sua torcida para os indicados..."
                className="flex-1 px-3.5 py-2 bg-black border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-gold-metallic-btn text-black font-bold text-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
