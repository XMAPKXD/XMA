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
  Layers,
  Repeat,
  Youtube,
  Play,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerGoldenConfetti, triggerWinnerTrophyBlast } from '../utils/confetti';
import { playVoteChime, playFanfare } from '../utils/audio';
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
  const [clickComboCount, setClickComboCount] = useState<number>(0);
  const [comboTimer, setComboTimer] = useState<NodeJS.Timeout | null>(null);
  const [recentlyVotedNomineeId, setRecentlyVotedNomineeId] = useState<string | null>(null);
  const [playingMusicNomineeId, setPlayingMusicNomineeId] = useState<string | null>(null);

  const currentCategory = categories[activeCategoryIndex] || categories[0];
  const totalCategories = categories.length;

  const totalCategoryVotes = currentCategory
    ? currentCategory.nominees.reduce((sum, n) => sum + n.votes, 0)
    : 0;

  const sortedNominees = currentCategory
    ? [...currentCategory.nominees].sort((a, b) => b.votes - a.votes)
    : [];

  // Verified votes count
  const verifiedVotedCount = Object.keys(userAccount.verifiedVotes).length;
  const verifiedHasVotedCurrent = currentCategory ? Boolean(userAccount.verifiedVotes[currentCategory.id]) : false;
  const verifiedNomineeId = currentCategory ? userAccount.verifiedVotes[currentCategory.id] : null;

  // Handle Mass Vote Click (1 vote per click, unlimited)
  const handleMassVoteClick = (nomineeId: string) => {
    if (!currentCategory || currentCategory.status !== 'voting_open') return;

    onMassVote(currentCategory.id, nomineeId, 1);
    playVoteChime();
    triggerGoldenConfetti();

    // Combo streak tracking (number of clicks)
    setClickComboCount((prev) => prev + 1);
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
      {/* Hero Voting Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#171822] via-[#241f14] to-[#12131b] border-2 border-amber-500/50 p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 border border-amber-400/50 text-amber-300">
                <Vote className="w-3.5 h-3.5" />
                <span>Urna Oficial Metálica XMA 2026</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-cinzel">
                Centro de <span className="text-gold-metallic">Votação Oficial</span>
              </h1>
              <p className="text-zinc-300 text-sm sm:text-base">
                Escolha o seu modo favorito: faça <strong>Votos em Massa</strong> para mutirões ilimitados de fã-clubes ou use seu <strong>Voto Único Verificado</strong> com sua conta PK XD!
              </p>
            </div>

            {/* Voting Mode Switcher Card */}
            <div className="p-4 rounded-2xl bg-[#0f1017] border border-amber-500/40 shadow-xl space-y-3 min-w-[280px]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block text-center">
                Selecione a Modalidade de Voto
              </span>

              <div className="grid grid-cols-2 gap-2 bg-black/60 p-1 rounded-xl border border-zinc-800">
                <button
                  id="tab-mode-mass-btn"
                  onClick={() => setVotingMode('mass')}
                  className={`py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    votingMode === 'mass'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Voto em Massa</span>
                </button>

                <button
                  id="tab-mode-verified-btn"
                  onClick={() => setVotingMode('verified')}
                  className={`py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    votingMode === 'verified'
                      ? 'bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 text-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Voto com Login</span>
                </button>
              </div>

              {/* Status info based on mode */}
              <div className="text-[11px] text-center pt-1 text-zinc-400">
                {votingMode === 'mass' ? (
                  <span className="text-amber-300 font-semibold flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3" /> Votos Ilimitados • Clique quantas vezes quiser!
                  </span>
                ) : userAccount.isLoggedIn ? (
                  <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                    <UserCheck className="w-3 h-3" /> Conectado como {userAccount.nickname} ({verifiedVotedCount}/{totalCategories} votos)
                  </span>
                ) : (
                  <button
                    onClick={onOpenLoginModal}
                    className="text-amber-400 hover:underline font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer"
                  >
                    <LogIn className="w-3 h-3" /> Fazer Login PK XD (1 Voto Único)
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mass Voting Banner (Only in Mass Mode) */}
          {votingMode === 'mass' && (
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Modo Voto em Massa (Ilimitado): Clique 1 vez para somar +1 voto a cada clique!</span>
              </div>

              {clickComboCount > 0 && (
                <div className="text-xs font-extrabold text-amber-300 font-mono bg-black/60 px-3 py-1 rounded-xl border border-amber-500/40 animate-bounce">
                  ⚡ COMBO: {clickComboCount.toLocaleString('pt-BR')} VOTOS ENVIADOS!
                </div>
              )}
            </div>
          )}

          {/* Verified Mode Banner (Only in Verified Mode) */}
          {votingMode === 'verified' && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#1c1a14] border border-amber-400/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400 flex items-center justify-center text-amber-300 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Voto Oficial com Login (1 Voto Único por Categoria)
                  </div>
                  <div className="text-xs text-zinc-300">
                    {userAccount.isLoggedIn
                      ? `Conectado com a conta ${userAccount.nickname} ${userAccount.pkxdTag}. Seu voto tem peso de auditoria oficial!`
                      : 'Faça login com seu Nickname PK XD para registrar seu voto único com selo dourado!'}
                  </div>
                </div>
              </div>

              {!userAccount.isLoggedIn && (
                <button
                  onClick={onOpenLoginModal}
                  className="px-4 py-2 rounded-xl bg-gold-metallic-btn text-black font-extrabold text-xs uppercase whitespace-nowrap cursor-pointer"
                >
                  Conectar Conta PK XD
                </button>
              )}
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2">
            {categories.map((cat, idx) => {
              const isVotedVerified = Boolean(userAccount.verifiedVotes[cat.id]);
              const isActive = idx === activeCategoryIndex;

              return (
                <button
                  key={cat.id}
                  id={`voting-cat-tab-${cat.id}`}
                  onClick={() => setActiveCategoryIndex(idx)}
                  className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-black border-amber-300 shadow-lg shadow-amber-500/20 scale-105'
                      : 'bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800 border-zinc-800'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isActive ? 'bg-black text-amber-300 font-extrabold' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <span>{cat.title}</span>
                  {votingMode === 'verified' && isVotedVerified && (
                    <CheckCircle2 className={`w-4 h-4 ${isActive ? 'text-black' : 'text-emerald-400'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Ballot Content */}
      {currentCategory && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Columns: Nominees Ballot */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-[#14151e] border border-amber-500/20">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Categoria {activeCategoryIndex + 1} de {totalCategories}
                  </span>
                  {currentCategory.status === 'winner_revealed' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-black">
                      Vencedor Oficial Apurado
                    </span>
                  ) : currentCategory.status === 'voting_open' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Urnas Abertas
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Apresentação dos Indicados
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-extrabold text-white font-cinzel">
                  {currentCategory.title}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {currentCategory.subtitle}
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs text-zinc-400">
                  {currentCategory.status === 'voting_open' ? 'Total de votos computados' : 'Status da Disputa'}
                </div>
                <div className="text-xl font-extrabold text-amber-300 font-mono">
                  {currentCategory.status === 'voting_open'
                    ? totalCategoryVotes.toLocaleString('pt-BR')
                    : 'Apresentação Oficial'}
                </div>
              </div>
            </div>

            {/* Voting Closed / Showcase Alert */}
            {currentCategory.status !== 'voting_open' && currentCategory.status !== 'winner_revealed' && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent border border-amber-400/40 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-amber-300">
                    Fase de Conhecer os Indicados Oficiais
                  </div>
                  <div className="text-zinc-300">
                    As urnas desta categoria estão no momento em modo de exibição. Conheça cada criador e obra abaixo antes da abertura oficial dos votos!
                  </div>
                </div>
              </div>
            )}

            {/* Nominees Cards */}
            <div className="space-y-4">
              {currentCategory.nominees.length === 0 ? (
                <div className="p-8 rounded-3xl bg-[#14151e] border border-zinc-800 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-center mx-auto text-amber-400">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white font-cinzel">Nenhum indicado cadastrado nesta categoria ainda</h3>
                    <p className="text-xs text-zinc-400 max-w-md mx-auto">
                      O Administrador pode cadastrar os indicados oficiais no Painel de Controle dos Admins.
                    </p>
                  </div>
                  {onSwitchToAdmin && (
                    <div>
                      <button
                        onClick={onSwitchToAdmin}
                        className="px-5 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/50 text-amber-300 font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>Cadastrar Indicados no Painel Admin</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                currentCategory.nominees.map((nominee) => {
                const isVerifiedVoted = userAccount.verifiedVotes[currentCategory.id] === nominee.id;
                const isWinner =
                  currentCategory.status === 'winner_revealed' &&
                  currentCategory.winnerNomineeId === nominee.id;
                const isLeader = sortedNominees[0]?.id === nominee.id;
                const percentage =
                  totalCategoryVotes > 0
                    ? Math.round((nominee.votes / totalCategoryVotes) * 100)
                    : 0;

                const isThumbCat = isThumbnailCategory(currentCategory);
                const isMusCat = isMusicCategory(currentCategory);
                const nomineeThumb = getNomineeThumbnailUrl(nominee);
                const displayThumb = isThumbCat ? (nomineeThumb || nominee.avatarUrl) : nomineeThumb;
                const youtubeUrl = getNomineeYouTubeUrl(nominee);
                const embedUrl = getYouTubeEmbedUrl(youtubeUrl);
                const isPlayingThisMusic = playingMusicNomineeId === nominee.id;

                return (
                  <motion.div
                    key={nominee.id}
                    layout
                    className={`relative rounded-2xl p-4 sm:p-5 transition-all duration-300 border ${
                      isVerifiedVoted && votingMode === 'verified'
                        ? 'gold-card border-amber-400/90 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                        : isWinner
                        ? 'bg-[#1a1710] border-amber-400 shadow-lg'
                        : 'bg-[#13141c] border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    {/* Media Preview if Thumbnail category or has Thumbnail */}
                    {displayThumb && !isPlayingThisMusic && (
                      <div className="mb-4 rounded-xl overflow-hidden border border-amber-500/30 bg-black aspect-video relative max-h-56">
                        <img
                          src={displayThumb}
                          alt={`Thumbnail de ${nominee.name}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/80 border border-amber-400/50 text-amber-300 flex items-center gap-1">
                            <ImageIcon className="w-3 h-3 text-amber-400" />
                            Thumbnail Concorrente (16:9)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* YouTube Inline Player if playing */}
                    {isPlayingThisMusic && embedUrl && (
                      <div className="mb-4 rounded-xl overflow-hidden border border-red-500/50 bg-black aspect-video relative max-h-60">
                        <iframe
                          src={`${embedUrl}?autoplay=1`}
                          title={`Música de ${nominee.name}`}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                        <button
                          onClick={() => setPlayingMusicNomineeId(null)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 hover:bg-zinc-800 text-white cursor-pointer z-20"
                          title="Fechar Música"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Nominee Profile */}
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <img
                            src={nominee.avatarUrl}
                            alt={nominee.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500/40 bg-zinc-900"
                          />
                          {isWinner && (
                            <div className="absolute -top-2 -right-2 bg-amber-400 text-black p-1 rounded-full shadow-md">
                              <Trophy className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {isVerifiedVoted && (
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-md border-2 border-black" title="Seu Voto Oficial Verificado">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base sm:text-lg font-bold text-white font-cinzel">
                              {nominee.name}
                            </h3>
                            {nominee.pkxdId && !nominee.pkxdId.startsWith('@') && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-black/60 border border-zinc-700 text-zinc-300">
                                ID: {nominee.pkxdId}
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
                              <span className="text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                                {nominee.handle}
                              </span>
                            )}
                            {nominee.projectTitle && (
                              <span className="text-zinc-300">{nominee.projectTitle}</span>
                            )}
                          </div>

                          {/* Quick Music Player button if nominee has YouTube link */}
                          {embedUrl && (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => setPlayingMusicNomineeId(isPlayingThisMusic ? null : nominee.id)}
                                className="py-1 px-3 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Youtube className="w-3.5 h-3.5 text-red-400" />
                                <Play className="w-3 h-3 fill-current" />
                                <span>{isPlayingThisMusic ? 'Parar Música' : '🎵 Tocar Música no YouTube'}</span>
                              </button>
                            </div>
                          )}

                          <button
                            onClick={() => onSelectNominee(nominee, currentCategory)}
                            className="text-[11px] text-zinc-400 hover:text-amber-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer pt-0.5"
                          >
                            <Info className="w-3 h-3" />
                            <span>Ver detalhes completos</span>
                          </button>
                        </div>
                      </div>

                      {/* Vote Buttons & Controls */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                        <div className="text-left sm:text-right">
                          <div className="text-xs text-zinc-400">
                            {currentCategory.status === 'voting_open' ? 'Total de votos' : 'Status'}
                          </div>
                          <div className="text-base font-extrabold text-amber-300 font-mono">
                            {currentCategory.status === 'voting_open' 
                              ? `${nominee.votes.toLocaleString('pt-BR')} (${percentage}%)`
                              : 'Indicado Oficial'}
                          </div>
                        </div>

                        {currentCategory.status === 'voting_open' ? (
                          votingMode === 'mass' ? (
                            /* Mass Vote Button (1 vote per click, unlimited) */
                            <button
                              id={`mass-vote-btn-${nominee.id}`}
                              onClick={() => handleMassVoteClick(nominee.id)}
                              className="px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-gold-metallic-btn text-black flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 transition-transform hover:scale-105"
                            >
                              <Flame className="w-4 h-4" />
                              <span>Votar (+1 Voto)</span>
                            </button>
                          ) : (
                            /* Verified Single Vote (1 Voto por Conta PK XD) */
                            <button
                              id={`verified-vote-btn-${nominee.id}`}
                              onClick={() => handleVerifiedVoteClick(nominee.id)}
                              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold tracking-wider uppercase flex items-center gap-2 cursor-pointer transition-all ${
                                isVerifiedVoted
                                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400'
                                  : 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-black shadow-md'
                              }`}
                            >
                              {isVerifiedVoted ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Voto Oficial Registrado</span>
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="w-4 h-4" />
                                  <span>Voto Único Oficial</span>
                                </>
                              )}
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => onSelectNominee(nominee, currentCategory)}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-amber-300 hover:text-amber-200 border border-amber-500/40 hover:border-amber-400 flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                          >
                            <Info className="w-3.5 h-3.5 text-amber-400" />
                            <span>Conhecer Obra</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Live Progress Bar or Showcase Pill */}
                    {currentCategory.status === 'voting_open' ? (
                      <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-1.5">
                        <div className="w-full h-2.5 bg-zinc-800/90 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className={`h-full rounded-full ${
                              isVerifiedVoted
                                ? 'bg-gradient-to-r from-emerald-400 via-amber-300 to-amber-500 shadow-md'
                                : isLeader
                                ? 'bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500'
                                : 'bg-gradient-to-r from-slate-400 to-slate-600'
                            }`}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                        <span className="text-amber-400/90 font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          Indicado Oficial ao Troféu XMA
                        </span>
                        <span className="text-zinc-500">Urnas fecham para apuração / abrirão no evento</span>
                      </div>
                    )}

                    {/* Celebration Banner */}
                    <AnimatePresence>
                      {recentlyVotedNomineeId === nominee.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-bold flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                            {votingMode === 'mass'
                              ? '+1 voto computado no multiverso!'
                              : 'Voto oficial único autenticado com sucesso!'}
                          </span>
                          <span className="text-[11px] uppercase tracking-wider text-emerald-200">
                            {votingMode === 'mass' ? '+1 VOTO COMPUTADO' : 'VOTO VERIFICADO'}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              }))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
              <button
                disabled={activeCategoryIndex === 0}
                onClick={() => setActiveCategoryIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                ← Categoria Anterior
              </button>

              <div className="text-xs text-zinc-400 font-semibold">
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

          {/* Right Column: Live Analytics & Rules */}
          <div className="space-y-6">
            {/* Live Leaderboard */}
            <div className="p-6 rounded-3xl bg-[#14151e] border border-amber-500/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2 text-sm font-bold text-white font-cinzel">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>Ranking ao Vivo</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="space-y-3">
                {sortedNominees.map((n, i) => {
                  const pct = totalCategoryVotes > 0 ? Math.round((n.votes / totalCategoryVotes) * 100) : 0;
                  return (
                    <div
                      key={n.id}
                      className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          i === 0 ? 'bg-amber-400 text-black font-extrabold' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {i + 1}
                        </span>
                        <span className="font-semibold text-zinc-200 truncate max-w-[120px]">
                          {n.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-zinc-400">{n.votes.toLocaleString('pt-BR')}</span>
                        <span className="font-bold text-amber-300">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Voting Guide Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#121319] to-[#181922] border border-zinc-800 space-y-4 text-xs text-zinc-400">
              <div className="flex items-center gap-2 font-bold text-zinc-200 uppercase tracking-wider text-[11px]">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Regulamento das Duas Modalidades</span>
              </div>
              <div className="space-y-3 text-zinc-300/90 leading-relaxed">
                <div>
                  <strong className="text-amber-400">🔥 Voto em Massa (Ilimitado):</strong> Mutirões de torcidas e fã-clubes. Vota quantas vezes quiser e use os multiplicadores (+5, +10, +50, +100).
                </div>
                <div>
                  <strong className="text-amber-300">⭐ Voto com Login Oficial (1 Voto):</strong> Registra o seu voto único oficial autenticado pela conta do PK XD, com selo de verificação no sistema.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
