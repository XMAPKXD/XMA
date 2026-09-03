import React, { useState, useRef } from 'react';
import { Category, CommunityNomination } from '../types';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Award, 
  UserPlus, 
  HelpCircle,
  Upload,
  Image as ImageIcon,
  ShieldCheck,
  Lock,
  Instagram,
  Video,
  Youtube,
  AlertCircle,
  X,
  Trophy,
  Vote,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerGoldenConfetti } from '../utils/confetti';
import { playVoteChime } from '../utils/audio';
import { compressImage } from '../utils/imageCompressor';

interface CommunityNominationFormProps {
  categories: Category[];
  nominations?: CommunityNomination[];
  onSubmitNomination: (nomination: Omit<CommunityNomination, 'id' | 'createdAt' | 'status' | 'communityLikes'>) => void;
  onLikeNomination?: (nominationId: string) => void;
  userPkxdTag?: string;
  userNickname?: string;
  isOpen?: boolean;
  onNavigate?: (tab: 'gallery' | 'voting') => void;
}

export const CommunityNominationForm: React.FC<CommunityNominationFormProps> = ({
  categories,
  onSubmitNomination,
  userPkxdTag = '',
  userNickname = '',
  isOpen = false,
  onNavigate
}) => {
  const [formData, setFormData] = useState({
    submittedByName: userNickname || '',
    submittedByPkxdId: userPkxdTag || '',
    nomineeName: '',
    nomineePkxdId: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    categoryId: categories[0]?.id || '',
    workTitle: '',
    workUrl: '',
    reason: '',
    avatarUrl: ''
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [lastSubmittedNominee, setLastSubmittedNominee] = useState<string>('');
  const [showAdminOverrideForm, setShowAdminOverrideForm] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedCategoryObj = categories.find((c) => c.id === formData.categoryId);

  // Handle local image file upload with compression
  const [isCompressingPhoto, setIsCompressingPhoto] = useState<boolean>(false);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressingPhoto(true);
      const compressedDataUrl = await compressImage(file, 800, 800, 0.78);
      setFormData((prev) => ({ ...prev, avatarUrl: compressedDataUrl }));
    } catch (err) {
      console.error('Erro ao otimizar foto da indicação:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({ ...prev, avatarUrl: String(event.target?.result) }));
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, avatarUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.nomineeName.trim()) {
      setValidationError('Por favor, informe o nome do indicado.');
      return;
    }

    if (!formData.submittedByName.trim()) {
      setValidationError('Por favor, informe seu nickname de jogador.');
      return;
    }

    // Determine primary handle from provided socials or general handle
    let primaryHandle = '';
    if (formData.instagram.trim()) {
      const ig = formData.instagram.trim();
      primaryHandle = ig.startsWith('@') || ig.startsWith('http') ? ig : `@${ig}`;
    } else if (formData.tiktok.trim()) {
      const tt = formData.tiktok.trim();
      primaryHandle = tt.startsWith('@') || tt.startsWith('http') ? tt : `@${tt}`;
    } else if (formData.youtube.trim()) {
      const yt = formData.youtube.trim();
      primaryHandle = yt.startsWith('@') || yt.startsWith('http') ? yt : `@${yt}`;
    }

    const nomineeTag = formData.nomineePkxdId.trim()
      ? (formData.nomineePkxdId.trim().startsWith('#') ? formData.nomineePkxdId.trim() : `#${formData.nomineePkxdId.trim()}`)
      : '#000';

    const submitterTag = formData.submittedByPkxdId.trim()
      ? (formData.submittedByPkxdId.trim().startsWith('#') ? formData.submittedByPkxdId.trim() : `#${formData.submittedByPkxdId.trim()}`)
      : '#000';

    onSubmitNomination({
      submittedByName: formData.submittedByName.trim(),
      submittedByPkxdId: submitterTag,
      nomineeName: formData.nomineeName.trim(),
      nomineeHandle: primaryHandle || undefined,
      nomineePkxdId: nomineeTag,
      instagram: formData.instagram.trim() || undefined,
      tiktok: formData.tiktok.trim() || undefined,
      youtube: formData.youtube.trim() || undefined,
      categoryId: formData.categoryId,
      categoryTitle: selectedCategoryObj?.title || 'Categoria XMA',
      workTitle: formData.workTitle.trim() || 'Indicado Oficial XMA 2026',
      workUrl: formData.workUrl.trim(),
      reason: formData.reason.trim() || 'Indicado ao Troféu XMA 2026',
      avatarUrl: formData.avatarUrl.trim() || undefined
    });

    playVoteChime();
    triggerGoldenConfetti();
    setLastSubmittedNominee(formData.nomineeName.trim());
    setSubmittedSuccess(true);

    // Reset nominee inputs while keeping user identity
    setFormData((prev) => ({
      ...prev,
      nomineeName: '',
      nomineePkxdId: '',
      instagram: '',
      tiktok: '',
      youtube: '',
      categoryId: categories[0]?.id || '',
      workTitle: '',
      workUrl: '',
      reason: '',
      avatarUrl: ''
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Scroll to success banner
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Helper initials for avatar preview when no photo is provided
  const getInitials = (name: string) => {
    if (!name.trim()) return 'XD';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto">
      {/* If nominations are closed */}
      {!isOpen && !showAdminOverrideForm ? (
        <div className="space-y-8">
          {/* Closed Hero Card */}
          <div className="relative rounded-3xl bg-gradient-to-r from-[#171822] via-[#241a10] to-[#12131b] border-2 border-amber-500/50 p-6 sm:p-10 shadow-2xl overflow-hidden text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center mx-auto text-amber-300 shadow-xl shadow-amber-500/20">
              <Clock className="w-8 h-8 text-amber-400" />
            </div>

            <div className="space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 border border-red-400/40 text-red-300">
                <span>Fase de Indicações Encerrada</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-cinzel">
                Indicações <span className="text-gold-metallic">Oficialmente Encerradas</span>
              </h1>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                A fase de envio de sugestões e indicações públicas para o <strong>XMA 2026</strong> foi concluída com sucesso! A comissão organizadora dos <strong>Admins do XMA</strong> avaliou os inscritos e os indicados oficiais já estão em exibição na Galeria e nas Urnas de Votação.
              </p>
            </div>

            {/* Quick Action Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-2">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('gallery')}
                className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/40 hover:border-amber-400 hover:bg-zinc-800/90 transition-all text-left space-y-2 group cursor-pointer shadow-lg hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
                <div className="font-bold text-white font-cinzel text-base">Ver Indicados Oficiais</div>
                <p className="text-xs text-zinc-400">Explore todos os astros e categorias em disputa pelo troféu.</p>
              </button>

              <button
                type="button"
                onClick={() => onNavigate && onNavigate('voting')}
                className="p-5 rounded-2xl bg-gold-metallic-btn text-black transition-all text-left space-y-2 group cursor-pointer shadow-lg hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-xl bg-black/20 border border-black/30 flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                  <Vote className="w-5 h-5 text-black" />
                </div>
                <div className="font-black text-black font-cinzel text-base">Votar no seu Criador</div>
                <p className="text-xs text-black/80 font-medium">Participe da votação em massa e do voto único verificado.</p>
              </button>
            </div>

            {/* Admin toggle override */}
            <div className="pt-4 border-t border-zinc-800 text-xs text-zinc-500 flex items-center justify-center gap-2">
              <Lock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Painel Organizador:</span>
              <button
                type="button"
                onClick={() => setShowAdminOverrideForm(true)}
                className="text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer"
              >
                Abrir formulário de cadastro de exceção (Admins)
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Hero Header */}
          <div className="relative rounded-3xl bg-gradient-to-r from-[#171822] via-[#2a2212] to-[#12131b] border-2 border-amber-500/50 p-6 sm:p-10 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 border border-amber-400/50 text-amber-300">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Indicação Oficial da Comunidade PK XD</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-cinzel">
                Indique seu <span className="text-gold-metallic">Astro Favorito</span>
              </h1>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                Conhece um criador de conteúdo lendário, um beatmaker genial ou aquele jogador que cria os melhores clipes e looks?
                Envie sua indicação oficial diretamente para a comissão organizadora avaliar!
              </p>

              <div className="pt-2 flex items-center gap-2 text-xs text-amber-300/90 font-medium">
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>As indicações são confidenciais e enviadas exclusivamente aos <strong>Administradores do XMA</strong>.</span>
              </div>
            </div>
          </div>

      {/* Success Alert Banner */}
      <AnimatePresence>
        {submittedSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="p-6 rounded-3xl bg-emerald-950/80 border-2 border-emerald-500/60 text-emerald-200 shadow-2xl space-y-3 relative overflow-hidden"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shrink-0 text-emerald-300">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white font-cinzel flex items-center gap-2">
                  <span>Indicação de "{lastSubmittedNominee}" Enviada com Sucesso! 👑</span>
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
                  Sua indicação foi registrada com segurança no banco de dados e enviada diretamente para a comissão de <strong>Admins do XMA</strong>. Os administradores irão avaliar os dados e redes sociais informadas antes de oficializar o indicado nas urnas de votação.
                </p>
                <div className="pt-2 flex items-center gap-2 text-[11px] text-emerald-300/80 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Envio privado • Apenas os Administradores têm acesso a esta indicação</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSubmittedSuccess(false)}
                className="px-4 py-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Enviar Outra Indicação
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  Formulário de Indicação
                </h2>
              </div>
              <span className="text-[11px] text-amber-400 font-semibold uppercase">
                Edição 2026
              </span>
            </div>

            {/* Validation Alert */}
            {validationError && (
              <div className="p-4 rounded-2xl bg-red-950/80 border-2 border-red-500/60 text-red-200 text-xs font-semibold flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Atenção no Preenchimento</div>
                  <div className="text-red-200/90 mt-0.5">{validationError}</div>
                </div>
              </div>
            )}

            {/* Submitter Info */}
            <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">
                  1. Seus Dados de Jogador PK XD
                </label>
                <span className="text-[10px] text-zinc-400 font-mono">Ex: Admin#000, Nimda#000, Koosh#000</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Seu Nickname *</label>
                  <input
                    type="text"
                    required
                    value={formData.submittedByName}
                    onChange={(e) => setFormData({ ...formData, submittedByName: e.target.value })}
                    placeholder="Ex: Pedro Gamer, Koosh, Nimda..."
                    className="w-full px-3.5 py-2 bg-black border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Sua #Tag PK XD</label>
                  <input
                    type="text"
                    value={formData.submittedByPkxdId}
                    onChange={(e) => setFormData({ ...formData, submittedByPkxdId: e.target.value })}
                    placeholder="Ex: Admin#000, Nimda#000, Koosh#000"
                    className="w-full px-3.5 py-2 bg-black border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono"
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
                    placeholder="Ex: Kawan XD, Bia Gamer, Luluca..."
                    className="w-full px-3.5 py-2.5 bg-black border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Tag / ID no PK XD</label>
                  <input
                    type="text"
                    value={formData.nomineePkxdId}
                    onChange={(e) => setFormData({ ...formData, nomineePkxdId: e.target.value })}
                    placeholder="Ex: Admin#000, Nimda#000, Koosh#000"
                    className="w-full px-3.5 py-2.5 bg-black border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 mb-1 font-semibold">Categoria de Premiação *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>🏆 {c.title}</option>
                    ))}
                  </select>
                </div>

                {/* Redes Sociais: Instagram, TikTok, YouTube (Opcionais) */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Redes Sociais do Indicado (@)</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      Opcional
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400">
                    Se souber o @ ou canal do indicado, você pode preencher abaixo:
                  </p>

                  <div className="space-y-2.5 pt-1">
                    {/* Instagram */}
                    <div>
                      <label className="block text-[11px] text-zinc-300 font-semibold mb-1 flex items-center gap-1.5">
                        <Instagram className="w-3.5 h-3.5 text-pink-400" />
                        <span>Instagram (Opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.instagram}
                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                        placeholder="Ex: @nomedocriador"
                        className="w-full px-3.5 py-2 bg-black border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400 placeholder:text-zinc-600"
                      />
                    </div>

                    {/* TikTok */}
                    <div>
                      <label className="block text-[11px] text-zinc-300 font-semibold mb-1 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-cyan-400" />
                        <span>TikTok (Opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.tiktok}
                        onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                        placeholder="Ex: @nomedocriador"
                        className="w-full px-3.5 py-2 bg-black border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400 placeholder:text-zinc-600"
                      />
                    </div>

                    {/* YouTube */}
                    <div>
                      <label className="block text-[11px] text-zinc-300 font-semibold mb-1 flex items-center gap-1.5">
                        <Youtube className="w-3.5 h-3.5 text-red-500" />
                        <span>YouTube (Opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.youtube}
                        onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                        placeholder="Ex: @nomedocanal"
                        className="w-full px-3.5 py-2 bg-black border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400 placeholder:text-zinc-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Photo / Avatar Section (Upload file or URL) */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>Foto do Indicado (Opcional - Escolha do Celular)</span>
                    </label>
                    {formData.avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        <span>Remover Foto</span>
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-zinc-400">
                    Você pode escolher uma foto da sua galeria ou colar o link de uma imagem:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* File Upload */}
                    <div>
                      <label className="block text-[11px] text-zinc-300 font-semibold mb-1">
                        1. Escolher Foto do Celular / Galeria
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="w-full text-[11px] text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500/20 file:text-amber-300 hover:file:bg-amber-500/30 cursor-pointer bg-black/60 p-1.5 rounded-xl border border-zinc-700"
                      />
                    </div>

                    {/* URL Input */}
                    <div>
                      <label className="block text-[11px] text-zinc-300 font-semibold mb-1">
                        2. Ou Colar Link Direto da Foto (URL)
                      </label>
                      <input
                        type="url"
                        value={formData.avatarUrl.startsWith('data:') ? '' : formData.avatarUrl}
                        onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                        placeholder="https://exemplo.com/foto.jpg"
                        className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400 placeholder:text-zinc-600"
                      />
                    </div>
                  </div>

                  {formData.avatarUrl && (
                    <div className="flex items-center gap-3 pt-2">
                      <img
                        src={formData.avatarUrl}
                        alt="Prévia da Foto"
                        className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400"
                      />
                      <span className="text-[11px] text-emerald-300 font-semibold">
                        ✓ Foto carregada e pronta para a prévia!
                      </span>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 mb-1 font-semibold flex items-center justify-between">
                    <span>Motivo da Indicação / Observação</span>
                    <span className="text-[10px] text-zinc-500 font-normal">Não obrigatório</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Conte por que esse criador merece concorrer ao Troféu XMA... (Opcional)"
                    className="w-full px-3.5 py-2.5 bg-black border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                id="submit-nomination-btn"
                className="w-full py-4 px-6 rounded-2xl bg-gold-metallic-btn text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-amber-500/20 hover:scale-[1.01] transition-transform"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Indicação aos Admins do XMA</span>
              </button>

              <div className="text-center text-[11px] text-zinc-500">
                🔒 Envio seguro • Visualização restrita exclusivamente aos administradores oficiais do XMA
              </div>
            </div>
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

            {/* Real Card Preview */}
            <div className="p-5 rounded-2xl bg-[#181924] border-2 border-amber-400/60 space-y-4 shadow-xl">
              <div className="flex items-center gap-3.5">
                {formData.avatarUrl ? (
                  <img
                    src={formData.avatarUrl}
                    alt="Nominee Avatar"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md bg-zinc-900"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-600 p-[1.5px] shadow-md shrink-0">
                    <div className="w-full h-full bg-[#0d0e14] rounded-[14px] flex items-center justify-center font-cinzel font-black text-amber-300 text-lg">
                      {getInitials(formData.nomineeName)}
                    </div>
                  </div>
                )}

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-extrabold text-white font-cinzel truncate">
                      {formData.nomineeName || 'Nome do Indicado'}
                    </h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 border border-zinc-700 text-amber-300">
                      {formData.nomineePkxdId || '#Admin000'}
                    </span>
                  </div>

                  {/* Social Badges Preview */}
                  <div className="flex items-center gap-2 flex-wrap text-xs text-amber-400 font-semibold">
                    {formData.instagram && (
                      <span className="flex items-center gap-1 text-[11px] text-pink-400">
                        <Instagram className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">{formData.instagram}</span>
                      </span>
                    )}
                    {formData.tiktok && (
                      <span className="flex items-center gap-1 text-[11px] text-cyan-400">
                        <Video className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">{formData.tiktok}</span>
                      </span>
                    )}
                    {formData.youtube && (
                      <span className="flex items-center gap-1 text-[11px] text-red-400">
                        <Youtube className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">{formData.youtube}</span>
                      </span>
                    )}
                    {!formData.instagram && !formData.tiktok && !formData.youtube && (
                      <span className="text-[11px] text-zinc-500 italic">
                        Instagram / TikTok / YouTube
                      </span>
                    )}
                  </div>

                  <span className="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 truncate max-w-[220px]">
                    {selectedCategoryObj?.title || 'Categoria XMA 2026'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/50 border border-zinc-800 space-y-1.5 text-xs">
                <div className="font-bold text-zinc-200">
                  {formData.workTitle || 'Trabalho / Produção em Destaque'}
                </div>
                <p className="text-zinc-400 text-[11px] line-clamp-3 leading-relaxed">
                  {formData.reason || 'O motivo da indicação aparecerá aqui com os detalhes informados no formulário...'}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800">
                <span>Indicado por: <strong>{formData.submittedByName || 'Jogador PK XD'}</strong> ({formData.submittedByPkxdId || 'Admin#000'})</span>
                <span className="text-amber-400 font-bold">XMA 2026</span>
              </div>
            </div>

            {/* Privacy & Admin Process Card */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Privacidade & Avaliação dos Admins</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                As indicações enviadas pelo público <strong>não são visíveis para outros jogadores</strong>. Elas são enviadas diretamente ao <strong>Painel dos Admins XMA</strong>, onde os organizadores avaliam os perfis das redes sociais e oficializam os concorrentes nas categorias da premiação.
              </p>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
