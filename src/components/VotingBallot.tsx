import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Vote, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Eye, 
  Play, 
  RotateCcw, 
  X, 
  ShieldCheck, 
  Award, 
  Share2, 
  AlertCircle,
  LogIn,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Category, Nominee, PKXDUserAccount } from '../types';
import { triggerGoldenConfetti, triggerWinnerTrophyBlast } from '../utils/confetti';
import { playVoteChime } from '../utils/audio';

interface VotingBallotProps {
  categories: Category[];
  userAccount: PKXDUserAccount;
  initialSelections?: Record<string, string>; // categoryId -> nomineeId
  onSaveVotes: (votes: Record<string, string>) => void;
  onOpenLoginModal: () => void;
  onSelectNomineeDetail?: (nominee: Nominee, category: Category) => void;
}

export const VotingBallot: React.FC<VotingBallotProps> = ({
  categories,
  userAccount,
  initialSelections = {},
  onSaveVotes,
  onOpenLoginModal,
  onSelectNomineeDetail
}) => {
  // Current active category index in step-by-step or browse view
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(0);

  // User selections for this ballot session (categoryId -> nomineeId)
  const [ballotSelections, setBallotSelections] = useState<Record<string, string>>(() => {
    // initialize from initialSelections or userAccount.verifiedVotes
    const initial: Record<string, string> = { ...initialSelections };
    if (userAccount.verifiedVotes) {
      Object.entries(userAccount.verifiedVotes).forEach(([catId, nomId]) => {
        if (!initial[catId] && nomId) {
          initial[catId] = String(nomId);
        }
      });
    }
    return initial;
  });

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  // Completed Ballot State
  const [isBallotSubmitted, setIsBallotSubmitted] = useState<boolean>(false);
  const [receiptCode, setReceiptCode] = useState<string>('');

  const currentCategory = categories[activeCategoryIndex] || categories[0];
  const totalCategories = categories.length;

  // Answered categories count
  const answeredCount = useMemo(() => {
    return categories.filter((cat) => Boolean(ballotSelections[cat.id])).length;
  }, [categories, ballotSelections]);

  const progressPercentage = Math.round((answeredCount / Math.max(totalCategories, 1)) * 100);

  // Handle selecting a nominee
  const handleSelectNominee = (categoryId: string, nomineeId: string) => {
    setBallotSelections((prev) => ({
      ...prev,
      [categoryId]: nomineeId
    }));
    playVoteChime();
  };

  // Next category handler
  const handleNextCategory = () => {
    if (activeCategoryIndex < totalCategories - 1) {
      setActiveCategoryIndex((prev) => prev + 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } else {
      setIsReviewModalOpen(true);
    }
  };

  // Previous category handler
  const handlePrevCategory = () => {
    if (activeCategoryIndex > 0) {
      setActiveCategoryIndex((prev) => prev - 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  // Confirm final ballot submission
  const handleConfirmBallot = () => {
    if (answeredCount === 0) {
      alert('Por favor, escolha pelo menos um indicado antes de confirmar a votação.');
      return;
    }

    onSaveVotes(ballotSelections);
    triggerGoldenConfetti();
    triggerWinnerTrophyBlast();
    playVoteChime();

    const code = `XMA-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    setReceiptCode(code);
    setIsReviewModalOpen(false);
    setIsBallotSubmitted(true);
    window.scrollTo({ top: 80, behavior: 'smooth' });
  };

  // Reset Ballot to start over
  const handleResetBallot = () => {
    if (confirm('Deseja reiniciar todas as suas escolhas desta cédula?')) {
      setBallotSelections({});
      setIsBallotSubmitted(false);
      setActiveCategoryIndex(0);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* ========================================================= */}
      {/* VOTAÇÃO XMA HEADER */}
      {/* ========================================================= */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
          <Vote className="w-3.5 h-3.5 text-amber-400" />
          <span>URNA ELEITORAL OFICIAL 2026</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-cinzel text-white tracking-tight">
          VOTAÇÃO XMA
        </h1>

        <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto">
          Escolha seus favoritos em cada categoria oficial. Seu voto é registrado de forma transparente e segura.
        </p>
      </div>

      {/* ========================================================= */}
      {/* PROGRESS BAR & CATEGORY QUICK JUMP */}
      {/* ========================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0c0d15] border border-zinc-800 shadow-xl space-y-3 sticky top-20 z-30 backdrop-blur-xl">
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="text-white font-mono">
              Progresso da Cédula:
            </span>
            <span className="text-amber-400 font-mono">
              {answeredCount} de {totalCategories} categorias respondidas
            </span>
          </div>

          <span className="text-zinc-400 font-mono">
            {progressPercentage}%
          </span>
        </div>

        {/* Progress Fill Bar */}
        <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-yellow-400"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Category Jump Dots / Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {categories.map((cat, idx) => {
            const isAnswered = Boolean(ballotSelections[cat.id]);
            const isCurrent = idx === activeCategoryIndex;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isCurrent
                    ? 'bg-amber-400 text-black border-amber-400 font-black shadow-md shadow-amber-400/20'
                    : isAnswered
                    ? 'bg-zinc-900 text-amber-300 border-amber-500/40'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:border-zinc-700'
                }`}
              >
                <span>{idx + 1}</span>
                {isAnswered && <Check className="w-3 h-3 text-amber-400" />}
                <span className="hidden sm:inline truncate max-w-[100px]">{cat.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* BALLOT SUCCESS CONFIRMATION VIEW */}
      {/* ========================================================= */}
      {isBallotSubmitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#141522] via-[#0f101a] to-[#090a10] border-2 border-amber-500/50 text-center space-y-6 shadow-2xl shadow-amber-950/30"
        >
          <div className="w-20 h-20 rounded-full bg-amber-400/20 border-2 border-amber-400/60 mx-auto flex items-center justify-center text-amber-300 shadow-xl shadow-amber-500/20">
            <CheckCircle2 className="w-10 h-10 text-amber-400" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              Votação Registrada com Sucesso
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-cinzel text-white">
              Obrigado pelo seu Voto no XMA 2026!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto">
              Todas as suas escolhas foram contabilizadas no sistema oficial e sincronizadas de forma segura.
            </p>
          </div>

          {/* Receipt Box */}
          <div className="p-4 rounded-2xl bg-black/60 border border-zinc-800 max-w-sm mx-auto space-y-1">
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
              Comprovante de Auditoria
            </div>
            <div className="text-base font-mono font-black text-amber-300 tracking-wider">
              {receiptCode}
            </div>
            <div className="text-[10px] text-zinc-500">
              Registrado para: {userAccount.nickname || 'Eleitor Popular PK XD'}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setIsBallotSubmitted(false)}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
            >
              Revisar ou Alterar Escolhas
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'XMA 2026 — Votei nos meus favoritos!',
                    text: 'Acabei de registrar meus votos no XD Music & Media Awards 2026. Vote você também!',
                    url: window.location.href
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link da votação copiado com sucesso!');
                }
              }}
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Compartilhar Votação</span>
            </button>
          </div>
        </motion.div>
      ) : (
        /* ========================================================= */
        /* ACTIVE CATEGORY CARD & NOMINEES GRID */
        /* ========================================================= */
        currentCategory && (
          <div className="space-y-6">
            {/* Category Header Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0e0f17] border border-zinc-800 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                      Categoria {activeCategoryIndex + 1} de {totalCategories}
                    </span>
                    {ballotSelections[currentCategory.id] && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Votado</span>
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black font-cinzel text-white flex items-center gap-2.5">
                    <span>{currentCategory.title}</span>
                  </h2>

                  <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                    {currentCategory.description || currentCategory.subtitle}
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-xs font-mono text-zinc-500 block">
                    {currentCategory.nominees?.length || 0} Indicados Oficiais
                  </span>
                  {currentCategory.sponsor && (
                    <span className="text-[11px] font-mono text-amber-300/80">
                      Patrocínio: {currentCategory.sponsor}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Nominees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {currentCategory.nominees.map((nominee) => {
                const isSelected = ballotSelections[currentCategory.id] === nominee.id;

                return (
                  <motion.div
                    key={nominee.id}
                    layout
                    onClick={() => handleSelectNominee(currentCategory.id, nominee.id)}
                    className={`p-5 sm:p-6 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#181926] to-[#10111a] border-2 border-amber-400 shadow-xl shadow-amber-500/20'
                        : 'bg-[#0c0d14] border border-zinc-850 hover:border-amber-500/40 hover:bg-[#101118]'
                    }`}
                  >
                    {/* Selected Golden Ribbon Badge */}
                    {isSelected && (
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-yellow-300 text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-md flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>SELECIONADO</span>
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Avatar / Photo */}
                      <div className="relative shrink-0">
                        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-zinc-900 border transition-all ${
                          isSelected ? 'border-amber-400 shadow-lg shadow-amber-400/30 scale-105' : 'border-zinc-750 group-hover:border-amber-400/50'
                        }`}>
                          <img
                            src={nominee.avatarUrl}
                            alt={nominee.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {nominee.badge && (
                          <div className="absolute -bottom-1.5 -right-1.5 bg-amber-400 text-black text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase shadow">
                            {nominee.badge}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-200 transition-colors truncate">
                            {nominee.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                          <span className="text-amber-300">{nominee.handle}</span>
                          {nominee.pkxdId && (
                            <>
                              <span>•</span>
                              <span>{nominee.pkxdId}</span>
                            </>
                          )}
                        </div>

                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed pt-1">
                          {nominee.projectDescription || nominee.bio || nominee.projectTitle}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Section */}
                    <div className="mt-5 pt-4 border-t border-zinc-850 flex items-center justify-between gap-3">
                      {/* Detail Modal Trigger */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectNomineeDetail) {
                            onSelectNomineeDetail(nominee, currentCategory);
                          }
                        }}
                        className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Perfil</span>
                      </button>

                      {/* Main Select Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectNominee(currentCategory.id, nominee.id);
                        }}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-black shadow-md shadow-amber-400/25 scale-[1.03]'
                            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-750 hover:border-amber-400/50'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>SELECIONADO ✓</span>
                          </>
                        ) : (
                          <>
                            <Vote className="w-3.5 h-3.5 text-amber-400" />
                            <span>VOTAR</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Navigation & Continue Controls */}
            <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={handlePrevCategory}
                disabled={activeCategoryIndex === 0}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none border border-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>CATEGORIA ANTERIOR</span>
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="flex-1 sm:flex-none px-6 py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>REVISAR VOTOS ({answeredCount})</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextCategory}
                  className="flex-1 sm:flex-none px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <span>{activeCategoryIndex === totalCategories - 1 ? 'REVISAR CÉDULA' : 'CONTINUAR'}</span>
                  <ChevronRight className="w-4 h-4 text-black" />
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* ========================================================= */}
      {/* REVISAR VOTOS MODAL (Review & Confirm Ballot) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0e0f17] border-2 border-amber-500/40 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl shadow-black overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black font-cinzel text-white">
                    REVISÃO DA CÉDULA DE VOTAÇÃO
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Confira suas escolhas em cada categoria antes de enviar o voto oficial.
                  </p>
                </div>

                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Choices List */}
              <div className="p-6 overflow-y-auto space-y-3 flex-1">
                {categories.map((cat, idx) => {
                  const selectedNomineeId = ballotSelections[cat.id];
                  const chosenNominee = cat.nominees.find((n) => n.id === selectedNomineeId);

                  return (
                    <div
                      key={cat.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                        chosenNominee
                          ? 'bg-zinc-950/80 border-amber-500/30'
                          : 'bg-zinc-950/40 border-zinc-850'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-mono text-zinc-500 uppercase">
                          {idx + 1}. {cat.title}
                        </div>

                        {chosenNominee ? (
                          <div className="flex items-center gap-2.5 mt-1">
                            <img
                              src={chosenNominee.avatarUrl}
                              alt={chosenNominee.name}
                              className="w-7 h-7 rounded-lg object-cover border border-amber-400/50 shrink-0"
                            />
                            <div className="truncate">
                              <span className="text-sm font-bold text-white block truncate">
                                {chosenNominee.name}
                              </span>
                              <span className="text-[10px] text-amber-300 font-mono">
                                {chosenNominee.handle}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs italic text-zinc-500 mt-1 block">
                            Nenhum indicado selecionado nesta categoria (opcional)
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveCategoryIndex(idx);
                          setIsReviewModalOpen(false);
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer shrink-0"
                      >
                        {chosenNominee ? 'Alterar' : 'Escolher'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer / Confirm Actions */}
              <div className="p-6 border-t border-zinc-800 bg-zinc-950/90 space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>
                    Total escolhido: <strong className="text-white">{answeredCount}</strong> de {totalCategories}
                  </span>
                  <button
                    type="button"
                    onClick={handleResetBallot}
                    className="text-red-400 hover:text-red-300 text-xs font-mono cursor-pointer"
                  >
                    Limpar Escolhas
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmBallot}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-black" />
                  <span>CONFIRMAR VOTAÇÃO OFICIAL</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
