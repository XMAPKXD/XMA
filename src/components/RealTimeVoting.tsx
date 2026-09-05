import React, { useState } from 'react';
import { Category, Nominee, PKXDUserAccount } from '../types';
import { 
  Trophy, 
  Vote, 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  Info, 
  Crown, 
  ShieldCheck, 
  Zap, 
  UserCheck, 
  LogIn,
  Youtube,
  Play,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Medal,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerGoldenConfetti, triggerWinnerTrophyBlast } from '../utils/confetti';
import { playVoteChime } from '../utils/audio';
import { getYouTubeEmbedUrl, getNomineeYouTubeUrl, getNomineeThumbnailUrl, isMusicCategory, isThumbnailCategory } from '../utils/media';

interface RealTimeVotingProps {
  categories: Category[];
  userVotes: Record<string, string>; // categoryId -> nomineeId for standard/last vote
  userAccount: PKXDUserAccount;
  onMassVote: (categoryId: string, nomineeId: string, quantity: number) => void;
  onVerifiedSingleVote: (categoryId: string, nomineeId: string) => void;
  onSelectNominee: (nominee: Nominee, category: Category) => void;
  onOpenLoginModal: () => void;
  onSwitchToAdmin?: () => void;
}

export const RealTimeVoting: React.FC<RealTimeVotingProps> = ({
  categories,
  userVotes,
  userAccount,
  onMassVote,
  onVerifiedSingleVote,
  onSelectNominee,
  onOpenLoginModal,
  onSwitchToAdmin
}) => {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(0);
  const [votingMode, setVotingMode] = useState<'mass' | 'verified'>('mass');
  const [massVoteMultiplier, setMassVoteMultiplier] = useState<number>(1);
  const [clickComboCount, setClickComboCount] = useState<number>(0);
  const [comboTimer, setComboTimer] = useState<NodeJS.Timeout | null>(null);
  const [recentlyVotedNomineeId, setRecentlyVotedNomineeId] = useState<string | null>(null);
  const [theaterMedia, setTheaterMedia] = useState<{
    title: string;
    embedUrl: string;
    nomineeName: string;
  } | null>(null);

  const currentCategory = categories[activeCategoryIndex] || categories[0];
  const totalCategories = categories.length;

  const totalCategoryVotes = currentCategory
    ? currentCategory.nominees.reduce((sum, n) => sum + n.votes, 0)
    : 0;

  const sortedNominees = currentCategory
    ? [...currentCategory.nominees].sort((a, b) => b.votes - a.votes)
    : [];

  // Verified votes count
  const verifiedVotedCount = Object.keys(userAccount.verifiedVotes || {}).length;
  const verifiedHasVotedCurrent = currentCategory ? Boolean(userAccount.verifiedVotes?.[currentCategory.id]) : false;
  const verifiedNomineeId = currentCategory ? userAccount.verifiedVotes?.[currentCategory.id] : null;

  // Handle Mass Vote Click
  const handleMassVoteClick = (nomineeId: string) => {
    if (!currentCategory || currentCategory.status !== 'voting_open') return;

    onMassVote(currentCategory.id, nomineeId, massVoteMultiplier);
    playVoteChime();
    triggerGoldenConfetti();

    // Combo streak tracking
    setClickComboCount((prev) => prev + massVoteMultiplier);
    if (comboTimer) clearTimeout(comboTimer);
    const newTimer = setTimeout(() => {
      setClickComboCount(0);
    }, 2500);
    setComboTimer(newTimer);

    setRecentlyVotedNomineeId(nomineeId);
    setTimeout(() => setRecentlyVotedNomineeId(null), 2500);
  };

  // Handle Verified Single Vote
  const handleVerifiedVoteClick = (nomineeId: string) => {
    if (!currentCategory || currentCategory.status !== 'voting_open') return;

    if (!userAccount.isLoggedIn) {
      onOpenLoginModal();
      return;
    }

    onVerifiedSingleVote(currentCategory.id, nomineeId);
    playVoteChime();
    triggerWinnerTrophyBlast();
    setRecentlyVotedNomineeId(nomineeId);
    setTimeout(() => setRecentlyVotedNomineeId(null), 3000);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Prestige Voting Hall Header */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#13141d] via-[#1b1710] to-[#0a0a0e] border border-amber-500/30 p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 border border-amber-400/50 text-amber-300 font-mono shadow-sm">
              <Vote className="w-3.5 h-3.5 text-amber-400" />
              <span>Urna Oficial Metálica • XMA 2026</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-cinzel">
              Centro de <span className="text-gold-metallic">Votação Oficial</span>
            </h1>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              Participe dos mutirões com o <strong className="text-amber-300">Voto em Massa</strong> ou registre o seu <strong className="text-amber-300">Voto Único Verificado</strong> conectado à sua conta de jogador!
            </p>
          </div>

          {/* Voting Mode Switcher Capsule */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0e0f16]/95 border border-amber-500/30 shadow-2xl space-y-3 min-w-[300px] backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                Modalidade de Voto
              </span>
              {clickComboCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs font-mono animate-bounce border border-amber-400/40">
                  🔥 Combo x{clickComboCount}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5 bg-black/60 p-1 rounded-xl border border-zinc-800">
              <button
                id="tab-mode-mass-btn"
                onClick={() => setVotingMode('mass')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  votingMode === 'mass'
                    ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black shadow-md font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Modo Torcida</span>
              </button>

              <button
                id="tab-mode-verified-btn"
                onClick={() => setVotingMode('verified')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  votingMode === 'verified'
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-md font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Voto com Login</span>
              </button>
            </div>

            {/* Quick Helper Subtext */}
            <div className="text-[11px] text-zinc-400 leading-tight">
              {votingMode === 'mass' ? (
                <div className="flex items-center justify-between text-amber-300/90 font-medium">
                  <span>⚡ Cliques ilimitados para mutirões</span>
                  <span className="text-[10px] uppercase font-bold text-amber-400">Torcida Ativa</span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-emerald-300 font-medium">
                  <span>🛡️ 1 Voto oficial por categoria</span>
                  <span className="text-[10px] uppercase font-bold">
                    {verifiedVotedCount}/{totalCategories} Votos
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mass Vote Multipliers (when Mass Mode is active) */}
        {votingMode === 'mass' && (
          <div className="mt-6 pt-5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Multiplicador de Votos por Clique:</span>
            </div>

            <div className="flex items-center gap-1.5">
              {[1, 5, 10, 25, 50, 100].map((multiplier) => (
                <button
                  key={multiplier}
                  onClick={() => setMassVoteMultiplier(multiplier)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold font-mono transition-all cursor-pointer ${
                    massVoteMultiplier === multiplier
                      ? 'bg-amber-400 text-black shadow-md shadow-amber-500/30 scale-105'
                      : 'bg-zinc-900/90 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                  }`}
                >
                  +{multiplier}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Categories Horizontal Carousel Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
              Selecione a Categoria
            </span>
            <span className="text-xs text-zinc-400">
              ({activeCategoryIndex + 1} de {totalCategories})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveCategoryIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeCategoryIndex === 0}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveCategoryIndex((prev) => Math.min(totalCategories - 1, prev + 1))}
              disabled={activeCategoryIndex === totalCategories - 1}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat, index) => {
            const isActive = index === activeCategoryIndex;
            const hasVerified = Boolean(userAccount.verifiedVotes?.[cat.id]);

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryIndex(index)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black border-amber-300 shadow-lg shadow-amber-500/20 scale-[1.02] font-black'
                    : 'bg-[#0f1017] text-zinc-300 hover:text-white hover:bg-zinc-900 border-zinc-800'
                }`}
              >
                <span>{cat.title}</span>
                {cat.status === 'winner_revealed' ? (
                  <Trophy className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-amber-400'}`} />
                ) : hasVerified ? (
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-950' : 'text-emerald-400'}`} />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Ballot Area & Live Sidebar */}
      {!currentCategory ? (
        <div className="p-12 text-center text-zinc-400">Nenhuma categoria encontrada.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Ballot Cards (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Header Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0f1017] border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
                    Urna Ativa
                  </span>
                  {currentCategory.status === 'voting_open' ? (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Votação em Andamento
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      Modo Exibição
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-cinzel">
                  {currentCategory.title}
                </h2>
                {currentCategory.subtitle && (
                  <p className="text-xs text-zinc-400">{currentCategory.subtitle}</p>
                )}
              </div>

              <div className="text-left sm:text-right bg-black/40 p-3 rounded-xl border border-zinc-800 sm:border-0 sm:bg-transparent sm:p-0">
                <div className="text-[11px] text-zinc-400 font-mono">Total Apurado</div>
                <div className="text-xl font-black text-amber-300 font-mono">
                  {currentCategory.status === 'voting_open'
                    ? `${totalCategoryVotes.toLocaleString('pt-BR')} votos`
                    : 'Apresentação'}
                </div>
              </div>
            </div>

            {/* Voting Closed Info Notice */}
            {currentCategory.status !== 'voting_open' && currentCategory.status !== 'winner_revealed' && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs space-y-0.5 text-zinc-300">
                  <div className="font-bold text-amber-300">
                    Apresentação Oficial de Concorrentes
                  </div>
                  <div>
                    Esta categoria está no momento em fase de exibição dos indicados antes da abertura oficial das urnas.
                  </div>
                </div>
              </div>
            )}

            {/* Nominees Ballot Cards */}
            <div className="space-y-4">
              {currentCategory.nominees.length === 0 ? (
                <div className="p-10 rounded-3xl bg-[#0f1017] border border-zinc-800 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-center mx-auto text-amber-400">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white font-cinzel">Nenhum indicado nesta categoria</h3>
                    <p className="text-xs text-zinc-400">
                      O Administrador pode cadastrar novos indicados diretamente no Painel Admin.
                    </p>
                  </div>
                  {onSwitchToAdmin && (
                    <button
                      onClick={onSwitchToAdmin}
                      className="px-4 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/50 text-amber-300 font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>Cadastrar Indicados</span>
                    </button>
                  )}
                </div>
              ) : (
                currentCategory.nominees.map((nominee) => {
                  const isVerifiedVoted = userAccount.verifiedVotes?.[currentCategory.id] === nominee.id;
                  const isWinner =
                    currentCategory.status === 'winner_revealed' &&
                    currentCategory.winnerNomineeId === nominee.id;
                  const isLeader = sortedNominees[0]?.id === nominee.id && totalCategoryVotes > 0;
                  const percentage =
                    totalCategoryVotes > 0
                      ? Math.round((nominee.votes / totalCategoryVotes) * 100)
                      : 0;

                  const isThumbCat = isThumbnailCategory(currentCategory);
                  const nomineeThumb = getNomineeThumbnailUrl(nominee);
                  const displayThumb = isThumbCat ? (nomineeThumb || nominee.avatarUrl) : nomineeThumb;
                  const youtubeUrl = getNomineeYouTubeUrl(nominee);
                  const embedUrl = getYouTubeEmbedUrl(youtubeUrl);

                  return (
                    <motion.div
                      key={nominee.id}
                      layout
                      className={`relative rounded-2xl p-4 sm:p-5 transition-all duration-300 border bg-[#0e0f17] ${
                        isVerifiedVoted && votingMode === 'verified'
                          ? 'border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400'
                          : isWinner
                          ? 'gold-card border-amber-400 shadow-xl'
                          : isLeader
                          ? 'border-amber-500/40 hover:border-amber-400/70 shadow-md'
                          : 'border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Profile Info */}
                        <div className="flex items-center gap-4">
                          <div className="relative shrink-0">
                            <img
                              src={displayThumb || nominee.avatarUrl}
                              alt={nominee.name}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-amber-500/30 bg-zinc-900"
                            />
                            {isWinner && (
                              <div className="absolute -top-2 -right-2 bg-amber-400 text-black p-1 rounded-full shadow-md">
                                <Trophy className="w-3.5 h-3.5" />
                              </div>
                            )}
                            {isVerifiedVoted && (
                              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-md border-2 border-black" title="Seu Voto Oficial">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base sm:text-lg font-bold text-white font-cinzel truncate">
                                {nominee.name}
                              </h3>
                              {nominee.pkxdId && !nominee.pkxdId.startsWith('@') && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/60 border border-zinc-700 text-zinc-300">
                                  {nominee.pkxdId}
                                </span>
                              )}
                              {isLeader && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  👑 1º Lugar
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              {nominee.handle && (
                                <span className="text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                                  {nominee.handle}
                                </span>
                              )}
                              {nominee.projectTitle && (
                                <span className="text-zinc-300 truncate max-w-[200px]">{nominee.projectTitle}</span>
                              )}
                            </div>

                            {/* YouTube player trigger */}
                            {embedUrl && (
                              <button
                                type="button"
                                onClick={() => setTheaterMedia({
                                  title: nominee.projectTitle || nominee.name,
                                  embedUrl,
                                  nomineeName: nominee.name
                                })}
                                className="py-1 px-2.5 rounded-lg bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-300 text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Youtube className="w-3.5 h-3.5 text-red-400" />
                                <Play className="w-3 h-3 fill-current" />
                                <span>Ver Obra / Clipe</span>
                              </button>
                            )}

                            <div>
                              <button
                                onClick={() => onSelectNominee(nominee, currentCategory)}
                                className="text-[11px] text-zinc-400 hover:text-amber-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                              >
                                <Info className="w-3 h-3" />
                                <span>Ver detalhes completos</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Vote Controls & Count */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                          <div className="text-left sm:text-right">
                            <div className="text-[11px] text-zinc-400">
                              {currentCategory.status === 'voting_open' ? 'Total Apurado' : 'Status'}
                            </div>
                            <div className="text-base font-black text-amber-300 font-mono">
                              {currentCategory.status === 'voting_open'
                                ? `${nominee.votes.toLocaleString('pt-BR')} (${percentage}%)`
                                : 'Concorrente'}
                            </div>
                          </div>

                          {currentCategory.status === 'voting_open' ? (
                            votingMode === 'mass' ? (
                              <button
                                id={`mass-vote-btn-${nominee.id}`}
                                onClick={() => handleMassVoteClick(nominee.id)}
                                className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gold-metallic-btn text-black flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20 active:scale-90 hover:scale-105 transition-all"
                              >
                                <Flame className="w-4 h-4" />
                                <span>Votar (+{massVoteMultiplier})</span>
                              </button>
                            ) : (
                              <button
                                id={`verified-vote-btn-${nominee.id}`}
                                onClick={() => handleVerifiedVoteClick(nominee.id)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase flex items-center gap-2 cursor-pointer transition-all ${
                                  isVerifiedVoted
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                    : 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-black shadow-md hover:scale-105'
                                }`}
                              >
                                {isVerifiedVoted ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Voto Registrado</span>
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>Voto Único</span>
                                  </>
                                )}
                              </button>
                            )
                          ) : (
                            <button
                              onClick={() => onSelectNominee(nominee, currentCategory)}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Info className="w-3.5 h-3.5 text-amber-400" />
                              <span>Conhecer Obra</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {currentCategory.status === 'voting_open' && (
                        <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-1.5">
                          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5, ease: 'easeOut' }}
                              className={`h-full rounded-full ${
                                isVerifiedVoted
                                  ? 'bg-gradient-to-r from-emerald-400 via-amber-300 to-amber-500'
                                  : isLeader
                                  ? 'bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500'
                                  : 'bg-gradient-to-r from-slate-400 to-slate-600'
                              }`}
                            />
                          </div>
                        </div>
                      )}

                      {/* Celebration Pill Banner */}
                      <AnimatePresence>
                        {recentlyVotedNomineeId === nominee.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-bold flex items-center justify-between"
                          >
                            <span className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                              {votingMode === 'mass'
                                ? `+${massVoteMultiplier} voto(s) computado(s) com sucesso!`
                                : 'Voto único oficial registrado e autenticado!'}
                            </span>
                            <span className="text-[10px] uppercase font-mono font-black text-emerald-200">
                              {votingMode === 'mass' ? `+${massVoteMultiplier} VOTO` : 'AUTENTICADO'}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Pagination Navigation */}
            <div className="flex items-center justify-between pt-4">
              <button
                disabled={activeCategoryIndex === 0}
                onClick={() => setActiveCategoryIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                ← Categoria Anterior
              </button>

              <div className="text-xs text-zinc-400 font-mono font-semibold">
                {activeCategoryIndex + 1} / {totalCategories}
              </div>

              <button
                disabled={activeCategoryIndex === totalCategories - 1}
                onClick={() => setActiveCategoryIndex((prev) => Math.min(totalCategories - 1, prev + 1))}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gold-metallic-btn text-black disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Próxima Categoria →
              </button>
            </div>
          </div>

          {/* Right Column: Live Podium & Rules */}
          <div className="space-y-6">
            {/* Live Podium Leaderboard */}
            <div className="p-6 rounded-3xl bg-[#0f1017] border border-amber-500/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2 text-sm font-bold text-white font-cinzel">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>Ranking da Categoria</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Ao Vivo</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {sortedNominees.map((n, i) => {
                  const pct = totalCategoryVotes > 0 ? Math.round((n.votes / totalCategoryVotes) * 100) : 0;
                  return (
                    <div
                      key={n.id}
                      className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 ${
                          i === 0
                            ? 'bg-amber-400 text-black'
                            : i === 1
                            ? 'bg-slate-300 text-black'
                            : i === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {i + 1}
                        </span>
                        <span className="font-semibold text-zinc-200 truncate max-w-[130px]">
                          {n.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 font-mono shrink-0">
                        <span className="text-zinc-400">{n.votes.toLocaleString('pt-BR')}</span>
                        <span className="font-bold text-amber-300">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Voting Rules Card */}
            <div className="p-6 rounded-3xl bg-[#0e0f16] border border-zinc-800 space-y-4 text-xs text-zinc-400">
              <div className="flex items-center gap-2 font-bold text-zinc-200 uppercase tracking-wider text-[11px] font-mono">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Regras de Apuração</span>
              </div>
              <div className="space-y-3 leading-relaxed">
                <div>
                  <strong className="text-amber-400">🔥 Modo Torcida (Voto em Massa):</strong> Projetado para fã-clubes realizarem mutirões sem limites. Você pode usar multiplicadores (+1 até +100).
                </div>
                <div>
                  <strong className="text-emerald-400">🛡️ Voto com Login Oficial:</strong> Conta 1 voto verificado e autêntico por jogador na categoria, garantindo representatividade justa da comunidade.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theater Media Player Modal */}
      <AnimatePresence>
        {theaterMedia && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTheaterMedia(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-[#11121a] rounded-3xl overflow-hidden border border-amber-500/40 shadow-2xl z-10 space-y-3"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-[#151622]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                    <Youtube className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-white truncate max-w-md font-cinzel">
                      {theaterMedia.title}
                    </h4>
                    <p className="text-xs text-amber-400">
                      Obra indicada de {theaterMedia.nomineeName}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setTheaterMedia(null)}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 transition-colors cursor-pointer"
                  title="Fechar Player"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 16:9 Video Player */}
              <div className="relative aspect-video bg-black w-full">
                <iframe
                  src={`${theaterMedia.embedUrl}?autoplay=1`}
                  title={theaterMedia.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Modal Footer */}
              <div className="p-4 flex items-center justify-between text-xs text-zinc-400 bg-[#0d0e14]">
                <span>Transmissão Oficial • YouTube Player XMA</span>
                <button
                  onClick={() => setTheaterMedia(null)}
                  className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
