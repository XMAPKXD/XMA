import React, { useState } from 'react';
import { 
  Newspaper, 
  Calendar, 
  Clock, 
  ArrowRight, 
  X, 
  Sparkles, 
  Share2, 
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { XMANewsArticle } from '../types';

interface NewsViewProps {
  articles: XMANewsArticle[];
}

export const NewsView: React.FC<NewsViewProps> = ({ articles }) => {
  const [selectedArticle, setSelectedArticle] = useState<XMANewsArticle | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const categories = ['all', 'Votação', 'Indicados', 'Regras', 'Cerimônia'];

  const filteredArticles = articles.filter((art) => {
    if (selectedTag === 'all') return true;
    return art.category === selectedTag;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
          <Newspaper className="w-3.5 h-3.5 text-amber-400" />
          <span>PORTAL OFICIAL DE NOTÍCIAS</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-cinzel text-white tracking-tight">
          NOVIDADES DO XMA
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
          Fique por dentro de todos os anúncios, relatórios de bastidores, novidades e cronogramas oficiais da premiação.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedTag(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedTag === cat
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-black shadow-md shadow-amber-400/20'
                : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'
            }`}
          >
            {cat === 'all' ? 'Todas as Notícias' : cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article, idx) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            onClick={() => setSelectedArticle(article)}
            className="rounded-3xl bg-[#0d0e16] border border-zinc-800/90 hover:border-amber-500/50 hover:bg-[#10111a] transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer shadow-lg shadow-black/40"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/80 backdrop-blur-md border border-amber-500/40 text-amber-300">
                  {article.category}
                </span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                  <Calendar className="w-3 h-3 text-zinc-500" />
                  <span>{article.publishedAt}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                  {article.title}
                </h3>

                <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-850 flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                <span>Ler matéria completa</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Article Detail Reading Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0e0f17] border-2 border-amber-500/40 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Image banner */}
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-900 shrink-0">
                <img
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-black text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-4 flex-1">
                <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                  <span className="text-amber-400 font-bold uppercase">{selectedArticle.category}</span>
                  <span>•</span>
                  <span>{selectedArticle.publishedAt}</span>
                  <span>•</span>
                  <span>{selectedArticle.readTime}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black font-cinzel text-white leading-tight">
                  {selectedArticle.title}
                </h2>

                <p className="text-sm font-semibold text-amber-200/90 leading-relaxed">
                  {selectedArticle.subtitle}
                </p>

                <div className="space-y-3 pt-2 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {selectedArticle.content.map((paragraph, pIdx) => (
                    <p key={pIdx}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-mono">
                  XD Music & Media Awards 2026
                </span>

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: selectedArticle.title,
                        text: selectedArticle.summary,
                        url: window.location.href
                      }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copiado para a área de transferência!');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartilhar</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
