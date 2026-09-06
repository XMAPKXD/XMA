import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Search, 
  Sparkles, 
  Eye, 
  Vote, 
  ChevronRight, 
  Youtube, 
  CheckCircle2, 
  Award, 
  Crown, 
  Star,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { Category, Nominee } from '../types';

interface NomineesViewProps {
  categories: Category[];
  onSelectNomineeDetail: (nominee: Nominee, category: Category) => void;
  onVoteNominee: (categoryId: string, nomineeId: string) => void;
}

export const NomineesView: React.FC<NomineesViewProps> = ({
  categories,
  onSelectNomineeDetail,
  onVoteNominee
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract all unique nominees and find all categories each nominee is nominated for
  const allNomineesList = useMemo(() => {
    const nomineeMap = new Map<string, {
      nominee: Nominee;
      categoryList: Category[];
      primaryCategory: Category;
    }>();

    categories.forEach((cat) => {
      cat.nominees?.forEach((nom) => {
        const key = nom.id || nom.name.toLowerCase().trim();
        if (!nomineeMap.has(key)) {
          nomineeMap.set(key, {
            nominee: nom,
            categoryList: [cat],
            primaryCategory: cat
          });
        } else {
          const existing = nomineeMap.get(key)!;
          if (!existing.categoryList.some((c) => c.id === cat.id)) {
            existing.categoryList.push(cat);
          }
        }
      });
    });

    return Array.from(nomineeMap.values());
  }, [categories]);

  // Filtered nominees by category and search query
  const filteredNominees = useMemo(() => {
    return allNomineesList.filter(({ nominee, categoryList }) => {
      // Category filter
      if (selectedCategoryFilter !== 'all') {
        const matchesCategory = categoryList.some((c) => c.id === selectedCategoryFilter);
        if (!matchesCategory) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = nominee.name.toLowerCase().includes(q);
        const matchesHandle = nominee.handle?.toLowerCase().includes(q);
        const matchesPkxdId = nominee.pkxdId?.toLowerCase().includes(q);
        const matchesBio = (nominee.bio || nominee.projectDescription || '').toLowerCase().includes(q);
        if (!matchesName && !matchesHandle && !matchesPkxdId && !matchesBio) return false;
      }

      return true;
    });
  }, [allNomineesList, selectedCategoryFilter, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>GALERIA DE ASTROS & TALENTOS</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-cinzel text-white tracking-tight">
          OS INDICADOS
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
          Conheça os criadores de conteúdo, streamers, jogadores e mentes criativas que concorrem aos troféus do XMA 2026.
        </p>

        {/* Search Input */}
        <div className="pt-4 max-w-md mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar indicado por nome, @handle ou tag PK XD..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/80 transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
        <button
          onClick={() => setSelectedCategoryFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
            selectedCategoryFilter === 'all'
              ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-black shadow-md shadow-amber-400/20'
              : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'
          }`}
        >
          Todos os Indicados ({allNomineesList.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryFilter(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedCategoryFilter === cat.id
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-black shadow-md shadow-amber-400/20'
                : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'
            }`}
          >
            {cat.title} ({cat.nominees?.length || 0})
          </button>
        ))}
      </div>

      {/* Nominees Grid (Magazine & Streaming Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNominees.map(({ nominee, categoryList, primaryCategory }, idx) => (
          <motion.div
            key={nominee.id}
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.04 }}
            className="rounded-3xl bg-[#0d0e16] border border-zinc-800/90 hover:border-amber-500/50 hover:bg-[#10111a] transition-all duration-300 overflow-hidden flex flex-col justify-between group shadow-lg shadow-black/40"
          >
            {/* Top Media Portrait Header */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
              <img
                src={nominee.avatarUrl}
                alt={nominee.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e16] via-transparent to-black/30" />

              {/* Verified or Tag Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-black/80 backdrop-blur-md border border-amber-400/40 text-amber-300">
                  {nominee.pkxdId || '#PKXD'}
                </span>
                {nominee.badge && (
                  <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase bg-amber-400 text-black shadow">
                    {nominee.badge}
                  </span>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div>
                  <h3 className="text-xl font-black text-white font-cinzel group-hover:text-amber-300 transition-colors">
                    {nominee.name}
                  </h3>
                  <span className="text-xs font-mono text-amber-300/80">
                    {nominee.handle}
                  </span>
                </div>

                {/* Categories nominated in */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                    Concorrendo em:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {categoryList.map((c) => (
                      <span
                        key={c.id}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1"
                      >
                        <Trophy className="w-2.5 h-2.5 text-amber-400" />
                        <span>{c.title}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed pt-1">
                  {nominee.bio || nominee.projectDescription || nominee.projectTitle}
                </p>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-zinc-850 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onSelectNomineeDetail(nominee, primaryCategory)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 hover:border-amber-400/50 text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ver Perfil</span>
                </button>

                <button
                  type="button"
                  onClick={() => onVoteNominee(primaryCategory.id, nominee.id)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-amber-500/20"
                >
                  <Vote className="w-3.5 h-3.5" />
                  <span>Votar</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
