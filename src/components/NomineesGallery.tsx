import React, { useState, useMemo } from 'react';
import { Category, Nominee } from '../types';
import { 
  Trophy, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  Crown, 
  Film, 
  Music, 
  Star, 
  Youtube, 
  Play, 
  Image as ImageIcon, 
  X,
  Vote,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getYouTubeEmbedUrl, getNomineeYouTubeUrl, getNomineeThumbnailUrl, isMusicCategory, isThumbnailCategory } from '../utils/media';

interface NomineesGalleryProps {
  categories: Category[];
  userVotes: Record<string, string>; // categoryId -> nomineeId
  onVote: (categoryId: string, nomineeId: string) => void;
  onSelectNominee: (nominee: Nominee, category: Category) => void;
  onSwitchToCeremony: () => void;
  onSwitchToAdmin?: () => void;
}

export const NomineesGallery: React.FC<NomineesGalleryProps> = ({
  categories,
  userVotes,
  onVote,
  onSelectNominee,
  onSwitchToCeremony,
  onSwitchToAdmin
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Dedicated Theater Player Modal (keeps cards pristine and avoids layout jumping)
  const [theaterMedia, setTheaterMedia] = useState<{
    title: string;
    embedUrl: string;
    nomineeName: string;
  } | null>(null);

  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => selectedCategoryId === 'all' || cat.id === selectedCategoryId)
      .map((cat) => {
        if (!searchQuery.trim()) return cat;
        const query = searchQuery.toLowerCase();
        const matchingNominees = cat.nominees.filter(
          (n) =>
            n.name.toLowerCase().includes(query) ||
            n.handle.toLowerCase().includes(query) ||
            n.pkxdId.toLowerCase().includes(query) ||
            n.projectTitle.toLowerCase().includes(query)
        );
        return {
          ...cat,
          nominees: matchingNominees
        };
      })
      .filter((cat) => (!searchQuery.trim() ? true : cat.nominees.length > 0));
  }, [categories, selectedCategoryId, searchQuery]);

  const totalNomineesCount = useMemo(() => {
    return categories.reduce((acc, cat) => acc + cat.nominees.length, 0);
  }, [categories]);

  return (
    <div className="space-y-10 pb-16">
      {/* Luxury Gala Pavilion Header */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#12131b] via-[#0d0e14] to-[#07080c] border border-amber-500/30 p-6 sm:p-10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-400/40 text-amber-300 font-mono shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Pavilhão Oficial de Indicados • XMA 2026</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-cinzel">
              Galeria dos <span className="text-gold-metallic">Astros & Produções</span>
            </h1>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              Conheça todos os criadores de conteúdo, hits musicais, vídeos e thumbnails que estão concorrendo aos cobiçados troféus dourados da premiação oficial PK XD.
            </p>
          </div>

          {/* Quick Stats & Ceremony Action */}
          <div className="bg-[#151622]/90 border border-amber-500/30 rounded-2xl p-5 shrink-0 max-w-sm space-y-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs uppercase font-bold text-amber-400 font-mono">Quadro Oficial</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold font-mono">
                {totalNomineesCount} Astros Indicados
              </span>
            </div>
            <div className="text-2xl font-black font-cinzel text-white">
              {categories.length} Categorias em Disputa
            </div>
            <button
              onClick={onSwitchToCeremony}
              className="w-full py-2.5 px-4 rounded-xl bg-gold-metallic-btn text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Trophy className="w-4 h-4" />
              <span>Ver Palco da Cerimônia</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter Ribbon & Instant Search */}
        <div className="mt-8 pt-6 border-t border-zinc-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Categories Horizontal Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                selectedCategoryId === 'all'
                  ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black shadow-md shadow-amber-500/25 font-black scale-105'
                  : 'bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              Todas ({categories.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all whitespace-nowrap flex items-center gap-2 border cursor-pointer ${
                  selectedCategoryId === cat.id
                    ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black border-amber-300 shadow-md shadow-amber-500/25 font-black scale-105'
                    : 'bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800 border-zinc-800'
                }`}
              >
                <span>{cat.title}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedCategoryId === cat.id ? 'bg-black/30 text-black' : 'bg-black/50 text-zinc-300'
                }`}>
                  {cat.nominees.length}
                </span>
                {cat.status === 'winner_revealed' && (
                  <Trophy className="w-3 h-3 text-amber-500 fill-amber-500" />
                )}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar astro, #ID ou obra..."
              className="w-full pl-10 pr-8 py-2 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Categories & Nominees Grid */}
      <div className="space-y-12">
        {filteredCategories.map((category) => {
          const totalCatVotes = category.nominees.reduce((sum, n) => sum + n.votes, 0);
          const sortedNominees = [...category.nominees].sort((a, b) => b.votes - a.votes);
          const userVotedId = userVotes[category.id];

          return (
            <section
              key={category.id}
              id={`category-section-${category.id}`}
              className="space-y-6"
            >
              {/* Category Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 p-[1px] shadow-lg">
                    <div className="w-full h-full bg-[#0e0f16] rounded-[10px] flex items-center justify-center text-amber-400">
                      {category.id.includes('hit') ? (
                        <Music className="w-5 h-5" />
                      ) : category.id.includes('clipe') ? (
                        <Film className="w-5 h-5" />
                      ) : category.id.includes('creator') ? (
                        <Crown className="w-5 h-5" />
                      ) : (
                        <Star className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl sm:text-2xl font-bold text-white font-cinzel tracking-wide">
                        {category.title}
                      </h2>
                      {category.status === 'winner_revealed' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-black shadow-md flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          Vencedor Revelado
                        </span>
                      ) : category.status === 'voting_open' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                          <Vote className="w-3 h-3" />
                          Votação Aberta
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/15 border border-amber-500/30 text-amber-300">
                          Indicados Oficiais
                        </span>
                      )}
                    </div>
                    {category.subtitle && (
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {category.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] font-medium text-zinc-400 block">
                      {category.status === 'voting_open' ? 'Total Votos Apurados' : 'Concorrentes'}
                    </span>
                    <span className="text-sm font-black font-mono text-amber-300">
                      {category.status === 'voting_open'
                        ? `${totalCatVotes.toLocaleString('pt-BR')} votos`
                        : `${category.nominees.length} indicados`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nominees Grid */}
              {category.nominees.length === 0 ? (
                <div className="p-8 rounded-3xl bg-[#0f1017] border border-zinc-800 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-center mx-auto text-amber-400">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white font-cinzel">Nenhum indicado cadastrado nesta categoria</h3>
                    <p className="text-xs text-zinc-400 max-w-md mx-auto">
                      Os indicados são adicionados diretamente pelo Administrador no Painel de Controle ou importados via envio em massa.
                    </p>
                  </div>
                  {onSwitchToAdmin && (
                    <div>
                      <button
                        onClick={onSwitchToAdmin}
                        className="px-5 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/50 text-amber-300 font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>Gerenciar Indicados no Painel Admin</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {category.nominees.map((nominee) => {
                    const rankIndex = sortedNominees.findIndex((n) => n.id === nominee.id);
                    const isLeader = rankIndex === 0 && totalCatVotes > 0;
                    const isWinner =
                      category.status === 'winner_revealed' &&
                      category.winnerNomineeId === nominee.id;
                    const isUserVoted = userVotedId === nominee.id;
                    const percentage =
                      totalCatVotes > 0
                        ? Math.round((nominee.votes / totalCatVotes) * 100)
                        : 0;

                    const isThumbCat = isThumbnailCategory(category);
                    const nomineeThumb = getNomineeThumbnailUrl(nominee);
                    const displayThumb = isThumbCat ? (nomineeThumb || nominee.avatarUrl) : nomineeThumb;
                    const youtubeUrl = getNomineeYouTubeUrl(nominee);
                    const embedUrl = getYouTubeEmbedUrl(youtubeUrl);

                    return (
                      <motion.div
                        key={nominee.id}
                        id={`nominee-card-${nominee.id}`}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2 }}
                        className={`group relative rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 bg-[#0e0f17] border ${
                          isWinner
                            ? 'gold-card border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/60'
                            : isLeader
                            ? 'border-amber-500/40 hover:border-amber-400/70 shadow-lg shadow-amber-950/20'
                            : 'border-zinc-800/90 hover:border-amber-500/30 hover:shadow-xl'
                        }`}
                      >
                        {/* Top Ribbons & Status Badges */}
                        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                          {isWinner ? (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-lg flex items-center gap-1">
                              <Trophy className="w-3 h-3" />
                              Vencedor XMA
                            </span>
                          ) : isLeader ? (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-amber-500/20 border border-amber-400/50 text-amber-300 backdrop-blur-md">
                              ★ 1º Lugar Atual
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-black/70 border border-zinc-700 text-zinc-300 backdrop-blur-md">
                              Indicado Oficial
                            </span>
                          )}
                        </div>

                        {nominee.badge && (
                          <div className="absolute top-3 right-3 z-10">
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-black/70 border border-amber-400/30 text-amber-300 backdrop-blur-md">
                              {nominee.badge}
                            </span>
                          </div>
                        )}

                        {/* Card Media Preview */}
                        {displayThumb ? (
                          /* 16:9 Thumbnail for thumbnails or video nominees */
                          <div className="relative aspect-video overflow-hidden bg-zinc-950 group/thumb">
                            <img
                              src={displayThumb}
                              alt={`Thumbnail de ${nominee.name}`}
                              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f17] via-transparent to-black/30" />
                            
                            {embedUrl && (
                              <button
                                type="button"
                                onClick={() => setTheaterMedia({
                                  title: nominee.projectTitle || nominee.name,
                                  embedUrl,
                                  nomineeName: nominee.name
                                })}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer"
                              >
                                <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                                  <Play className="w-5 h-5 fill-current ml-0.5" />
                                </div>
                              </button>
                            )}

                            {/* Nominee Small Avatar Pill */}
                            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                              <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-zinc-700">
                                <img
                                  src={nominee.avatarUrl}
                                  alt={nominee.name}
                                  className="w-5 h-5 rounded-full object-cover border border-amber-400/60"
                                />
                                <span className="text-[11px] font-bold text-white truncate max-w-[120px]">
                                  {nominee.name}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Creator Portrait / Avatar */
                          <div className="relative h-48 sm:h-52 overflow-hidden bg-zinc-950 group/avatar">
                            <img
                              src={nominee.avatarUrl}
                              alt={nominee.name}
                              className="w-full h-full object-cover group-hover/avatar:scale-105 transition-transform duration-500 opacity-90 group-hover/avatar:opacity-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f17] via-transparent to-black/30" />

                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                              {nominee.handle ? (
                                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-black/80 border border-amber-500/40 text-amber-300 backdrop-blur-md">
                                  {nominee.handle}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-black/60 text-zinc-400">
                                  Criador PK XD
                                </span>
                              )}
                              <span className="text-[11px] font-bold text-amber-300/90 font-mono">
                                {category.status === 'voting_open' && totalCatVotes > 0
                                  ? `${percentage}% votos`
                                  : 'Concorrente'}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Nominee Card Content */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors font-cinzel truncate">
                                {nominee.name}
                              </h3>
                              {nominee.pkxdId && !nominee.pkxdId.startsWith('@') && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/60 border border-zinc-700 text-zinc-300 shrink-0">
                                  {nominee.pkxdId}
                                </span>
                              )}
                            </div>

                            {nominee.projectTitle && nominee.projectTitle !== nominee.name && (
                              <p className="text-xs text-zinc-300 font-medium line-clamp-1">
                                {nominee.projectTitle}
                              </p>
                            )}

                            {/* Watch / Listen Button if YouTube link exists */}
                            {embedUrl && (
                              <button
                                type="button"
                                onClick={() => setTheaterMedia({
                                  title: nominee.projectTitle || nominee.name,
                                  embedUrl,
                                  nomineeName: nominee.name
                                })}
                                className="w-full py-1.5 px-3 rounded-xl bg-red-600/15 hover:bg-red-600/25 border border-red-500/40 text-red-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Youtube className="w-3.5 h-3.5 text-red-400" />
                                <Play className="w-3 h-3 fill-current" />
                                <span>Ver Clipe / Vídeo</span>
                              </button>
                            )}

                            {nominee.projectDescription && (
                              <p className="text-[11px] text-zinc-400 line-clamp-2">
                                {nominee.projectDescription}
                              </p>
                            )}
                          </div>

                          {/* Progress / Status Display */}
                          {category.status === 'voting_open' ? (
                            <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                                <span>Votos apurados:</span>
                                <span className="font-bold text-amber-300 font-mono">
                                  {nominee.votes.toLocaleString('pt-BR')} ({percentage}%)
                                </span>
                              </div>
                              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${percentage}%` }}
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isWinner
                                      ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                                      : isLeader
                                      ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                                      : 'bg-gradient-to-r from-slate-400 to-slate-600'
                                  }`}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="pt-2 border-t border-zinc-800/80">
                              <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-medium text-center">
                                ✨ Indicado ao Troféu XMA 2026
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="pt-1">
                            {category.status === 'voting_open' ? (
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  id={`view-details-${nominee.id}`}
                                  onClick={() => onSelectNominee(nominee, category)}
                                  className="py-2 px-3 rounded-xl text-xs font-semibold bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-zinc-400" />
                                  <span>Detalhes</span>
                                </button>

                                <button
                                  id={`card-vote-btn-${nominee.id}`}
                                  onClick={() => onVote(category.id, nominee.id)}
                                  className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                    isUserVoted
                                      ? 'bg-emerald-600 text-white shadow-md'
                                      : 'bg-gold-metallic-btn text-black hover:scale-105'
                                  }`}
                                >
                                  {isUserVoted ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Votado</span>
                                    </>
                                  ) : (
                                    <>
                                      <Crown className="w-3.5 h-3.5" />
                                      <span>Votar</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            ) : (
                              <button
                                id={`view-details-${nominee.id}`}
                                onClick={() => onSelectNominee(nominee, category)}
                                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-amber-300 hover:text-amber-200 border border-amber-500/40 hover:border-amber-400 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md group/btn"
                              >
                                <Eye className="w-4 h-4 text-amber-400 group-hover/btn:scale-110 transition-transform" />
                                <span>Conhecer Perfil & Obra</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}

        {filteredCategories.length === 0 && (
          <div className="text-center py-16 bg-[#0e0f16] rounded-3xl border border-zinc-800 space-y-3">
            <Search className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-lg font-bold text-white font-cinzel">Nenhum indicado encontrado</h3>
            <p className="text-sm text-zinc-400">Tente ajustar o termo da sua pesquisa ou selecione outra categoria.</p>
          </div>
        )}
      </div>

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
