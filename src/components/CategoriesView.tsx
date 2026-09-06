import React, { useState } from 'react';
import { 
  Trophy, 
  Award, 
  Search, 
  ChevronRight, 
  Sparkles, 
  Crown, 
  Music, 
  Film, 
  Star, 
  Radio, 
  X, 
  Vote, 
  CheckCircle2, 
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Category, Nominee } from '../types';

interface CategoriesViewProps {
  categories: Category[];
  onVoteCategory: (categoryId: string) => void;
  onSelectNomineeDetail?: (nominee: Nominee, category: Category) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  onVoteCategory,
  onSelectNomineeDetail
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDetailCategory, setActiveDetailCategory] = useState<Category | null>(null);

  const filteredCategories = categories.filter((cat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      cat.title.toLowerCase().includes(q) ||
      cat.subtitle?.toLowerCase().includes(q) ||
      cat.description?.toLowerCase().includes(q)
    );
  });

  const getCategoryIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'crown': return <Crown className="w-5 h-5 text-amber-400" />;
      case 'music': return <Music className="w-5 h-5 text-amber-400" />;
      case 'film': return <Film className="w-5 h-5 text-amber-400" />;
      case 'radio': return <Radio className="w-5 h-5 text-amber-400" />;
      case 'star': return <Star className="w-5 h-5 text-amber-400" />;
      default: return <Award className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>ESTATUTAS & RECONHECIMENTOS</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-cinzel text-white tracking-tight">
          CATEGORIAS OFICIAIS
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
          Conheça todas as categorias do XMA 2026. Clique em qualquer categoria para explorar os indicados e votar.
        </p>

        {/* Search Bar */}
        <div className="pt-4 max-w-md mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar categoria por título ou tema..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/80 transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((cat, idx) => (
          <motion.div
            key={cat.id}
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            onClick={() => setActiveDetailCategory(cat)}
            className="p-6 rounded-3xl bg-[#0d0e16] border border-zinc-800/90 hover:border-amber-500/50 hover:bg-[#10111c] transition-all duration-300 cursor-pointer group flex flex-col justify-between shadow-lg shadow-black/40"
          >
            <div className="space-y-4">
              {/* Top Icons & Badges */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {getCategoryIcon(cat.iconName)}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
                    {cat.nominees?.length || 0} INDICADOS
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    {cat.status === 'voting_open' ? 'Votação Aberta' : 'Auditado'}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-cinzel group-hover:text-amber-300 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                  {cat.description || cat.subtitle}
                </p>
              </div>
            </div>

            {/* Nominees Preview Avatars */}
            <div className="mt-6 pt-4 border-t border-zinc-850 flex items-center justify-between">
              <div className="flex items-center -space-x-2">
                {cat.nominees.slice(0, 4).map((nom) => (
                  <img
                    key={nom.id}
                    src={nom.avatarUrl}
                    alt={nom.name}
                    className="w-7 h-7 rounded-full object-cover border-2 border-[#0d0e16]"
                    title={nom.name}
                  />
                ))}
                {cat.nominees.length > 4 && (
                  <div className="w-7 h-7 rounded-full bg-zinc-800 border-2 border-[#0d0e16] flex items-center justify-center text-[9px] font-mono text-zinc-300">
                    +{cat.nominees.length - 4}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                <span>Ver Detalhes</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ========================================================= */}
      {/* CATEGORY DETAILED DRAWER / MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {activeDetailCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0e0f17] border-2 border-amber-500/40 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-800 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold uppercase">
                    Categoria Oficial
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black font-cinzel text-white">
                    {activeDetailCategory.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400">
                    {activeDetailCategory.description || activeDetailCategory.subtitle}
                  </p>
                </div>

                <button
                  onClick={() => setActiveDetailCategory(null)}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nominees in this Category */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Indicados Oficiais Nesta Categoria ({activeDetailCategory.nominees.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeDetailCategory.nominees.map((nominee) => (
                    <div
                      key={nominee.id}
                      className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={nominee.avatarUrl}
                          alt={nominee.name}
                          className="w-12 h-12 rounded-xl object-cover border border-amber-400/40 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-white text-sm truncate">
                            {nominee.name}
                          </h4>
                          <span className="text-[11px] text-amber-300 font-mono block">
                            {nominee.handle}
                          </span>
                          {nominee.pkxdId && (
                            <span className="text-[10px] text-zinc-500 font-mono">
                              Tag: {nominee.pkxdId}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-2">
                        {nominee.projectDescription || nominee.bio}
                      </p>

                      <div className="pt-2 border-t border-zinc-850 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectNomineeDetail) {
                              onSelectNomineeDetail(nominee, activeDetailCategory);
                            }
                          }}
                          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Perfil</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveDetailCategory(null);
                            onVoteCategory(activeDetailCategory.id);
                          }}
                          className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          <Vote className="w-3 h-3" />
                          <span>Votar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-mono">
                  {activeDetailCategory.sponsor ? `Patrocinado por: ${activeDetailCategory.sponsor}` : 'Comissão XMA 2026'}
                </span>

                <button
                  onClick={() => {
                    const catId = activeDetailCategory.id;
                    setActiveDetailCategory(null);
                    onVoteCategory(catId);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <Vote className="w-4 h-4" />
                  <span>VOTAR NESTA CATEGORIA</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
