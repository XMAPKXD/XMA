import React, { useState, useMemo } from 'react';
import { Category, Nominee } from '../types';
import { Trophy, Search, Sparkles, CheckCircle2, Eye, Flame, Crown, Film, Music, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface NomineesGalleryProps {
  categories: Category[];
  userVotes: Record<string, string>; // categoryId -> nomineeId
  onVote: (categoryId: string, nomineeId: string) => void;
  onSelectNominee: (nominee: Nominee, category: Category) => void;
  onSwitchToCeremony: () => void;
}

export const NomineesGallery: React.FC<NomineesGalleryProps> = ({
  categories,
  userVotes,
  onVote,
  onSelectNominee,
  onSwitchToCeremony
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#181924] via-[#101117] to-[#0a0a0d] border border-amber-500/30 p-6 sm:p-10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-slate-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-400/40 text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Galeria Oficial de Indicados 2026</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-cinzel">
              Estrelas do <span className="text-gold-metallic">Multiverso PK XD</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Explore todos os talentos indicados ao cobiçado Troféu XMA. Conheça as produções audiovisuais, hits musicais e os maiores criadores da comunidade.
            </p>
          </div>

          {/* Quick Stage Card */}
          <div className="bg-[#151620]/90 border border-amber-500/30 rounded-2xl p-5 shrink-0 max-w-xs space-y-3 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-amber-400">Total Indicados</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                {totalNomineesCount} Astros
              </span>
            </div>
            <div className="text-2xl font-black font-cinzel text-white">
              5 Grandes Categorias
            </div>
            <button
              onClick={onSwitchToCeremony}
              className="w-full py-2 px-4 rounded-xl bg-gold-metallic-btn text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>Assistir Cerimônia ao Vivo</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-8 pt-6 border-t border-zinc-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Categories Horizontal Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedCategoryId === 'all'
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                  : 'bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              Todas as Categorias
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  selectedCategoryId === cat.id
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md'
                    : 'bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                <span>{cat.title}</span>
                {cat.status === 'winner_revealed' && (
                  <Trophy className="w-3 h-3 text-amber-300" />
                )}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar criador, #ID ou clipe..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
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
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-lg">
                    <div className="w-full h-full bg-[#12131a] rounded-[10px] flex items-center justify-center text-amber-400">
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
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-black flex items-center gap-1 shadow-sm">
                          <Trophy className="w-3 h-3" />
                          Vencedor Revelado
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                          Votação Aberta
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {category.subtitle}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-zinc-400 flex items-center gap-2 self-start sm:self-auto">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Total da Categoria:</span>
                  <strong className="text-amber-300 font-bold">
                    {totalCatVotes.toLocaleString('pt-BR')} votos
                  </strong>
                </div>
              </div>

              {/* Nominees Grid */}
              {category.nominees.length === 0 ? (
                <div className="p-8 rounded-3xl bg-[#14151e]/60 border border-zinc-800/80 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-center mx-auto text-amber-400">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white font-cinzel">Nenhum indicado cadastrado nesta categoria</h4>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    Os Admins XMA podem cadastrar novos indicados pelo painel administrativo ou aprovar sugestões enviadas pela comunidade.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.nominees.map((nominee) => {
                  const rankIndex = sortedNominees.findIndex((n) => n.id === nominee.id);
                  const isLeader = rankIndex === 0;
                  const isWinner =
                    category.status === 'winner_revealed' &&
                    category.winnerNomineeId === nominee.id;
                  const isUserVoted = userVotedId === nominee.id;
                  const percentage =
                    totalCatVotes > 0
                      ? Math.round((nominee.votes / totalCatVotes) * 100)
                      : 0;

                  return (
                    <motion.div
                      key={nominee.id}
                      id={`nominee-card-${nominee.id}`}
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.2 }}
                      className={`relative rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                        isWinner
                          ? 'gold-card border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.35)]'
                          : isLeader
                          ? 'bg-[#151620] border border-amber-500/40 hover:border-amber-400/70'
                          : 'bg-[#12131a] border border-zinc-800 hover:border-slate-600'
                      }`}
                    >
                      {/* Top Rank / Winner Ribbon */}
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                        {isWinner ? (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-lg flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            Vencedor XMA
                          </span>
                        ) : isLeader ? (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-amber-500/20 border border-amber-400/50 text-amber-300 backdrop-blur-md">
                            ★ 1º Lugar Atual
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-black/60 border border-zinc-700 text-zinc-400 backdrop-blur-md">
                            #{rankIndex + 1}
                          </span>
                        )}
                      </div>

                      {nominee.badge && (
                        <div className="absolute top-3 right-3 z-10">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800/90 border border-slate-600 text-slate-200">
                            {nominee.badge}
                          </span>
                        </div>
                      )}

                      {/* Card Media / Avatar */}
                      <div className="relative h-48 sm:h-52 overflow-hidden bg-zinc-950 group">
                        <img
                          src={nominee.avatarUrl}
                          alt={nominee.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#12131a] via-transparent to-black/40" />

                        {/* Player PK XD ID Tag */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-black/75 border border-zinc-700 text-zinc-200 backdrop-blur-md">
                            {nominee.pkxdId}
                          </span>
                          <span className="text-[11px] font-bold text-amber-300/90">
                            {percentage}% dos votos
                          </span>
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors font-cinzel">
                            {nominee.name}
                          </h3>
                          <p className="text-xs text-amber-400 font-medium">
                            {nominee.handle}
                          </p>
                          <p className="text-xs text-zinc-300 font-semibold line-clamp-1 pt-1">
                            {nominee.projectTitle}
                          </p>
                          <p className="text-[11px] text-zinc-400 line-clamp-2">
                            {nominee.projectDescription}
                          </p>
                        </div>

                        {/* Vote Percentage Progress */}
                        <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                          <div className="flex items-center justify-between text-[11px] text-zinc-400">
                            <span>Votos apurados:</span>
                            <span className="font-bold text-zinc-200">
                              {nominee.votes.toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${percentage}%` }}
                              className={`h-full rounded-full ${
                                isWinner
                                  ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                                  : isLeader
                                  ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                                  : 'bg-gradient-to-r from-slate-400 to-slate-600'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            id={`view-details-${nominee.id}`}
                            onClick={() => onSelectNominee(nominee, category)}
                            className="py-2 px-3 rounded-xl text-xs font-semibold bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Detalhes</span>
                          </button>

                          {category.status === 'voting_open' ? (
                            <button
                              id={`card-vote-btn-${nominee.id}`}
                              onClick={() => onVote(category.id, nominee.id)}
                              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                isUserVoted
                                  ? 'bg-emerald-600 text-white shadow-md'
                                  : 'bg-gold-metallic-btn text-black'
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
                          ) : (
                            <button
                              disabled
                              className="py-2 px-3 rounded-xl text-xs font-bold bg-zinc-900 text-zinc-600 border border-zinc-800 flex items-center justify-center cursor-not-allowed"
                            >
                              Encerrada
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
          <div className="text-center py-16 bg-[#12131a] rounded-3xl border border-zinc-800 space-y-3">
            <Search className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-lg font-bold text-white font-cinzel">Nenhum indicado encontrado</h3>
            <p className="text-sm text-zinc-400">Tente ajustar a sua busca ou selecione outra categoria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
