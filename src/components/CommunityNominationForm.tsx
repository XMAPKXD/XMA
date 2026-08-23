import React, { useState } from 'react';
import { Category, CommunityNomination } from '../types';
import { 
  Sparkles, 
  Send, 
  Heart, 
  CheckCircle2, 
  Award, 
  UserPlus, 
  ExternalLink, 
  MessageSquare,
  HelpCircle,
  ThumbsUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerGoldenConfetti } from '../utils/confetti';
import { playVoteChime } from '../utils/audio';

interface CommunityNominationFormProps {
  categories: Category[];
  nominations: CommunityNomination[];
  onSubmitNomination: (nomination: Omit<CommunityNomination, 'id' | 'createdAt' | 'status' | 'communityLikes'>) => void;
  onLikeNomination: (nominationId: string) => void;
  userPkxdTag?: string;
  userNickname?: string;
}

export const CommunityNominationForm: React.FC<CommunityNominationFormProps> = ({
  categories,
  nominations,
  onSubmitNomination,
  onLikeNomination,
  userPkxdTag = '',
  userNickname = ''
}) => {
  const [formData, setFormData] = useState({
    submittedByName: userNickname || '',
    submittedByPkxdId: userPkxdTag || '#PKXD',
    nomineeName: '',
    nomineeHandle: '',
    nomineePkxdId: '',
    categoryId: categories[0]?.id || '',
    workTitle: '',
    workUrl: '',
    reason: '',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
  });

  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const selectedCategoryObj = categories.find((c) => c.id === formData.categoryId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomineeName.trim() || !formData.submittedByName.trim()) return;

    onSubmitNomination({
      submittedByName: formData.submittedByName.trim(),
      submittedByPkxdId: formData.submittedByPkxdId.trim() || '#PLAYER',
      nomineeName: formData.nomineeName.trim(),
      nomineeHandle: formData.nomineeHandle.trim().startsWith('@') 
        ? formData.nomineeHandle.trim() 
        : `@${formData.nomineeHandle.trim()}`,
      nomineePkxdId: formData.nomineePkxdId.trim().startsWith('#')
        ? formData.nomineePkxdId.trim()
        : `#${formData.nomineePkxdId.trim()}`,
      categoryId: formData.categoryId,
      categoryTitle: selectedCategoryObj?.title || 'Categoria XMA',
      workTitle: formData.workTitle.trim() || 'Trabalho Autoral PK XD',
      workUrl: formData.workUrl.trim(),
      reason: formData.reason.trim(),
      avatarUrl: formData.avatarUrl.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
    });

    playVoteChime();
    triggerGoldenConfetti();
    setSubmittedSuccess(true);

    // Reset fields except user's name
    setFormData({
      submittedByName: formData.submittedByName,
      submittedByPkxdId: formData.submittedByPkxdId,
      nomineeName: '',
      nomineeHandle: '',
      nomineePkxdId: '',
      categoryId: categories[0]?.id || '',
      workTitle: '',
      workUrl: '',
      reason: '',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
    });

    setTimeout(() => {
      setSubmittedSuccess(false);
    }, 6000);
  };

  const filteredNominations = nominations.filter((n) => {
    if (filterCategory === 'all') return true;
    return n.categoryId === filterCategory;
  });

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#171822] via-[#2a2212] to-[#12131b] border-2 border-amber-500/50 p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 border border-amber-400/50 text-amber-300">
            <UserPlus className="w-3.5 h-3.5" />
            <span>Voz da Comunidade PK XD</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-cinzel">
            Indique seu <span className="text-gold-metallic">Astro Favorito</span>
          </h1>

          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
            Conhece um criador de conteúdo lendário, um beatmaker genial ou aquele jogador que cria os melhores clipes e looks?
            Envie sua indicação oficial para a comissão do <strong>Kodo Admin</strong> avaliar e adicionar à disputa do Troféu XMA 2026!
          </p>
        </div>
      </div>

      {/* Main Grid: Form + Live Card Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form 
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 rounded-3xl bg-[#14151e] border border-amber-500/30 space-y-6 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
                  <Award className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-white font-cinzel">
                  Formulário de Indicação Oficial
                </h2>
              </div>
              <span className="text-[11px] text-amber-400 font-semibold uppercase">
                Edição 2026
              </span>
            </div>

            {/* Submitter Info */}
            <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">
                1. Seus Dados de Jogador PK XD
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1">Seu Nickname</label>
                  <input
                    type="text"
                    required
                    value={formData.submittedByName}
                    onChange={(e) => setFormData({ ...formData, submittedByName: e.target.value })}
                    placeholder="Ex: Bia Gamer"
                    className="w-full px-3.5 py-2 bg-black border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Sua #Tag PK XD</label>
                  <input
                    type="text"
                    value={formData.submittedByPkxdId}
                    onChange={(e) => setFormData({ ...formData, submittedByPkxdId: e.target.value })}
                    placeholder="Ex: #BIA4410"
                    className="w-full px-3.5 py-2 bg-black border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Nominee Info */}
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">
                2. Quem você deseja indicar para o Troféu XMA?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Nome do Criador / Astro *</label>
                  <input
                    type="text"
                    required
                    value={formData.nomineeName}
                    onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })}
                    placeholder="Ex: Pedro Astro"
                    className="w-full px-3.5 py-2.5 bg-black border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Handle / Canal (@) *</label>
                  <input
                    type="text"
                    required
                    value={formData.nomineeHandle}
                    onChange={(e) => setFormData({ ...formData, nomineeHandle: e.target.value })}
                    placeholder="@pedroastro_xd"
                    className="w-full px-3.5 py-2.5 bg-black border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">ID / Tag no PK XD</label>
                  <input
                    type="text"
                    value={formData.nomineePkxdId}
                    onChange={(e) => setFormData({ ...formData, nomineePkxdId: e.target.value })}
                    placeholder="#PEDRO9900"
                    className="w-full px-3.5 py-2.5 bg-black border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Categoria de Premiação *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 mb-1 font-semibold">Título do Trabalho / Clipe / Série</label>
                  <input
                    type="text"
                    value={formData.workTitle}
                    onChange={(e) => setFormData({ ...formData, workTitle: e.target.value })}
                    placeholder="Ex: Série Mansão Mal-Assombrada / Hit Beat Ilha"
                    className="w-full px-3.5 py-2.5 bg-black border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 mb-1 font-semibold">Link do Vídeo / Conteúdo (YouTube / TikTok / Canal)</label>
                  <input
                    type="url"
                    value={formData.workUrl}
                    onChange={(e) => setFormData({ ...formData, workUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2.5 bg-black border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 mb-1 font-semibold">Foto / Avatar URL do Indicado (Opcional)</label>
                  <input
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-black border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 mb-1 font-semibold">Por que ele merece concorrer ao Troféu XMA? *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Conte para os jurados o impacto deste criador, o engajamento e porque a comunidade ama seu conteúdo..."
                    className="w-full px-3.5 py-2.5 bg-black border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                id="submit-nomination-btn"
                className="w-full py-3.5 px-6 rounded-2xl bg-gold-metallic-btn text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition-transform"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Indicação para o Kodo Admin</span>
              </button>
            </div>

            {/* Success Alert */}
            <AnimatePresence>
              {submittedSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 text-xs font-bold flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-white">Indicação Enviada com Sucesso! 👑</div>
                    <div className="text-emerald-200/90 font-normal">
                      Sua indicação foi registrada no banco de dados da comissão e já pode receber apoios da comunidade abaixo.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Right Preview Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-[#12131a] border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Prévia do Card de Indicado</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                Live Preview
              </span>
            </div>

            {/* Mock Card */}
            <div className="p-5 rounded-2xl bg-[#181924] border-2 border-amber-400/60 space-y-4 shadow-xl">
              <div className="flex items-center gap-3.5">
                <img
                  src={formData.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'}
                  alt="Nominee Avatar"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md bg-zinc-900"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white font-cinzel">
                      {formData.nomineeName || 'Nome do Indicado'}
                    </h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 border border-zinc-700 text-amber-300">
                      {formData.nomineePkxdId || '#PKXD0000'}
                    </span>
                  </div>
                  <p className="text-xs text-amber-400 font-semibold">
                    {formData.nomineeHandle || '@handle_do_criador'}
                  </p>
                  <span className="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {selectedCategoryObj?.title || 'Categoria XMA'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 space-y-1.5 text-xs">
                <div className="font-bold text-zinc-200">
                  {formData.workTitle || 'Título do Trabalho / Clipe Indicado'}
                </div>
                <p className="text-zinc-400 text-[11px] line-clamp-3">
                  {formData.reason || 'O motivo da indicação aparecerá aqui detalhando os motivos de o indicado merecer o troféu de gala...'}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800">
                <span>Indicado por: <strong>{formData.submittedByName || 'Você'}</strong></span>
                <span className="text-amber-400 font-bold">XMA 2026 Oficial</span>
              </div>
            </div>

            <div className="text-xs text-zinc-400 space-y-2 p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800">
              <div className="font-bold text-zinc-200 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Como funciona a aprovação?</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Todas as indicações chegam diretamente no <strong>Kodo Admin Center</strong>. O comitê analisa as mais apoiadas pela torcida e adiciona oficialmente às urnas de votação!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Community Feed of Submissions */}
      <div className="space-y-6 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-2xl font-extrabold text-white font-cinzel">
              Mural de Indicações da Comunidade
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Veja quem a comunidade está pedindo no palco do XMA e deixe seu apoio (+1 Curtida) para ajudar a oficializar o indicado!
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-semibold">Filtrar:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="all">Todas as Categorias ({nominations.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Nominations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNominations.map((nom) => (
            <motion.div
              key={nom.id}
              layout
              className="p-5 rounded-2xl bg-[#13141d] border border-zinc-800 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-4 shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 truncate max-w-[200px]">
                    {nom.categoryTitle || 'Categoria XMA'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    nom.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {nom.status === 'approved' ? '✓ Oficializado' : 'Em Avaliação'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={nom.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'}
                    alt={nom.nomineeName}
                    className="w-12 h-12 rounded-xl object-cover border border-amber-400/40 bg-zinc-900"
                  />
                  <div>
                    <h3 className="font-bold text-white text-base font-cinzel">
                      {nom.nomineeName}
                    </h3>
                    <p className="text-xs text-amber-400 font-medium">
                      {nom.nomineeHandle} <span className="text-zinc-400 font-mono text-[10px]">{nom.nomineePkxdId}</span>
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-zinc-800/80 space-y-1 text-xs">
                  <div className="font-bold text-zinc-200 truncate">
                    {nom.workTitle}
                  </div>
                  <p className="text-zinc-400 text-[11px] line-clamp-3 leading-relaxed">
                    "{nom.reason}"
                  </p>
                </div>
              </div>

              {/* Footer / Community Support Button */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                <div className="text-[11px] text-zinc-400">
                  Por: <span className="text-zinc-300 font-semibold">{nom.submittedByName}</span>
                </div>

                <button
                  onClick={() => onLikeNomination(nom.id)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-amber-500/20 hover:text-amber-300 text-zinc-300 border border-zinc-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>Apoiar ({nom.communityLikes})</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
