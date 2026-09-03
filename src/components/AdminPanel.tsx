import React, { useState, useRef } from 'react';
import { 
  Category, 
  Nominee, 
  CeremonySettings, 
  CeremonySegment, 
  CommunityNomination, 
  PKXDUserAccount,
  isAuthorizedAdminEmail
} from '../types';
import { 
  Shield, 
  Trophy, 
  Crown, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Send, 
  Megaphone, 
  Flame, 
  Users, 
  RotateCcw,
  Volume2,
  Lock,
  Unlock,
  UserPlus,
  ThumbsUp,
  XCircle,
  LogOut,
  Sliders,
  Award,
  AlertTriangle,
  LogIn,
  Check,
  BarChart3,
  Activity,
  Instagram,
  Video,
  Youtube,
  Upload,
  Image as ImageIcon,
  Camera,
  X
} from 'lucide-react';
import { triggerWinnerTrophyBlast, triggerGoldenConfetti } from '../utils/confetti';
import { playFanfare, playAdminGavel, playVoteChime } from '../utils/audio';
import { signInWithGoogle } from '../lib/firebase';
import { AdminVotingStats } from './AdminVotingStats';

interface AdminPanelProps {
  categories: Category[];
  settings: CeremonySettings;
  segments: CeremonySegment[];
  communityNominations: CommunityNomination[];
  userAccount?: PKXDUserAccount;
  onUpdateCategories: (newCategories: Category[]) => void;
  onUpdateSettings: (newSettings: CeremonySettings) => void;
  onUpdateSegments: (newSegments: CeremonySegment[]) => void;
  onUpdateCommunityNominations: (newNominations: CommunityNomination[]) => void;
  onSendAdminMessage: (msg: string) => void;
  onResetData: () => void;
  onLoginAdmin?: (nickname: string, pkxdTag: string, avatarUrl: string, email?: string) => void;
  onOpenLoginModal?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  categories,
  settings,
  segments,
  communityNominations,
  userAccount,
  onUpdateCategories,
  onUpdateSettings,
  onUpdateSegments,
  onUpdateCommunityNominations,
  onSendAdminMessage,
  onResetData,
  onLoginAdmin,
  onOpenLoginModal
}) => {
  const isUserEmailAdmin = isAuthorizedAdminEmail(userAccount?.email);

  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('xma_admin_session_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'nominees' | 'categories' | 'community' | 'envelopes' | 'settings'>('stats');
  
  // Nominee form state
  const [isAddingNominee, setIsAddingNominee] = useState<boolean>(false);
  const [editingNomineeId, setEditingNomineeId] = useState<string | null>(null);
  const nomineeFileInputRef = useRef<HTMLInputElement | null>(null);
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);

  const [nomineeForm, setNomineeForm] = useState<{
    name: string;
    handle: string;
    avatarUrl: string;
    categoryId: string;
    reason: string;
  }>({
    name: '',
    handle: '',
    avatarUrl: '',
    categoryId: categories[0]?.id || '',
    reason: ''
  });

  // Handle local image file upload from mobile or desktop
  const handleNomineePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('A foto é muito grande. Escolha uma imagem de até 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNomineeForm((prev) => ({ ...prev, avatarUrl: String(event.target?.result) }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveNomineePhoto = () => {
    setNomineeForm((prev) => ({ ...prev, avatarUrl: '' }));
    if (nomineeFileInputRef.current) {
      nomineeFileInputRef.current.value = '';
    }
  };

  // Category form state
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<{
    title: string;
    subtitle: string;
    description: string;
    sponsor: string;
  }>({
    title: '',
    subtitle: '',
    description: '',
    sponsor: 'XMA Official'
  });

  // Ticker & Announcement
  const [tickerInput, setTickerInput] = useState<string>(settings.tickerText);
  const [chatAnnouncementInput, setChatAnnouncementInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');

  // Google Admin Sign-in Handler
  const handleGoogleAdminSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setGoogleError(null);
      const googleUser = await signInWithGoogle();
      if (!googleUser || !googleUser.email) {
        setGoogleError('Nenhum e-mail retornado pela autenticação do Google.');
        return;
      }

      const email = googleUser.email.trim().toLowerCase();
      if (isAuthorizedAdminEmail(email)) {
        if (onLoginAdmin) {
          const cleanName = googleUser.displayName || 'Admin XMA';
          const userTag = `#${googleUser.uid.slice(-4) || 'ADM'}`;
          const avatar = googleUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80';
          onLoginAdmin(cleanName, userTag, avatar, googleUser.email);
        }
        setIsUnlocked(true);
        try {
          sessionStorage.setItem('xma_admin_session_unlocked', 'true');
        } catch {}
        playFanfare();
        playAdminGavel();
        triggerGoldenConfetti();
      } else {
        setGoogleError(`Acesso negado. A conta conectada (${googleUser.email}) não possui autorização de Administrador.`);
      }
    } catch (err: any) {
      console.error('Admin Google sign-in error:', err);
      setGoogleError('Falha ao autenticar com o Google. Tente novamente.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleDirectAdminUnlock = () => {
    if (isUserEmailAdmin) {
      setIsUnlocked(true);
      try {
        sessionStorage.setItem('xma_admin_session_unlocked', 'true');
      } catch {}
      playAdminGavel();
      triggerGoldenConfetti();
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    try {
      sessionStorage.removeItem('xma_admin_session_unlocked');
    } catch {}
  };

  // Save / Add Nominee
  const handleSaveNominee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomineeForm.name.trim() || !nomineeForm.categoryId) return;

    const cleanHandle = nomineeForm.handle.trim()
      ? (nomineeForm.handle.trim().startsWith('@') ? nomineeForm.handle.trim() : `@${nomineeForm.handle.trim()}`)
      : '';

    const cleanAvatar = nomineeForm.avatarUrl.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80';

    if (editingNomineeId) {
      // Edit existing (preserve real votes)
      const updated = categories.map((cat) => {
        return {
          ...cat,
          nominees: cat.nominees.map((n) => {
            if (n.id === editingNomineeId) {
              return {
                ...n,
                name: nomineeForm.name.trim(),
                handle: cleanHandle,
                avatarUrl: cleanAvatar,
                categoryId: nomineeForm.categoryId,
                projectTitle: nomineeForm.reason.trim() || 'Indicado Oficial XMA 2026',
                projectDescription: nomineeForm.reason.trim() || '',
                bio: nomineeForm.reason.trim() || '',
                pkxdId: cleanHandle || `#${nomineeForm.name.replace(/\s+/g, '').slice(0, 8)}`
              };
            }
            return n;
          })
        };
      });
      onUpdateCategories(updated);
      setEditingNomineeId(null);
    } else {
      // Create new (starts with 0 votes)
      const newNominee: Nominee = {
        id: `nom-${Date.now()}`,
        name: nomineeForm.name.trim(),
        handle: cleanHandle,
        avatarUrl: cleanAvatar,
        categoryId: nomineeForm.categoryId,
        projectTitle: nomineeForm.reason.trim() || 'Indicado Oficial XMA 2026',
        projectDescription: nomineeForm.reason.trim() || '',
        projectType: 'media_creator',
        pkxdId: cleanHandle || `#${nomineeForm.name.replace(/\s+/g, '').slice(0, 8)}`,
        bio: nomineeForm.reason.trim() || '',
        votes: 0,
        verifiedVotes: 0,
        massVotes: 0
      };
      const updated = categories.map((cat) => {
        if (cat.id === nomineeForm.categoryId) {
          return {
            ...cat,
            nominees: [...cat.nominees, newNominee]
          };
        }
        return cat;
      });
      onUpdateCategories(updated);
      setIsAddingNominee(false);
    }

    // Reset form
    setNomineeForm({
      name: '',
      handle: '',
      avatarUrl: '',
      categoryId: categories[0]?.id || '',
      reason: ''
    });
    if (nomineeFileInputRef.current) {
      nomineeFileInputRef.current.value = '';
    }
    playVoteChime();
  };

  // Delete Nominee
  const handleDeleteNominee = (categoryId: string, nomineeId: string) => {
    if (!confirm('Deseja realmente remover este indicado do XMA?')) return;
    const updated = categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          nominees: cat.nominees.filter((n) => n.id !== nomineeId)
        };
      }
      return cat;
    });
    onUpdateCategories(updated);
  };

  // Save Category
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.title.trim()) return;

    if (editingCategoryId) {
      const updated = categories.map((c) => {
        if (c.id === editingCategoryId) {
          return {
            ...c,
            title: categoryForm.title,
            subtitle: categoryForm.subtitle,
            description: categoryForm.description,
            sponsor: categoryForm.sponsor
          };
        }
        return c;
      });
      onUpdateCategories(updated);
      setEditingCategoryId(null);
    } else {
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        title: categoryForm.title,
        subtitle: categoryForm.subtitle || 'Categoria Oficial XMA 2026',
        iconName: 'Award',
        description: categoryForm.description || 'Categoria de premiação oficial.',
        status: 'voting_open',
        order: categories.length + 1,
        sponsor: categoryForm.sponsor,
        nominees: []
      };
      onUpdateCategories([...categories, newCategory]);
      setIsAddingCategory(false);
    }

    setCategoryForm({
      title: '',
      subtitle: '',
      description: '',
      sponsor: 'XMA Official'
    });
    playVoteChime();
  };

  // Delete Category
  const handleDeleteCategory = (categoryId: string) => {
    if (!confirm('Deseja realmente excluir esta categoria e todos os seus indicados?')) return;
    onUpdateCategories(categories.filter((c) => c.id !== categoryId));
  };

  // Set All Categories Status
  const handleSetAllCategoriesStatus = (status: Category['status']) => {
    const updated = categories.map((c) => ({ ...c, status }));
    onUpdateCategories(updated);
  };

  // Zero out all votes across all nominees
  const handleZeroAllVotes = () => {
    if (!confirm('Tem certeza que deseja zerar todos os votos de todos os indicados?')) return;
    const updated = categories.map((cat) => ({
      ...cat,
      nominees: cat.nominees.map((nom) => ({
        ...nom,
        votes: 0,
        verifiedVotes: 0,
        massVotes: 0
      }))
    }));
    onUpdateCategories(updated);
  };

  // Approve Community Nomination & turn into official nominee
  const handleApproveCommunityNomination = (nom: CommunityNomination) => {
    // 1. Create Nominee
    const targetCatId = categories.some((c) => c.id === nom.categoryId)
      ? nom.categoryId
      : categories[0]?.id || 'cat-revelacao-ano';

    const cleanHandle = nom.nomineeHandle || (nom.instagram ? `@${nom.instagram.replace('@', '')}` : nom.tiktok ? `@${nom.tiktok.replace('@', '')}` : '@pkxd_creator');

    const newNom: Nominee = {
      id: `nom-${Date.now()}`,
      name: nom.nomineeName,
      handle: cleanHandle,
      avatarUrl: nom.avatarUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
      categoryId: targetCatId,
      projectTitle: nom.workTitle || 'Trabalho Aprovado pela Comunidade',
      projectDescription: nom.reason || 'Indicado oficial sugerido pelos fãs.',
      projectType: 'media_creator',
      votes: 0,
      verifiedVotes: 0,
      massVotes: 0,
      pkxdId: nom.nomineePkxdId || '#Admin000',
      bio: nom.reason,
      badge: 'Voz da Comunidade'
    };

    const updatedCategories = categories.map((cat) => {
      if (cat.id === targetCatId) {
        return {
          ...cat,
          nominees: [...cat.nominees, newNom]
        };
      }
      return cat;
    });

    onUpdateCategories(updatedCategories);

    // 2. Mark submission as approved
    const updatedSubmissions = communityNominations.map((n) => {
      if (n.id === nom.id) {
        return { ...n, status: 'approved' as const };
      }
      return n;
    });
    onUpdateCommunityNominations(updatedSubmissions);

    playFanfare();
    triggerWinnerTrophyBlast();
    alert(`🎉 Indicado "${nom.nomineeName}" adicionado oficialmente à categoria com sucesso!`);
  };

  // Reject Community Nomination
  const handleRejectCommunityNomination = (nomId: string) => {
    const updated = communityNominations.map((n) => {
      if (n.id === nomId) {
        return { ...n, status: 'rejected' as const };
      }
      return n;
    });
    onUpdateCommunityNominations(updated);
  };

  // Toggle Category Status (open, closed, winner_revealed)
  const handleSetCategoryStatus = (categoryId: string, status: Category['status']) => {
    const updated = categories.map((cat) => {
      if (cat.id === categoryId) {
        let winnerId = cat.winnerNomineeId;
        if (status === 'winner_revealed' && !winnerId) {
          const sorted = [...cat.nominees].sort((a, b) => b.votes - a.votes);
          winnerId = sorted[0]?.id;
        }
        return {
          ...cat,
          status,
          winnerNomineeId: winnerId
        };
      }
      return cat;
    });
    onUpdateCategories(updated);

    if (status === 'winner_revealed') {
      playFanfare();
      triggerWinnerTrophyBlast();
    }
  };

  // Set Winner Manually
  const handleSetWinnerManually = (categoryId: string, nomineeId: string) => {
    playFanfare();
    triggerWinnerTrophyBlast();
    const updated = categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          status: 'winner_revealed' as const,
          winnerNomineeId: nomineeId
        };
      }
      return cat;
    });
    onUpdateCategories(updated);
  };

  const handleUpdateTicker = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      tickerText: tickerInput
    });
    alert('Letreiro dourado atualizado!');
  };

  const handleSendHostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatAnnouncementInput.trim()) return;
    onSendAdminMessage(`👑 [COMUNICADO ADMINS XMA]: ${chatAnnouncementInput.trim()}`);
    setChatAnnouncementInput('');
    playAdminGavel();
  };

  // ==========================================
  // 🔒 IF LOCKED: DISPLAY SECURITY GATE SCREEN
  // ==========================================
  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 space-y-6">
        <div className="rounded-3xl bg-[#14151e] border-2 border-amber-500/50 p-6 sm:p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-700 p-0.5 mx-auto shadow-xl shadow-amber-500/30">
            <div className="w-full h-full bg-[#0a0a0d] rounded-[14px] flex items-center justify-center">
              <Shield className="w-8 h-8 text-amber-400" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300">
              Área Restrita do Comitê XMA 2026
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-cinzel">
              Acesso <span className="text-gold-metallic">Administrador</span>
            </h1>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              O controle administrativo é restrito exclusivamente aos organizadores autorizados do evento via autenticação Google.
            </p>
          </div>

          {/* Current User State / Google Action */}
          {userAccount?.isLoggedIn && isUserEmailAdmin ? (
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/50 text-left space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={userAccount.avatarUrl}
                  alt={userAccount.nickname}
                  className="w-10 h-10 rounded-xl object-cover border border-emerald-400"
                />
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {userAccount.nickname}
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-mono font-bold">
                      ADMIN AUTORIZADO
                    </span>
                  </div>
                  <div className="text-xs text-zinc-300 font-mono">
                    {userAccount.email}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDirectAdminUnlock}
                className="w-full py-3 rounded-xl bg-gold-metallic-btn text-black font-black uppercase text-xs tracking-wider cursor-pointer shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Entrar no Painel Master XMA
              </button>
            </div>
          ) : userAccount?.isLoggedIn && !isUserEmailAdmin ? (
            <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/50 text-left space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-red-300">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-red-200">Acesso Não Autorizado</div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    A conta conectada não possui privilégios de Administrador. Conecte-se com uma conta Google organizadora.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleAdminSignIn}
                disabled={isGoogleLoading}
                className="w-full py-3 rounded-xl bg-white hover:bg-zinc-100 text-black font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <LogIn className="w-4 h-4 text-amber-600" />
                <span>{isGoogleLoading ? 'Autenticando...' : 'Trocar para Conta Google de Admin'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleAdminSignIn}
                disabled={isGoogleLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-900 font-extrabold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xl shadow-white/10 hover:scale-[1.02] active:scale-95"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isGoogleLoading ? 'Autenticando...' : 'Entrar com Conta Google de Admin'}</span>
              </button>
            </div>
          )}

          {googleError && (
            <div className="p-3 rounded-xl bg-red-900/30 border border-red-500/50 text-red-300 text-xs text-left">
              {googleError}
            </div>
          )}

          <div className="text-[11px] text-zinc-500 pt-2 border-t border-zinc-800">
            Segurança Criptografada • PK XD Music & Media Awards 2026
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🔓 UNLOCKED: FULL MASTER CONTROL DASHBOARD
  // ==========================================
  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#191924] via-[#2a2212] to-[#12131a] border-2 border-amber-500/50 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 border border-amber-400 text-amber-300">
                <Crown className="w-3.5 h-3.5" />
                <span>Painel Master Desbloqueado</span>
              </div>
              {userAccount?.email && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{userAccount.email}</span>
                </div>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-cinzel">
              Painel <span className="text-gold-metallic">Admins XMA</span>
            </h1>
            <p className="text-zinc-300 text-sm max-w-xl">
              Crie novas categorias, adicione e edite indicados, aprove sugestões da comunidade e controle os envelopes oficiais de vencedores.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                triggerGoldenConfetti();
                playFanfare();
              }}
              className="px-4 py-2 rounded-xl bg-gold-metallic-btn text-black font-bold text-xs uppercase flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Canhão de Ouro</span>
            </button>

            <button
              onClick={handleLock}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 text-red-300 hover:text-red-200 border border-zinc-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Bloquear Painel</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'stats', label: '📊 Estatísticas & Auditoria (75/25)', icon: BarChart3 },
            { id: 'nominees', label: '🌟 Indicados Oficiais', icon: Users },
            { id: 'categories', label: '🏆 Categorias do XMA', icon: Trophy },
            { id: 'community', label: `💡 Indicações da Comunidade (${communityNominations.filter(n => n.status === 'pending').length})`, icon: UserPlus },
            { id: 'envelopes', label: '✉️ Envelopes & Vencedores', icon: Crown },
            { id: 'settings', label: '⚙️ Configurações & Senha', icon: Sliders }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-black border-amber-300 shadow-md font-extrabold'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 0. VOTING STATS & SUSPICIOUS SPIKES AUDIT TABLE (75% UNIQUE / 25% MASS WEIGHT) */}
      {activeSubTab === 'stats' && (
        <AdminVotingStats
          categories={categories}
          onUpdateCategories={onUpdateCategories}
        />
      )}

      {/* 1. NOMINEES CRUD MANAGER */}
      {activeSubTab === 'nominees' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#14151e] border border-amber-500/30 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h2 className="text-xl font-bold text-white font-cinzel">
                  Gerenciador de Indicados Oficiais
                </h2>
                <p className="text-xs text-zinc-400">
                  Adicione novos criadores, edite informações e gerencie os concorrentes oficiais do XMA.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingNomineeId(null);
                  setIsAddingNominee(!isAddingNominee);
                }}
                className="px-4 py-2 rounded-xl bg-gold-metallic-btn text-black font-bold text-xs uppercase flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddingNominee ? 'Fechar Formulário' : 'Novo Indicado'}</span>
              </button>
            </div>

            {/* Nominee Form */}
            {isAddingNominee && (
              <form onSubmit={handleSaveNominee} className="p-6 rounded-2xl bg-[#161722] border-2 border-amber-500/40 space-y-5 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-amber-300 font-cinzel flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>{editingNomineeId ? 'Editar Indicado' : 'Cadastrar Novo Indicado'}</span>
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Preencha o nome e selecione a foto direto do seu celular ou arquivo.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-amber-400/80 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                    XMA 2026
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* 1. Nome do Indicado (Obrigatório) */}
                  <div className="sm:col-span-2">
                    <label className="block text-zinc-200 mb-1.5 font-bold text-xs flex items-center justify-between">
                      <span>Nome do Astro / Indicado <span className="text-amber-400">*</span></span>
                      <span className="text-[10px] text-amber-400/80 font-normal">Obrigatório</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={nomineeForm.name}
                      onChange={(e) => setNomineeForm({ ...nomineeForm, name: e.target.value })}
                      placeholder="Ex: Luna Starlight, Peter PK, etc."
                      className="w-full px-3.5 py-2.5 bg-black/80 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50"
                    />
                  </div>

                  {/* 2. Categoria */}
                  <div>
                    <label className="block text-zinc-200 mb-1.5 font-bold text-xs">
                      Categoria Indicada <span className="text-amber-400">*</span>
                    </label>
                    <select
                      value={nomineeForm.categoryId}
                      onChange={(e) => setNomineeForm({ ...nomineeForm, categoryId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-black/80 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Handle / @ (Opcional) */}
                  <div>
                    <label className="block text-zinc-300 mb-1.5 font-semibold text-xs flex items-center justify-between">
                      <span>@ Perfil / Rede Social</span>
                      <span className="text-[10px] text-zinc-500 font-normal">Não obrigatório</span>
                    </label>
                    <input
                      type="text"
                      value={nomineeForm.handle}
                      onChange={(e) => setNomineeForm({ ...nomineeForm, handle: e.target.value })}
                      placeholder="Ex: @lunastarlight_xd (Opcional)"
                      className="w-full px-3.5 py-2.5 bg-black/80 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* 4. Foto do Indicado (Upload direto do celular ou URL) */}
                  <div className="sm:col-span-2 p-4 rounded-xl bg-black/50 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-zinc-200 font-bold text-xs flex items-center gap-2">
                        <Camera className="w-4 h-4 text-amber-400" />
                        <span>Foto do Indicado (Do Celular ou Galeria)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                      >
                        {showUrlInput ? 'Ocultar Link URL' : 'Prefere colar link URL?'}
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Avatar Preview */}
                      <div className="relative shrink-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1 bg-gradient-to-tr from-amber-400 to-amber-700 shadow-md">
                          {nomineeForm.avatarUrl ? (
                            <img
                              src={nomineeForm.avatarUrl}
                              alt="Foto selecionada"
                              className="w-full h-full object-cover rounded-xl bg-zinc-900"
                            />
                          ) : (
                            <div className="w-full h-full bg-zinc-900 rounded-xl flex flex-col items-center justify-center text-zinc-500 gap-1">
                              <ImageIcon className="w-6 h-6 text-zinc-600" />
                              <span className="text-[9px] uppercase font-bold">Sem Foto</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Upload Controls */}
                      <div className="flex-1 space-y-2 w-full text-center sm:text-left">
                        <input
                          ref={nomineeFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleNomineePhotoUpload}
                          className="hidden"
                        />

                        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                          <button
                            type="button"
                            onClick={() => nomineeFileInputRef.current?.click()}
                            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.02]"
                          >
                            <Upload className="w-4 h-4 text-black" />
                            <span>{nomineeForm.avatarUrl ? 'Trocar Foto do Celular' : '📱 Escolher Foto do Celular'}</span>
                          </button>

                          {nomineeForm.avatarUrl && (
                            <button
                              type="button"
                              onClick={handleRemoveNomineePhoto}
                              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-red-300 hover:text-red-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Remover Foto</span>
                            </button>
                          )}
                        </div>

                        <p className="text-[11px] text-zinc-400">
                          Toque no botão para abrir sua galeria ou câmera do celular (PNG, JPG, WebP).
                        </p>
                      </div>
                    </div>

                    {showUrlInput && (
                      <div className="pt-2 border-t border-zinc-800">
                        <label className="block text-zinc-400 mb-1 text-[11px]">Ou digite / cole o link URL da foto:</label>
                        <input
                          type="url"
                          value={nomineeForm.avatarUrl}
                          onChange={(e) => setNomineeForm({ ...nomineeForm, avatarUrl: e.target.value })}
                          placeholder="https://..."
                          className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    )}
                  </div>

                  {/* 5. Motivo / Observação (Opcional) */}
                  <div className="sm:col-span-2">
                    <label className="block text-zinc-300 mb-1 font-semibold text-xs flex items-center justify-between">
                      <span>Motivo da Indicação / Observação</span>
                      <span className="text-[10px] text-zinc-500 font-normal">Não obrigatório</span>
                    </label>
                    <input
                      type="text"
                      value={nomineeForm.reason}
                      onChange={(e) => setNomineeForm({ ...nomineeForm, reason: e.target.value })}
                      placeholder="Ex: Pelo clipe oficial de 2026, destaque da comunidade, etc. (Opcional)"
                      className="w-full px-3.5 py-2.5 bg-black/80 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNominee(false);
                      setEditingNomineeId(null);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gold-metallic-btn text-black font-black text-xs uppercase cursor-pointer shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    {editingNomineeId ? 'Salvar Alterações' : 'Salvar Indicado no XMA'}
                  </button>
                </div>
              </form>
            )}

            {/* Nominees List per Category */}
            <div className="space-y-6">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-800">
                    <span className="font-bold text-amber-300 font-cinzel text-sm">
                      {cat.title} ({cat.nominees.length} {cat.nominees.length === 1 ? 'indicado' : 'indicados'})
                    </span>
                  </div>

                  <div className="space-y-2">
                    {cat.nominees.map((nominee) => (
                      <div
                        key={nominee.id}
                        className="p-3 rounded-xl bg-black/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={nominee.avatarUrl}
                            alt={nominee.name}
                            className="w-11 h-11 rounded-xl object-cover border border-zinc-700 bg-zinc-900 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span className="text-sm">{nominee.name}</span>
                              {nominee.handle && (
                                <span className="text-[11px] font-medium text-amber-400">{nominee.handle}</span>
                              )}
                              {cat.winnerNomineeId === nominee.id && (
                                <span className="px-2 py-0.2 rounded text-[9px] bg-amber-400 text-black font-extrabold">
                                  Vencedor Oficial
                                </span>
                              )}
                            </div>
                            {nominee.projectDescription && (
                              <div className="text-zinc-400 text-[11px] truncate max-w-xs sm:max-w-md">
                                {nominee.projectDescription}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          {/* Read-Only Real Vote Count */}
                          <div className="flex items-center gap-1.5 bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-zinc-800" title="Votos auditados recebidos pelo público">
                            <span className="text-[10px] text-zinc-500 font-medium">Votos:</span>
                            <span className="font-mono font-bold text-amber-300">
                              {nominee.votes.toLocaleString('pt-BR')}
                            </span>
                          </div>

                          {/* Set Winner */}
                          <button
                            onClick={() => handleSetWinnerManually(cat.id, nominee.id)}
                            className="p-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/40 text-amber-300 border border-amber-400/40 cursor-pointer"
                            title="Declarar Vencedor Oficial"
                          >
                            <Crown className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setEditingNomineeId(nominee.id);
                              setNomineeForm({
                                name: nominee.name,
                                handle: nominee.handle || '',
                                avatarUrl: nominee.avatarUrl || '',
                                categoryId: nominee.categoryId,
                                reason: nominee.projectDescription || nominee.bio || ''
                              });
                              setIsAddingNominee(true);
                            }}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteNominee(cat.id, nominee.id)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800 cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. CATEGORIES CRUD MANAGER */}
      {activeSubTab === 'categories' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#14151e] border border-amber-500/30 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h2 className="text-xl font-bold text-white font-cinzel">
                  Gerenciamento de Categorias & Urnas
                </h2>
                <p className="text-xs text-zinc-400">
                  Crie categorias, defina se as urnas estão abertas ou em modo "Apenas Apresentação dos Indicados", ou revele vencedores.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSetAllCategoriesStatus('voting_closed')}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 text-[11px] font-bold cursor-pointer"
                  title="Bloqueia votos em todas as categorias para apenas apresentar os indicados"
                >
                  🔒 Fechar Votos (Apenas Indicados)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetAllCategoriesStatus('voting_open')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold cursor-pointer"
                  title="Abre as urnas para o público votar"
                >
                  🔓 Abrir Votações Gerais
                </button>
                <button
                  type="button"
                  onClick={handleZeroAllVotes}
                  className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 text-[11px] font-bold cursor-pointer"
                  title="Zera a contagem de votos de todos os indicados"
                >
                  🔄 Zerar Votos
                </button>
                <button
                  onClick={() => {
                    setEditingCategoryId(null);
                    setIsAddingCategory(!isAddingCategory);
                  }}
                  className="px-4 py-2 rounded-xl bg-gold-metallic-btn text-black font-bold text-xs uppercase flex items-center gap-2 cursor-pointer self-start sm:self-auto ml-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddingCategory ? 'Cancelar' : 'Nova Categoria'}</span>
                </button>
              </div>
            </div>

            {/* Add/Edit Category Form */}
            {isAddingCategory && (
              <form onSubmit={handleSaveCategory} className="p-5 rounded-2xl bg-zinc-900 border-2 border-amber-500/40 space-y-4 text-xs shadow-xl">
                <h3 className="text-sm font-bold text-amber-300 font-cinzel">
                  {editingCategoryId ? 'Editar Categoria' : 'Criar Nova Categoria Oficial'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-semibold">Nome da Categoria *</label>
                    <input
                      type="text"
                      required
                      value={categoryForm.title}
                      onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
                      placeholder="Ex: Melhor Paródia PK XD"
                      className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-semibold">Patrocinador / Apresentador</label>
                    <input
                      type="text"
                      value={categoryForm.sponsor}
                      onChange={(e) => setCategoryForm({ ...categoryForm, sponsor: e.target.value })}
                      placeholder="Ex: Obsidian Studios"
                      className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-zinc-400 mb-1 font-semibold">Subtítulo / Descrição Curta</label>
                    <input
                      type="text"
                      value={categoryForm.subtitle}
                      onChange={(e) => setCategoryForm({ ...categoryForm, subtitle: e.target.value })}
                      placeholder="Ex: As melhores narrativas e comédias do multiverso"
                      className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(false)}
                    className="px-4 py-2 rounded-xl text-zinc-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gold-metallic-btn text-black font-bold"
                  >
                    Salvar Categoria
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white font-cinzel text-base">{c.title}</h3>
                    <span className="text-xs text-amber-400 font-semibold">{c.sponsor}</span>
                  </div>
                  <p className="text-xs text-zinc-400">{c.subtitle}</p>

                  {/* Status Toggle Bar */}
                  <div className="pt-2">
                    <label className="block text-[11px] text-zinc-400 mb-1 font-semibold">Status da Urna:</label>
                    <div className="grid grid-cols-3 gap-1.5 bg-black/60 p-1 rounded-xl border border-zinc-800">
                      <button
                        type="button"
                        onClick={() => handleSetCategoryStatus(c.id, 'voting_closed')}
                        className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                          c.status === 'voting_closed' || !c.status
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        Apenas Indicados
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetCategoryStatus(c.id, 'voting_open')}
                        className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                          c.status === 'voting_open'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        Votação Aberta
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetCategoryStatus(c.id, 'winner_revealed')}
                        className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                          c.status === 'winner_revealed'
                            ? 'bg-amber-400 text-black font-extrabold shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        Vencedor Revelado
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-zinc-800">
                    <span className="text-zinc-400 font-medium">
                      {c.nominees.length} indicados cadastrados
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingCategoryId(c.id);
                          setCategoryForm({
                            title: c.title,
                            subtitle: c.subtitle,
                            description: c.description,
                            sponsor: c.sponsor || 'XMA Official'
                          });
                          setIsAddingCategory(true);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                        title="Editar Categoria"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteCategory(c.id)}
                        className="p-1.5 rounded-lg bg-red-950/40 text-red-400 border border-red-800/60"
                        title="Excluir Categoria"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. COMMUNITY NOMINATIONS APPROVAL TAB */}
      {activeSubTab === 'community' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#14151e] border border-amber-500/30 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h2 className="text-xl font-bold text-white font-cinzel">
                  Indicações Enviadas pela Comunidade
                </h2>
                <p className="text-xs text-zinc-400">
                  Avalie os astros e criadores sugeridos pelos jogadores. Clique em "Aprovar como Indicado" para adicioná-los instantaneamente à disputa oficial!
                </p>
              </div>

              <span className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold">
                {communityNominations.length} sugestões no total
              </span>
            </div>

            {communityNominations.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                Nenhuma sugestão enviada pela comunidade ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {communityNominations.map((nom) => {
                  const isApproved = nom.status === 'approved';
                  const isRejected = nom.status === 'rejected';

                  return (
                    <div
                      key={nom.id}
                      className={`p-5 rounded-2xl border space-y-4 flex flex-col justify-between ${
                        isApproved
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : isRejected
                          ? 'bg-zinc-900/40 border-zinc-800 opacity-60'
                          : 'bg-zinc-900/90 border-zinc-800'
                      }`}
                    >
                      <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {nom.categoryTitle || 'Categoria XMA'}
                          </span>
                          <span className="text-zinc-500 font-mono text-[10px] flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3 text-amber-400" />
                            {nom.communityLikes} apoios dos fãs
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {nom.avatarUrl ? (
                            <img
                              src={nom.avatarUrl}
                              alt={nom.nomineeName}
                              className="w-12 h-12 rounded-xl object-cover border border-amber-400/60"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-bold text-amber-300 text-sm">
                              {nom.nomineeName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h3 className="text-base font-bold text-white font-cinzel">
                              {nom.nomineeName}
                            </h3>
                            <p className="text-amber-400 font-semibold font-mono text-[11px]">
                              {nom.nomineePkxdId || nom.nomineeHandle}
                            </p>
                          </div>
                        </div>

                        {/* Social Media Links */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {nom.instagram && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-pink-950/60 border border-pink-500/40 text-pink-300 text-[10px] font-medium">
                              <Instagram className="w-3 h-3 text-pink-400" />
                              <span>{nom.instagram}</span>
                            </span>
                          )}
                          {nom.tiktok && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-[10px] font-medium">
                              <Video className="w-3 h-3 text-cyan-400" />
                              <span>{nom.tiktok}</span>
                            </span>
                          )}
                          {nom.youtube && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-[10px] font-medium">
                              <Youtube className="w-3 h-3 text-red-500" />
                              <span>{nom.youtube}</span>
                            </span>
                          )}
                        </div>

                        <div className="p-3 rounded-xl bg-black/60 border border-zinc-800 space-y-1">
                          <div className="font-bold text-zinc-200">
                            Trabalho / Motivo: {nom.workTitle || nom.categoryTitle}
                          </div>
                          <p className="text-zinc-400 text-[11px] leading-relaxed">
                            "{nom.reason}"
                          </p>
                        </div>

                        <div className="text-[11px] text-zinc-500">
                          Sugerido por: <strong className="text-zinc-300">{nom.submittedByName}</strong> ({nom.submittedByPkxdId})
                        </div>
                      </div>

                      <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                        {isApproved ? (
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" /> Oficializado no XMA
                          </span>
                        ) : isRejected ? (
                          <span className="text-xs font-semibold text-zinc-500">
                            Indicação Rejeitada
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleRejectCommunityNomination(nom.id)}
                              className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-red-400 text-xs font-semibold"
                            >
                              Rejeitar
                            </button>
                            <button
                              onClick={() => handleApproveCommunityNomination(nom)}
                              className="px-4 py-1.5 rounded-xl bg-gold-metallic-btn text-black text-xs font-extrabold uppercase flex items-center gap-1.5 cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Aprovar como Indicado Oficial</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. ENVELOPES & VENCEDORES TAB */}
      {activeSubTab === 'envelopes' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#14151e] border border-amber-500/30 space-y-6">
            <h2 className="text-xl font-bold text-white font-cinzel pb-3 border-b border-zinc-800">
              Controle de Envelopes Dourados & Vencedores
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const totalVotes = cat.nominees.reduce((s, n) => s + n.votes, 0);
                const sorted = [...cat.nominees].sort((a, b) => b.votes - a.votes);
                const leader = sorted[0];
                const winner = cat.nominees.find((n) => n.id === cat.winnerNomineeId);

                return (
                  <div key={cat.id} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-amber-400">
                        {cat.sponsor}
                      </span>
                      <h3 className="text-base font-bold text-white font-cinzel">
                        {cat.title}
                      </h3>
                      <div className="text-xs text-zinc-400 mt-1">
                        {totalVotes.toLocaleString('pt-BR')} votos computados
                      </div>
                    </div>

                    {winner && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/50 flex items-center gap-3">
                        <img src={winner.avatarUrl} alt={winner.name} className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <div className="text-[10px] uppercase font-bold text-amber-400">Vencedor Oficial</div>
                          <div className="font-bold text-white text-xs">{winner.name}</div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 pt-2 border-t border-zinc-800">
                      <button
                        onClick={() => handleSetCategoryStatus(cat.id, 'winner_revealed')}
                        className="w-full py-2 rounded-xl bg-gold-metallic-btn text-black font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>Revelar Vencedor Oficial</span>
                      </button>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          onClick={() => handleSetCategoryStatus(cat.id, 'voting_open')}
                          className="py-1.5 rounded-lg bg-zinc-800 text-emerald-400 border border-zinc-700 font-semibold"
                        >
                          Abrir Urna
                        </button>
                        <button
                          onClick={() => handleSetCategoryStatus(cat.id, 'voting_closed')}
                          className="py-1.5 rounded-lg bg-zinc-800 text-red-400 border border-zinc-700 font-semibold"
                        >
                          Fechar Urna
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. SETTINGS & SECURITY TAB */}
      {activeSubTab === 'settings' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#14151e] border border-amber-500/30 space-y-6">
            <h2 className="text-xl font-bold text-white font-cinzel pb-3 border-b border-zinc-800">
              Segurança do Painel & Configurações da Gala
            </h2>

            {/* Community Nominations Status Toggle */}
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-amber-300 font-cinzel">Fase de Indicações da Comunidade</div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {settings.communityNominationsOpen
                    ? 'As indicações públicas estão ABERTAS no momento.'
                    : 'As indicações públicas estão ENCERRADAS. Apenas os indicados oficiais são exibidos na Galeria e Votação.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newState = !settings.communityNominationsOpen;
                  onUpdateSettings({ ...settings, communityNominationsOpen: newState });
                  try {
                    playAdminGavel();
                  } catch {}
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  settings.communityNominationsOpen
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                }`}
              >
                {settings.communityNominationsOpen ? '🟢 Abertas (Clique p/ Fechar)' : '🔴 Encerradas (Clique p/ Abrir)'}
              </button>
            </div>

            {/* Ticker Text */}
            <form onSubmit={handleUpdateTicker} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">
                Texto do Letreiro Dourado Superior (Ticker)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tickerInput}
                  onChange={(e) => setTickerInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-black border border-zinc-700 rounded-xl text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gold-metallic-btn text-black font-bold text-xs uppercase"
                >
                  Atualizar Ticker
                </button>
              </div>
            </form>

            {/* Reset Data Danger Zone */}
            <div className="p-5 rounded-2xl bg-red-950/20 border border-red-800/60 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-red-400">Restaurar Banco de Dados</div>
                <p className="text-xs text-zinc-400">Restaura todas as categorias e indicados originais do XMA 2026.</p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Restaurar todas as categorias e indicados para o padrão original?')) {
                    onResetData();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-red-900/60 hover:bg-red-800 text-red-200 text-xs font-bold"
              >
                Resetar Dados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
