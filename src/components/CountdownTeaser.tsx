import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Trophy,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Vote,
  Award,
  Radio,
  Send,
  ShieldCheck,
  Flame,
  Star,
  Users,
  CheckCircle2,
  ArrowRight,
  UserPlus,
  Heart,
  Tag,
  MessageSquare,
  PlusCircle,
  Lightbulb,
  Check,
  Instagram,
  Video,
  Youtube,
  Lock,
  Image as ImageIcon,
  AlertCircle,
  X,
  Search,
  ExternalLink,
  Eye,
  Info,
  Calendar
} from 'lucide-react';
import { Category, Nominee, CommunityNomination, isAuthorizedAdminEmail } from '../types';
import { 
  playClockTick, 
  playGrandReveal, 
  playSlideWhoosh, 
  playVoteChime, 
  playFanfare, 
  playAdminGavel,
  playEpicEntranceSequence 
} from '../utils/audio';
import { triggerGoldenConfetti } from '../utils/confetti';
import { signInWithGoogle } from '../lib/firebase';

interface CountdownTeaserProps {
  onReveal: () => void;
  targetDate?: Date;
  categories?: Category[];
  communityNominations?: CommunityNomination[];
  onSubmitNomination?: (nomination: Omit<CommunityNomination, 'id' | 'createdAt' | 'status' | 'communityLikes'>) => void;
  onLikeNomination?: (nominationId: string) => void;
  userNickname?: string;
  userPkxdTag?: string;
  onAdminUnlock?: (user: { name: string; tag: string; avatar: string; email?: string }) => void;
}

interface SlideInfo {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  highlights: { label: string; desc: string; icon: React.ReactNode }[];
}

export const CountdownTeaser: React.FC<CountdownTeaserProps> = ({
  onReveal,
  targetDate,
  categories = [],
  communityNominations = [],
  onSubmitNomination,
  onLikeNomination,
  userNickname = '',
  userPkxdTag = '',
  onAdminUnlock
}) => {
  // Target timestamp: 15 de Setembro de 2026 às 19:00 (Horário Oficial de Brasília / GMT-3)
  const targetTimestamp = useMemo(() => {
    if (targetDate) return targetDate.getTime();
    // 15 de Setembro de 2026 às 19:00:00 (Mês 8 = Setembro no JS Date)
    return new Date(2026, 8, 15, 19, 0, 0).getTime();
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 1000 });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  // View mode: 'teaser' (locked countdown) vs 'revealing' (epic animation) vs 'presentation' (explaining XMA after countdown ends)
  const [viewMode, setViewMode] = useState<'teaser' | 'revealing' | 'presentation'>('teaser');
  const [revealStage, setRevealStage] = useState<number>(1);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  // Admin session check
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('xma_admin_session_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  // Main active tab in Countdown Teaser: 'nominees' (Indicados até o momento) | 'about' | 'nominate'
  const [activeTeaserTab, setActiveTeaserTab] = useState<'nominees' | 'about' | 'nominate'>('nominees');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchNomineeTerm, setSearchNomineeTerm] = useState<string>('');

  // Selected nominee for detail preview modal
  const [selectedNomineePreview, setSelectedNomineePreview] = useState<{
    nominee: Nominee;
    category: Category;
  } | null>(null);

  // Nomination form state in countdown screen (for admin override / closed view)
  const [showAdminNominationForm, setShowAdminNominationForm] = useState<boolean>(false);
  const [nominationTab, setNominationTab] = useState<'creator' | 'category'>('creator');
  const [nomineeName, setNomineeName] = useState('');
  const [nomineePkxdId, setNomineePkxdId] = useState('');
  const [nomineeInstagram, setNomineeInstagram] = useState('');
  const [nomineeTiktok, setNomineeTiktok] = useState('');
  const [nomineeYoutube, setNomineeYoutube] = useState('');
  const [nomineeAvatarUrl, setNomineeAvatarUrl] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || 'cat-creator-ano');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [nominationReason, setNominationReason] = useState('');
  const [senderName, setSenderName] = useState(userNickname || '');
  const [senderPkxdTag, setSenderPkxdTag] = useState(userPkxdTag || '');
  const [showSuccessBadge, setShowSuccessBadge] = useState(false);
  const [nominationValidationError, setNominationValidationError] = useState<string | null>(null);
  const countdownFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleNominationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNominationValidationError(null);

    if (nominationTab === 'creator') {
      if (!nomineeName.trim()) {
        setNominationValidationError('Informe o nome do criador ou astro indicado.');
        return;
      }

      // Mandatory: At least one of Instagram, TikTok, or YouTube
      const hasIg = nomineeInstagram.trim().length > 0;
      const hasTt = nomineeTiktok.trim().length > 0;
      const hasYt = nomineeYoutube.trim().length > 0;

      if (!hasIg && !hasTt && !hasYt) {
        setNominationValidationError('É obrigatório informar ao menos uma rede social do indicado (Instagram, TikTok ou YouTube).');
        return;
      }

      const targetCat = categories.find((c) => c.id === selectedCategoryId);
      const catTitle = targetCat?.title || 'Categoria XMA 2026';

      let primaryHandle = '';
      if (hasIg) primaryHandle = nomineeInstagram.trim().startsWith('@') ? nomineeInstagram.trim() : `@${nomineeInstagram.trim()}`;
      else if (hasTt) primaryHandle = nomineeTiktok.trim().startsWith('@') ? nomineeTiktok.trim() : `@${nomineeTiktok.trim()}`;
      else if (hasYt) primaryHandle = nomineeYoutube.trim().startsWith('@') ? nomineeYoutube.trim() : `@${nomineeYoutube.trim()}`;

      const newNom: Omit<CommunityNomination, 'id' | 'createdAt' | 'status' | 'communityLikes'> = {
        submittedByName: senderName.trim() || 'Jogador PK XD',
        submittedByPkxdId: senderPkxdTag.trim() ? (senderPkxdTag.trim().startsWith('#') ? senderPkxdTag.trim() : `#${senderPkxdTag.trim()}`) : '#000',
        nomineeName: nomineeName.trim(),
        nomineeHandle: primaryHandle,
        nomineePkxdId: nomineePkxdId.trim() ? (nomineePkxdId.trim().startsWith('#') ? nomineePkxdId.trim() : `#${nomineePkxdId.trim()}`) : '#000',
        instagram: nomineeInstagram.trim() || undefined,
        tiktok: nomineeTiktok.trim() || undefined,
        youtube: nomineeYoutube.trim() || undefined,
        categoryId: selectedCategoryId,
        categoryTitle: catTitle,
        workTitle: nominationReason.trim() || 'Indicação Oficial da Comunidade',
        reason: nominationReason.trim() || 'Destaque e talento no universo PK XD',
        avatarUrl: nomineeAvatarUrl.trim() || undefined
      };

      if (onSubmitNomination) {
        onSubmitNomination(newNom);
      }
    } else {
      // Suggesting category
      if (!customCategoryName.trim()) {
        setNominationValidationError('Informe o nome da categoria sugerida.');
        return;
      }
      const newNom: Omit<CommunityNomination, 'id' | 'createdAt' | 'status' | 'communityLikes'> = {
        submittedByName: senderName.trim() || 'Jogador PK XD',
        submittedByPkxdId: senderPkxdTag.trim() ? (senderPkxdTag.trim().startsWith('#') ? senderPkxdTag.trim() : `#${senderPkxdTag.trim()}`) : '#000',
        nomineeName: customCategoryName.trim(),
        nomineeHandle: '@sugestao_categoria',
        nomineePkxdId: '#XMA2026',
        categoryId: 'cat-sugestao-comunidade',
        categoryTitle: `[NOVA CATEGORIA] ${customCategoryName.trim()}`,
        workTitle: `Sugestão de Categoria: ${customCategoryName.trim()}`,
        reason: nominationReason.trim() || 'Sugestão de nova categoria proposta pela comunidade para a gala oficial'
      };

      if (onSubmitNomination) {
        onSubmitNomination(newNom);
      }
    }

    try {
      playVoteChime();
      triggerGoldenConfetti();
    } catch {}

    setShowSuccessBadge(true);
    setNomineeName('');
    setNomineePkxdId('');
    setNomineeInstagram('');
    setNomineeTiktok('');
    setNomineeYoutube('');
    setNomineeAvatarUrl('');
    setCustomCategoryName('');
    setNominationReason('');
    if (countdownFileInputRef.current) {
      countdownFileInputRef.current.value = '';
    }

    setTimeout(() => {
      setShowSuccessBadge(false);
    }, 6000);
  };

  // Admin Modal & State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleAdminLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setAdminError(null);
      const googleUser = await signInWithGoogle();
      if (!googleUser || !googleUser.email) {
        setAdminError('Nenhum e-mail retornado pelo login do Google.');
        return;
      }

      if (isAuthorizedAdminEmail(googleUser.email)) {
        try {
          sessionStorage.setItem('xma_admin_session_unlocked', 'true');
          setIsAdminUnlocked(true);
          playFanfare();
          playAdminGavel();
          triggerGoldenConfetti();
        } catch {}

        if (onAdminUnlock) {
          onAdminUnlock({
            name: googleUser.displayName || 'Admin XMA',
            tag: `#${googleUser.uid.slice(-4) || 'ADM'}`,
            avatar: googleUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
            email: googleUser.email
          });
        }
        setIsAdminModalOpen(false);
      } else {
        setAdminError(`Acesso negado. O e-mail (${googleUser.email}) não é um Administrador autorizado.`);
      }
    } catch (err: any) {
      console.error('Google admin login error:', err);
      setAdminError('Falha no login do Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAdminLogout = () => {
    try {
      sessionStorage.removeItem('xma_admin_session_unlocked');
      setIsAdminUnlocked(false);
    } catch {}
  };

  const tickToggleRef = useRef<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Slides data explaining XMA and how everything works (Shown ONLY upon countdown completion / reveal)
  const presentationSlides: SlideInfo[] = [
    {
      id: 'what-is-xma',
      badge: 'Gala Oficial PK XD 2026',
      title: 'O que é o XMA?',
      subtitle: 'A Maior Premiação da Comunidade PK XD',
      description:
        'O XMA (PK XD Music & Media Awards) é a cerimônia de gala anual mais aguardada do metaverso. Criada para homenagear, reconhecer e celebrar os maiores criadores de conteúdo, streamers, editores, músicos e personalidades da comunidade PK XD que transformaram o jogo ao longo do ano.',
      icon: <Trophy className="w-8 h-8 text-amber-400" />,
      highlights: [
        {
          label: 'Celebração de Talentos',
          desc: 'Reconhecimento oficial dos melhores YouTubers, TikTokers e Artistas da comunidade.',
          icon: <Star className="w-4 h-4 text-amber-400" />
        },
        {
          label: 'Troféu Oficial XMA Gold',
          desc: 'Os vencedores recebem o troféu lendário e consagração no Hall da Fama.',
          icon: <Award className="w-4 h-4 text-yellow-300" />
        },
        {
          label: 'Comunidade Unida',
          desc: 'Milhares de jogadores de todo o mundo votando e torcendo pelos seus ídolos.',
          icon: <Users className="w-4 h-4 text-amber-300" />
        }
      ]
    },
    {
      id: 'how-voting-works',
      badge: 'Transparência & Fã-Clubes',
      title: 'Como Funcionará a Votação?',
      subtitle: 'Votos Transparentes, Verificados e em Massa',
      description:
        'A arena de votação do XMA combina integridade oficial com a paixão dos fã-clubes. Cada jogador pode votar de forma verificada e autêntica ou impulsionar campanhas de torcida em tempo real para levar seu criador favorito ao topo.',
      icon: <Vote className="w-8 h-8 text-amber-400" />,
      highlights: [
        {
          label: 'Voto Verificado Oficial',
          desc: 'Login seguro com Google garantindo 1 voto oficial por categoria com selo verificado.',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />
        },
        {
          label: 'Campanhas de Torcida em Massa',
          desc: 'Fã-clubes podem acelerar a pontuação com votações contínuas para subir no ranking.',
          icon: <Flame className="w-4 h-4 text-orange-400" />
        },
        {
          label: 'Painel em Tempo Real',
          desc: 'Gráficos e barras dinâmicas que atualizam as porcentagens instantaneamente.',
          icon: <CheckCircle2 className="w-4 h-4 text-amber-400" />
        }
      ]
    },
    {
      id: 'categories-trophies',
      badge: 'Disputas Épicas',
      title: 'Categorias & Indicados',
      subtitle: 'As Disputas Mais Concorridas do Ano',
      description:
        'Diversas categorias que cobrem todos os pilares do universo PK XD: Criador do Ano, Revelação do Ano, Melhor Streamer, Melhor Edição / Gameplay, Hit Musical do Ano e Conteúdo Favorito da Galera.',
      icon: <Award className="w-8 h-8 text-amber-400" />,
      highlights: [
        {
          label: 'Galeria Completa',
          desc: 'Cards luxuosos com biografias, redes sociais e vídeos dos indicados oficiais.',
          icon: <Star className="w-4 h-4 text-amber-300" />
        },
        {
          label: 'Indicações da Comunidade',
          desc: 'A própria comunidade pode sugerir novos nomes que são avaliados pelos Admins.',
          icon: <Send className="w-4 h-4 text-sky-400" />
        },
        {
          label: 'Placar de Liderança',
          desc: 'Acompanhe quem está liderando cada categoria com atualizações instantâneas.',
          icon: <Trophy className="w-4 h-4 text-yellow-400" />
        }
      ]
    },
    {
      id: 'live-ceremony',
      badge: 'Grande Noite de Gala',
      title: 'A Cerimônia ao Vivo',
      subtitle: 'Transmissão, Chat da Torcida & Envelopes',
      description:
        'Na hora da revelação, o site se transforma no palco da Gala Oficial: transmissão ao vivo, chat interativo de torcida com reações instantâneas, e a abertura dramática de envelopes dourados revelando os grandes vencedores.',
      icon: <Radio className="w-8 h-8 text-amber-400" />,
      highlights: [
        {
          label: 'Abertura de Envelopes',
          desc: 'Animações cinematográficas na revelação do grande campeão de cada categoria.',
          icon: <Sparkles className="w-4 h-4 text-amber-300" />
        },
        {
          label: 'Chat de Torcida Interativo',
          desc: 'Envie mensagens e aplausos ao vivo para seus criadores favoritos durante a transmissão.',
          icon: <Users className="w-4 h-4 text-emerald-400" />
        },
        {
          label: 'Efeitos Especiais & Confetes',
          desc: 'Chuva de confetes e efeitos sonoros para celebrar cada momento histórico.',
          icon: <Flame className="w-4 h-4 text-amber-400" />
        }
      ]
    }
  ];

  // Auto-play slideshow timer for presentation mode
  useEffect(() => {
    if (viewMode !== 'presentation' || !isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % presentationSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [viewMode, isAutoPlaying, presentationSlides.length]);

  // Golden falling particles animation on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    interface GoldParticle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      rotation: number;
      rotSpeed: number;
      opacity: number;
      color: string;
      shape: 'rect' | 'circle' | 'star';
    }

    const goldColors = [
      '#FFD700', // Gold
      '#F59E0B', // Amber
      '#FBBF24', // Warm Gold
      '#FEF08A', // Light Gold
      '#D97706', // Deep Gold
      '#FFFFFF'  // Shimmer
    ];

    const particles: GoldParticle[] = Array.from({ length: 90 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 8 + 3,
      speedY: Math.random() * 1.8 + 0.6,
      speedX: (Math.random() - 0.5) * 0.8,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 2,
      opacity: Math.random() * 0.75 + 0.25,
      color: goldColors[Math.floor(Math.random() * goldColors.length)],
      shape: Math.random() > 0.4 ? 'rect' : Math.random() > 0.5 ? 'circle' : 'star'
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = p.size > 6 ? 8 : 2;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Diamond / star shape
          ctx.beginPath();
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(p.size / 2.5, 0);
          ctx.lineTo(0, p.size / 2);
          ctx.lineTo(-p.size / 2.5, 0);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const triggerRevealSequence = () => {
    setViewMode('revealing');
    setRevealStage(1);
    
    // Play the multi-layered epic entrance sequence audio
    playEpicEntranceSequence();
    triggerGoldenConfetti();

    // Stage 1 -> Stage 2 (Golden Shockwaves & Gates Opening)
    setTimeout(() => {
      setRevealStage(2);
      triggerGoldenConfetti();
    }, 2800);

    // Stage 2 -> Stage 3 (Ascending Trophy & Welcome Text)
    setTimeout(() => {
      setRevealStage(3);
      triggerGoldenConfetti();
    }, 5500);

    // Stage 3 -> Transition to presentation slides or direct access
    setTimeout(() => {
      setViewMode('presentation');
      triggerGoldenConfetti();
    }, 8500);
  };

  // Tick calculation & Clock Sound (Active during teaser mode)
  useEffect(() => {
    if (viewMode !== 'teaser') return;

    const calculateTime = () => {
      const now = Date.now();
      const diff = targetTimestamp - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        triggerRevealSequence();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, total: diff });

      // Play mechanical clock tick-tock sound
      if (!isMuted && hasInteracted) {
        tickToggleRef.current = !tickToggleRef.current;
        playClockTick(tickToggleRef.current);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp, isMuted, hasInteracted, viewMode]);

  const handleUserInteract = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      if (viewMode === 'teaser') {
        playClockTick(false);
      }
    }
  };

  const handleSlideChange = (newIndex: number) => {
    setCurrentSlide(newIndex);
    playSlideWhoosh();
    setIsAutoPlaying(false);
  };

  const formatUnit = (num: number) => String(num).padStart(2, '0');
  const currentSlideData = presentationSlides[currentSlide];

  return (
    <div
      id="countdown-teaser-overlay"
      onClick={handleUserInteract}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#040407] text-white select-none overflow-y-auto overflow-x-hidden"
    >
      {/* Background Falling Golden Elements (Canvas) */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      />

      {/* Atmospheric Golden Glow Backgrounds */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/15 via-[#08080f]/90 to-[#020204] z-0 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none z-0 animate-pulse" />

      {/* Top Bar: Controls & Sound Toggle */}
      <header className="w-full max-w-6xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 flex flex-col gap-3 z-20 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-mono text-amber-300/90 font-bold drop-shadow-sm truncate">
              {viewMode === 'teaser' ? 'CONTAGEM REGRESSIVA OFICIAL' : viewMode === 'revealing' ? 'ABERTURA ÉPICA EM ANDAMENTO' : 'REVELAÇÃO OFICIAL XMA'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sound Toggle */}
            {viewMode === 'teaser' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setHasInteracted(true);
                  setIsMuted(!isMuted);
                  if (isMuted) playClockTick(false);
                }}
                className="px-2.5 sm:px-3 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-amber-300 border border-amber-400/30 text-xs font-semibold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-lg backdrop-blur-md hover:scale-105 active:scale-95"
                title={isMuted ? 'Ativar som Tic-Tac' : 'Silenciar Tic-Tac'}
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-[11px] hidden sm:inline">Tic-Tac Mudo</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span className="text-[11px] hidden sm:inline">Tic-Tac Ativo</span>
                  </>
                )}
              </button>
            )}

            {/* Admin Access / Status Button */}
            {!isAdminUnlocked ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAdminModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 hover:from-amber-500/40 hover:to-amber-400/40 text-amber-200 border border-amber-400/50 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg backdrop-blur-md hover:scale-105 active:scale-95"
                title="Acesso exclusivo para administradores e organizadores"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>Acesso Admin 🔐</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span className="hidden sm:inline">Admin Autenticado</span>
                  <span className="sm:hidden">Admin</span>
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdminLogout();
                  }}
                  className="px-2.5 py-1 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-red-300 text-[10px] font-semibold transition-all cursor-pointer"
                  title="Sair da sessão de Admin"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Exclusive Admin Quick Simulation Bar (Only visible after authenticating as Admin) */}
        {isAdminUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-amber-950/80 via-[#18150f] to-amber-950/80 border-2 border-amber-500/60 shadow-xl shadow-amber-950/40 flex flex-col sm:flex-row items-center justify-between gap-2.5"
          >
            <div className="flex items-center gap-2 text-left w-full sm:w-auto">
              <div className="w-7 h-7 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span>👑 Painel de Simulação do Organizador (Admin)</span>
                </div>
                <div className="text-[10px] text-zinc-400 truncate">
                  Você está logado com privilégios de Administrador Oficial do XMA 2026.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerRevealSequence();
                }}
                className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/30 hover:scale-105 active:scale-95 cursor-pointer"
                title="Executar simulação da animação épica de entrada"
              >
                <Play className="w-3.5 h-3.5 text-black fill-black" />
                <span>Simular Animação de Entrada 🎬</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReveal();
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-400/50 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all shadow-sm cursor-pointer"
                title="Ir diretamente para a arena oficial sem contagem"
              >
                Entrar no Site 🔓
              </button>
            </div>
          </motion.div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 1. MODO CONTAGEM REGRESSIVA (NÃO REVELA NADA, APENAS XMA, CHUVA DOURADA E TIC-TAC) */}
      {/* ========================================================================= */}
      {viewMode === 'teaser' && (
        <main className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-10 z-20 flex flex-col items-center text-center flex-1 min-w-0">
          {/* Glowing Trophy Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="mb-3 sm:mb-4"
          >
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-600 p-[1.5px] mx-auto shadow-2xl shadow-amber-500/40">
              <div className="w-full h-full bg-[#07070b] rounded-[14px] sm:rounded-[22px] flex items-center justify-center">
                <Trophy className="w-7 h-7 sm:w-10 sm:h-10 text-amber-400" />
              </div>
            </div>
          </motion.div>

          {/* SÓ A ESCRITA DOURADA "XMA" */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.2 }}
            className="relative"
          >
            <h1 className="text-7xl sm:text-9xl md:text-[12rem] font-black font-cinzel tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5C0] via-[#E6B800] to-[#8C6D00] drop-shadow-[0_15px_35px_rgba(230,184,0,0.4)] leading-none select-none">
              XMA
            </h1>
            <div className="absolute -inset-8 bg-amber-400/10 blur-3xl -z-10 rounded-full" />
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="space-y-1.5 mt-2 mb-6 sm:mb-10 px-2"
          >
            <p className="text-[11px] sm:text-base font-semibold uppercase tracking-[0.25em] sm:tracking-[0.4em] text-amber-300/90 font-mono">
              PK XD Music & Media Awards 2026
            </p>
            <p className="text-[11px] sm:text-sm text-zinc-400 font-medium">
              Grande Estreia Mundial: <strong className="text-amber-300">15 de Setembro às 19:00 (Horário Oficial de Brasília)</strong>
            </p>
          </motion.div>

          {/* Countdown Clock Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6 w-full max-w-xl px-1"
          >
            {/* Days */}
            <div className="flex flex-col items-center">
              <div className="w-full py-3 sm:py-5 md:py-6 rounded-xl sm:rounded-2xl bg-zinc-950/85 border sm:border-2 border-amber-500/40 backdrop-blur-xl shadow-xl shadow-amber-500/10 flex items-center justify-center">
                <span className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-cinzel text-white drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">
                  {formatUnit(timeLeft.days)}
                </span>
              </div>
              <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-amber-400/90 mt-1.5 sm:mt-2">
                Dias
              </span>
            </div>

            {/* Hours */}
            <div className="flex flex-col items-center">
              <div className="w-full py-3 sm:py-5 md:py-6 rounded-xl sm:rounded-2xl bg-zinc-950/85 border sm:border-2 border-amber-500/40 backdrop-blur-xl shadow-xl shadow-amber-500/10 flex items-center justify-center">
                <span className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-cinzel text-white drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">
                  {formatUnit(timeLeft.hours)}
                </span>
              </div>
              <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-amber-400/90 mt-1.5 sm:mt-2">
                Horas
              </span>
            </div>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <div className="w-full py-3 sm:py-5 md:py-6 rounded-xl sm:rounded-2xl bg-zinc-950/85 border sm:border-2 border-amber-500/40 backdrop-blur-xl shadow-xl shadow-amber-500/10 flex items-center justify-center">
                <span className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-cinzel text-white drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">
                  {formatUnit(timeLeft.minutes)}
                </span>
              </div>
              <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-amber-400/90 mt-1.5 sm:mt-2">
                Minutos
              </span>
            </div>

            {/* Seconds (Pulsing with Tic-Tac sound) */}
            <div className="flex flex-col items-center">
              <div className="w-full py-3 sm:py-5 md:py-6 rounded-xl sm:rounded-2xl bg-zinc-950/90 border sm:border-2 border-amber-400 backdrop-blur-xl shadow-xl shadow-amber-500/30 flex items-center justify-center relative overflow-hidden">
                <span className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-cinzel text-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] animate-pulse">
                  {formatUnit(timeLeft.seconds)}
                </span>
                <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              </div>
              <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-amber-300 mt-1.5 sm:mt-2">
                Segundos
              </span>
            </div>
          </motion.div>

          {!hasInteracted && (
            <p className="text-[11px] text-amber-400/80 mt-4 mb-6 animate-bounce flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Clique na tela para ativar o som mecânico de Tic-Tac
            </p>
          )}

          {/* ========================================================================= */}
          {/* ABAS INTERATIVAS NA TELA DE CONTAGEM REGRESSIVA */}
          {/* ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="w-full max-w-5xl mt-8 mb-12 relative z-20 text-left"
          >
            {/* Main Tabs Selector */}
            <div className="flex items-center justify-center p-1.5 bg-zinc-950/90 rounded-2xl sm:rounded-full border-2 border-amber-500/40 backdrop-blur-2xl shadow-xl shadow-amber-950/30 mb-6 max-w-2xl mx-auto flex-wrap sm:flex-nowrap gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTeaserTab('nominees')}
                className={`flex-1 py-2.5 px-4 rounded-xl sm:rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTeaserTab === 'nominees'
                    ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black shadow-lg shadow-amber-500/25 scale-[1.02]'
                    : 'text-zinc-400 hover:text-amber-200 hover:bg-zinc-900/60'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Indicados Revelados</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTeaserTab === 'nominees' ? 'bg-black/20 text-black' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {categories.reduce((acc, c) => acc + (c.nominees?.length || 0), 0)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTeaserTab('about')}
                className={`flex-1 py-2.5 px-4 rounded-xl sm:rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTeaserTab === 'about'
                    ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black shadow-lg shadow-amber-500/25 scale-[1.02]'
                    : 'text-zinc-400 hover:text-amber-200 hover:bg-zinc-900/60'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Sobre o XMA 2026</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTeaserTab('nominate')}
                className={`flex-1 py-2.5 px-4 rounded-xl sm:rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTeaserTab === 'nominate'
                    ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black shadow-lg shadow-amber-500/25 scale-[1.02]'
                    : 'text-zinc-400 hover:text-amber-200 hover:bg-zinc-900/60'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Sugerir Indicado</span>
              </button>
            </div>

            {/* TAB 1: INDICADOS OFICIAIS REVELADOS ATÉ O MOMENTO */}
            {activeTeaserTab === 'nominees' && (
              <div className="space-y-6">
                {/* Showcase Header Banner */}
                <div className="p-6 rounded-3xl bg-gradient-to-b from-[#171824] via-[#10111a] to-[#0a0b12] border-2 border-amber-500/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 border-b border-zinc-800/80 pb-5">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-400/15 border border-amber-400/40 text-amber-300 mb-2">
                        <Star className="w-3.5 h-3.5" />
                        <span>Galeria Oficial de Concorrentes ao Troféu XMA</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black font-cinzel text-white">
                        Indicados Revelados <span className="text-amber-400">Até o Momento</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl">
                        Conheça os criadores, músicas, vídeos e personalidades já confirmados para a disputa. As urnas abrirão oficialmente na grande estreia!
                      </p>
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-72 shrink-0">
                      <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchNomineeTerm}
                        onChange={(e) => setSearchNomineeTerm(e.target.value)}
                        placeholder="Buscar por criador ou #tag..."
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-950/90 border border-zinc-700/80 focus:border-amber-400 text-white text-xs placeholder:text-zinc-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="pt-4 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar relative z-10">
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryFilter('all')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedCategoryFilter === 'all'
                          ? 'bg-amber-400 text-black shadow-md font-extrabold'
                          : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      <span>Todas as Categorias</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-current">
                        {categories.reduce((acc, c) => acc + (c.nominees?.length || 0), 0)}
                      </span>
                    </button>

                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoryFilter(cat.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedCategoryFilter === cat.id
                            ? 'bg-amber-400 text-black shadow-md font-extrabold'
                            : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800'
                        }`}
                      >
                        <span>{cat.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-current">
                          {cat.nominees?.length || 0}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nominees Grid */}
                {(() => {
                  const filteredCats = categories.filter(
                    (cat) => selectedCategoryFilter === 'all' || cat.id === selectedCategoryFilter
                  );

                  let totalShown = 0;

                  return (
                    <div className="space-y-8">
                      {filteredCats.map((cat) => {
                        const matchingNominees = cat.nominees.filter((nom) => {
                          if (!searchNomineeTerm.trim()) return true;
                          const term = searchNomineeTerm.toLowerCase();
                          return (
                            nom.name.toLowerCase().includes(term) ||
                            nom.handle.toLowerCase().includes(term) ||
                            nom.pkxdId.toLowerCase().includes(term) ||
                            nom.projectTitle.toLowerCase().includes(term)
                          );
                        });

                        if (matchingNominees.length === 0) return null;
                        totalShown += matchingNominees.length;

                        return (
                          <div key={cat.id} className="space-y-3">
                            {/* Category Section Title */}
                            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                                  <Trophy className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="text-lg font-black font-cinzel text-white">
                                    {cat.title}
                                  </h4>
                                  <p className="text-[11px] text-zinc-400">{cat.subtitle}</p>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-amber-400/90 font-mono">
                                {matchingNominees.length} {matchingNominees.length === 1 ? 'indicado' : 'indicados'}
                              </span>
                            </div>

                            {/* Nominees Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {matchingNominees.map((nominee) => (
                                <motion.div
                                  key={nominee.id}
                                  whileHover={{ y: -4 }}
                                  className="rounded-2xl bg-gradient-to-b from-[#141522] via-[#0f1018] to-[#0a0a10] border border-amber-500/30 hover:border-amber-400 p-4.5 flex flex-col justify-between space-y-4 shadow-xl transition-all relative overflow-hidden group"
                                >
                                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-all pointer-events-none" />

                                  <div className="space-y-3 relative z-10">
                                    {/* Header with Avatar & Tags */}
                                    <div className="flex items-start gap-3.5">
                                      <div className="relative shrink-0">
                                        <div className="w-16 h-16 rounded-2xl p-[1.5px] bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-600 shadow-lg shadow-amber-500/20">
                                          <img
                                            src={nominee.avatarUrl}
                                            alt={nominee.name}
                                            className="w-full h-full object-cover rounded-[14px] bg-zinc-900"
                                          />
                                        </div>
                                      </div>

                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-300">
                                            {nominee.pkxdId}
                                          </span>
                                          {nominee.badge && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-amber-300 truncate">
                                              {nominee.badge}
                                            </span>
                                          )}
                                        </div>

                                        <h5 className="text-base font-extrabold text-white truncate mt-1">
                                          {nominee.name}
                                        </h5>
                                        <p className="text-xs text-amber-400/90 font-medium truncate">
                                          {nominee.handle}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Project / Work Nominated */}
                                    <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
                                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                                        <Award className="w-3 h-3 text-amber-400" />
                                        <span>Obra / Motivo da Indicação</span>
                                      </div>
                                      <div className="text-xs font-bold text-zinc-200 line-clamp-1">
                                        {nominee.projectTitle}
                                      </div>
                                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-tight">
                                        {nominee.projectDescription || nominee.bio}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Footer Action */}
                                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2 relative z-10">
                                    <span className="text-[10px] font-bold text-amber-400/80 flex items-center gap-1">
                                      <Sparkles className="w-3 h-3 text-amber-400" />
                                      Indicado Oficial
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() => setSelectedNomineePreview({ nominee, category: cat })}
                                      className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 hover:text-amber-200 border border-amber-500/40 hover:border-amber-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                                      <span>Ver Perfil & Obra</span>
                                    </button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                      {totalShown === 0 && (
                        <div className="p-12 text-center rounded-3xl bg-zinc-950/80 border border-zinc-800 text-zinc-400">
                          <p className="text-sm">Nenhum indicado encontrado para os filtros selecionados.</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 2: SOBRE O XMA 2026 (APRESENTAÇÃO INTERATIVA) */}
            {activeTeaserTab === 'about' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="p-6 rounded-3xl bg-gradient-to-b from-[#171824] via-[#10111a] to-[#0a0b12] border-2 border-amber-500/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
                  <div className="text-center max-w-xl mx-auto space-y-2">
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-extrabold uppercase tracking-widest">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Guia Oficial da Premiação</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black font-cinzel text-white">
                      Como Funcionará o <span className="text-amber-400">XMA 2026</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-300">
                      Entenda as etapas da premiação, o sistema de votação e como será a noite da grande cerimônia de gala!
                    </p>
                  </div>
                </div>

                {/* Slides Navigation */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
                  {presentationSlides.map((slide, idx) => (
                    <button
                      key={slide.id}
                      onClick={() => handleSlideChange(idx)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center sm:items-start text-center sm:text-left gap-1 relative overflow-hidden ${
                        currentSlide === idx
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-xl shadow-amber-500/15'
                          : 'bg-zinc-900/70 hover:bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${currentSlide === idx ? 'bg-amber-400 animate-pulse' : 'bg-zinc-700'}`} />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                          Fase 0{idx + 1}
                        </span>
                      </div>
                      <div className="font-bold text-xs truncate w-full text-white">{slide.title}</div>
                    </button>
                  ))}
                </div>

                {/* Slide Card Content */}
                <div className="w-full relative rounded-3xl bg-gradient-to-b from-[#12131c] to-[#0a0b12] border-2 border-amber-500/40 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5 mb-5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center shrink-0">
                        {currentSlideData.icon}
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                          {currentSlideData.badge}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black font-cinzel text-white">
                          {currentSlideData.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() =>
                          handleSlideChange(
                            (currentSlide - 1 + presentationSlides.length) % presentationSlides.length
                          )
                        }
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer"
                        title="Slide Anterior"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          handleSlideChange((currentSlide + 1) % presentationSlides.length)
                        }
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer"
                        title="Próximo Slide"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-amber-300 mb-2 font-cinzel">
                      {currentSlideData.subtitle}
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                      {currentSlideData.description}
                    </p>
                  </div>

                  {/* Highlights */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4">
                    {currentSlideData.highlights.map((item, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700">
                            {item.icon}
                          </div>
                          <h5 className="font-bold text-xs text-white truncate">{item.label}</h5>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-normal">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: INDICAÇÕES ENCERRADAS (COMUNICADO OFICIAL) */}
            {activeTeaserTab === 'nominate' && (
              <div className="w-full max-w-2xl mx-auto rounded-3xl bg-gradient-to-b from-[#151624] via-[#10111a] to-[#0a0b12] border-2 border-amber-500/50 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-amber-950/40 text-left overflow-hidden relative">
                {/* Ambient gold glow */}
                <div className="absolute -top-16 -right-16 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

                {/* Header Closed Status */}
                <div className="relative z-10 space-y-3 border-b border-zinc-800/80 pb-6 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-500/20 border-2 border-red-500/60 text-red-300 animate-pulse">
                    <Lock className="w-3.5 h-3.5 text-red-400" />
                    <span>FASE DE INDICAÇÕES OFICIALMENTE ENCERRADA</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black font-cinzel text-white flex items-center justify-center gap-2">
                    <span>Indicações Encerradas</span>
                    <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-lg mx-auto">
                    O período de envio de sugestões da comunidade foi finalizado com sucesso. O comitê organizador oficial do <strong className="text-amber-300">XMA 2026</strong> já consolidou os indicados de cada categoria!
                  </p>
                </div>

                {/* Status Box & Information */}
                <div className="mt-6 space-y-4 relative z-10">
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-900/60 to-amber-950/40 border border-amber-500/30 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-amber-200 uppercase tracking-wide">
                          Próxima Etapa: Votação Popular Aberta
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          Data da Abertura das Urnas Oficiais
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/70 border border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-zinc-200">15 de Setembro de 2026</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/30">
                        19:00 (BRT)
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Assim que o cronômetro zerar, a plataforma abrirá instantaneamente para que todos os jogadores e fãs do PK XD votem nos seus criadores favoritos!
                    </p>
                  </div>

                  {/* Summary Metric Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                    <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                      <div className="text-lg sm:text-xl font-black font-cinzel text-amber-300">
                        {categories.length}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mt-0.5">
                        Categorias
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                      <div className="text-lg sm:text-xl font-black font-cinzel text-amber-300">
                        {categories.reduce((acc, c) => acc + (c.nominees?.length || 0), 0)}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mt-0.5">
                        Indicados
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 col-span-2 sm:col-span-1">
                      <div className="text-lg sm:text-xl font-black font-cinzel text-emerald-400">
                        100%
                      </div>
                      <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mt-0.5">
                        Auditado
                      </div>
                    </div>
                  </div>

                  {/* Quick Action to view Nominees */}
                  <button
                    type="button"
                    onClick={() => setActiveTeaserTab('nominees')}
                    className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Trophy className="w-4 h-4 text-black" />
                    <span>Ver Indicados Confirmados</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 2. MODO REVELAÇÃO: EXPLICAÇÕES ANIMADAS DO XMA (APARECE APENAS AO ENCERRAR O CRONÔMETRO) */}
      {/* ========================================================================= */}
      {viewMode === 'presentation' && (
        <main className="w-full max-w-5xl mx-auto px-4 py-8 z-20 flex flex-col items-center my-auto">
          {/* Header Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-extrabold uppercase tracking-widest mb-3 shadow-lg shadow-amber-500/20">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span>O Cronômetro Chegou ao Fim • Apresentação Oficial</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-cinzel text-white">
              Bem-vindo ao <span className="text-amber-400">XMA 2026</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto mt-2">
              Conheça como funcionará a maior premiação de música e mídia do metaverso PK XD antes de entrar na arena oficial!
            </p>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full mb-4">
            {presentationSlides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => handleSlideChange(idx)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center sm:items-start text-center sm:text-left gap-1 relative overflow-hidden ${
                  currentSlide === idx
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-xl shadow-amber-500/15'
                    : 'bg-zinc-900/70 hover:bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${currentSlide === idx ? 'bg-amber-400 animate-pulse' : 'bg-zinc-700'}`} />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                    Fase 0{idx + 1}
                  </span>
                </div>
                <div className="font-bold text-xs truncate w-full text-white">{slide.title}</div>
                {currentSlide === idx && isAutoPlaying && (
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 6, ease: 'linear' }}
                    className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-amber-400 to-yellow-200"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Slide Card */}
          <div className="w-full relative rounded-3xl bg-gradient-to-b from-[#12131c] to-[#0a0b12] border-2 border-amber-500/40 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-black overflow-hidden mb-6">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlideData.id}
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="space-y-6 relative z-10"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center shrink-0 shadow-inner shadow-amber-500/20">
                      {currentSlideData.icon}
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                        {currentSlideData.badge}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black font-cinzel text-white">
                        {currentSlideData.title}
                      </h3>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer text-xs flex items-center gap-1"
                      title={isAutoPlaying ? 'Pausar reprodução automática' : 'Iniciar reprodução automática'}
                    >
                      {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() =>
                        handleSlideChange(
                          (currentSlide - 1 + presentationSlides.length) % presentationSlides.length
                        )
                      }
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer"
                      title="Slide Anterior"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        handleSlideChange((currentSlide + 1) % presentationSlides.length)
                      }
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer"
                      title="Próximo Slide"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h4 className="text-base font-bold text-amber-300 mb-2 font-cinzel">
                    {currentSlideData.subtitle}
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {currentSlideData.description}
                  </p>
                </div>

                {/* Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                  {currentSlideData.highlights.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-400/40 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700">
                          {item.icon}
                        </div>
                        <h5 className="font-bold text-xs text-white truncate">{item.label}</h5>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-normal">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Final Call to Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <button
              onClick={() => onReveal()}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-extrabold text-sm sm:text-base flex items-center gap-3 transition-all cursor-pointer shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95"
            >
              <Trophy className="w-5 h-5 text-black" />
              <span>ACESSAR PLATAFORMA OFICIAL DO XMA 2026</span>
              <ArrowRight className="w-5 h-5 text-black" />
            </button>
          </motion.div>
        </main>
      )}

      {/* Footer Info */}
      <footer className="w-full max-w-6xl mx-auto px-4 pb-6 pt-2 text-center z-20">
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-mono">
          XMA 2026 • TODOS OS DIREITOS RESERVADOS • GALA OFICIAL METÁLICA PK XD
        </p>
      </footer>

      {/* Epic Flash / Golden Explosion on Reveal (Multi-Stage Ultra-Chic Entrance Animation) */}
      <AnimatePresence>
        {viewMode === 'revealing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed inset-0 z-50 bg-[#030306] flex flex-col items-center justify-center text-white overflow-hidden select-none"
          >
            {/* 1. Cinematic Curtains & Golden Atmospheric Beams (Hardware Accelerated z-0) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              {/* Grand Golden Ambient Radial Glow (Optimized blur and opacity) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[700px] sm:h-[1000px] bg-radial from-amber-400/20 via-yellow-600/10 to-transparent rounded-full blur-3xl transform-gpu animate-pulse" />

              {/* Ultra Chic Soft Shimmering Light Beams (CSS animated for smooth 60fps) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-36 bg-gradient-to-r from-transparent via-amber-300/15 to-transparent blur-xl pointer-events-none transform-gpu animate-[spin_20s_linear_infinite]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-24 bg-gradient-to-r from-transparent via-yellow-200/10 to-transparent blur-xl pointer-events-none transform-gpu animate-[spin_28s_linear_infinite_reverse]" />

              {/* Gentle Harmonic Wave Rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-amber-300/30 pointer-events-none animate-ping duration-1000" />
            </div>

            {/* 2. Front Stage Interactive & Display Content (High z-index: z-30, strictly ABOVE confetti at z-25) */}
            <div className="relative z-30 px-4 text-center max-w-5xl mx-auto space-y-6 pointer-events-auto">
              {revealStage === 1 && (
                <motion.div
                  key="stage-1"
                  initial={{ opacity: 0, scale: 0.9, y: 25 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.08, y: -20 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-6 flex flex-col items-center transform-gpu"
                >
                  <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-[2rem] p-1.5 bg-gradient-to-tr from-amber-300 via-[#FFF8DC] to-amber-600 shadow-[0_0_60px_rgba(245,158,11,0.5)] flex items-center justify-center transform-gpu transition-transform hover:scale-105 duration-700">
                    <div className="w-full h-full bg-[#08080f]/95 backdrop-blur-md rounded-[1.8rem] flex items-center justify-center">
                      <Trophy className="w-14 h-14 sm:w-20 sm:h-20 text-amber-300 drop-shadow-[0_0_20px_rgba(255,215,0,0.8)] animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-[0.3em] font-mono bg-amber-400/20 border border-amber-400/60 text-amber-300 shadow-lg backdrop-blur-sm">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>FASE 1 • ABERTURA DOS PORTÕES DOURADOS</span>
                    </div>
                    
                    <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-cinzel tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#FFFFFF] via-[#FFE58F] to-[#D4AF37] drop-shadow-[0_10px_30px_rgba(245,158,11,0.5)] leading-none">
                      PREPARE-SE
                    </h2>

                    <p className="text-xs sm:text-lg text-zinc-300 font-mono tracking-[0.2em] uppercase max-w-2xl mx-auto">
                      A maior celebração da história do PK XD está começando...
                    </p>
                  </div>
                </motion.div>
              )}

              {revealStage === 2 && (
                <motion.div
                  key="stage-2"
                  initial={{ opacity: 0, scale: 0.88, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.08, y: -20 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-6 flex flex-col items-center transform-gpu"
                >
                  <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full p-2 bg-gradient-to-tr from-amber-400 via-[#FFFDF0] to-yellow-600 shadow-[0_0_80px_rgba(255,215,0,0.7)] flex items-center justify-center transform-gpu">
                    <div className="w-full h-full bg-[#080812] rounded-full flex items-center justify-center">
                      <Sparkles className="w-16 h-16 sm:w-24 sm:h-24 text-amber-300 animate-spin duration-3000" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-[0.3em] font-mono bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black shadow-xl">
                      <Star className="w-3.5 h-3.5 text-black fill-black" />
                      <span>GRANDE ESTREIA MUNDIAL</span>
                      <Star className="w-3.5 h-3.5 text-black fill-black" />
                    </div>

                    <h1 className="text-6xl sm:text-8xl md:text-[10rem] lg:text-[12rem] font-black font-cinzel tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#FFFFFF] via-[#FFF2B2] to-[#C99700] drop-shadow-[0_15px_45px_rgba(245,158,11,0.7)] leading-none select-none">
                      XMA 2026
                    </h1>

                    <p className="text-base sm:text-xl md:text-2xl font-black uppercase tracking-[0.3em] text-amber-300 font-mono drop-shadow-md">
                      PK XD Music & Media Awards
                    </p>
                  </div>
                </motion.div>
              )}

              {revealStage === 3 && (
                <motion.div
                  key="stage-3"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-6 flex flex-col items-center transform-gpu"
                >
                  <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-[2rem] bg-gradient-to-tr from-amber-300 via-white to-amber-500 p-1.5 shadow-[0_0_80px_rgba(255,255,255,0.8)] flex items-center justify-center transform-gpu">
                    <div className="w-full h-full bg-[#050508]/95 backdrop-blur-md rounded-[1.8rem] flex items-center justify-center">
                      <Trophy className="w-16 h-16 sm:w-24 sm:h-24 text-amber-300 drop-shadow-[0_0_25px_rgba(245,158,11,0.8)]" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-[0.3em] font-mono bg-emerald-500/20 border border-emerald-400 text-emerald-300 shadow-lg backdrop-blur-sm">
                      ✨ GALA & VOTAÇÃO OFICIALMENTE LIBERADAS ✨
                    </span>

                    <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-cinzel text-white drop-shadow-[0_10px_30px_rgba(245,158,11,0.5)] leading-tight">
                      BEM-VINDO À ARENA!
                    </h2>

                    <p className="text-xs sm:text-base text-zinc-300 max-w-xl mx-auto leading-relaxed">
                      Carregando a experiência oficial de gala com som surround, indicados e votação...
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setViewMode('presentation')}
                      className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-black text-xs sm:text-sm uppercase tracking-widest transition-all shadow-xl shadow-amber-400/40 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>Acessar Cerimônia Agora</span>
                      <ArrowRight className="w-4 h-4 text-black" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nominee Details Preview Modal in Countdown Screen */}
      <AnimatePresence>
        {selectedNomineePreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="relative w-full max-w-2xl bg-[#111218] border border-amber-500/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.2)] z-10 text-left"
            >
              {/* Header Banner */}
              <div className="relative h-44 sm:h-52 bg-gradient-to-br from-[#1d1912] via-[#2a2315] to-[#12131a] overflow-hidden p-6 flex flex-col justify-between border-b border-amber-500/20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.25),transparent_60%)]" />
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 border border-amber-400/40 text-amber-300">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    {selectedNomineePreview.category.title}
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedNomineePreview(null)}
                    className="w-9 h-9 rounded-full bg-black/60 border border-zinc-700 text-zinc-300 hover:text-white hover:border-amber-400 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative z-10">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-cinzel">
                    {selectedNomineePreview.nominee.name}
                  </h2>
                  <p className="text-amber-400/90 text-sm font-semibold">{selectedNomineePreview.nominee.handle}</p>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Avatar & Key Stats */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  <div className="relative group shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 bg-gradient-to-tr from-amber-500 via-amber-200 to-amber-700 shadow-xl shadow-amber-500/20">
                      <img
                        src={selectedNomineePreview.nominee.avatarUrl}
                        alt={selectedNomineePreview.nominee.name}
                        className="w-full h-full object-cover rounded-xl bg-black"
                      />
                    </div>
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-zinc-900 border border-zinc-700 text-zinc-300">
                        ID PK XD: {selectedNomineePreview.nominee.pkxdId}
                      </span>
                      {selectedNomineePreview.nominee.badge && (
                        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500/30 to-amber-300/10 border border-amber-400 text-amber-300">
                          {selectedNomineePreview.nominee.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-zinc-300 text-sm leading-relaxed">
                      {selectedNomineePreview.nominee.bio}
                    </p>
                  </div>
                </div>

                {/* Project / Work Nominated */}
                <div className="p-5 rounded-2xl bg-[#161722] border border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                    <Award className="w-4 h-4" />
                    <span>Obra / Projeto Indicado</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedNomineePreview.nominee.projectTitle}
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    {selectedNomineePreview.nominee.projectDescription}
                  </p>
                </div>

                {/* Status notice */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-amber-200/90">
                    <strong>Indicado Oficial Confirmado.</strong> As votações oficiais abrirão pontualmente no encerramento da contagem regressiva em 15 de Setembro às 19:00!
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setSelectedNomineePreview(null)}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Verification Modal */}
      <AnimatePresence>
        {isAdminModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md rounded-3xl bg-gradient-to-b from-[#181926] via-[#10111a] to-[#0a0b12] border-2 border-amber-500/60 p-6 sm:p-8 shadow-2xl shadow-amber-950/60 text-left relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black font-cinzel text-white">
                      Acesso Administrativo
                    </h3>
                    <p className="text-[11px] text-amber-400/90 font-mono">
                      XMA 2026 • Painel de Controle
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed mb-5">
                O site está bloqueado em contagem regressiva até <strong className="text-amber-300">15 de Setembro às 19:00</strong>. Apenas organizadores autorizados podem gerenciar a cerimônia e testar os módulos.
              </p>

              {adminError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-center gap-2">
                  <span className="font-bold">⚠️ {adminError}</span>
                </div>
              )}

              {/* Exclusive Admin Google Login */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleAdminLogin}
                  disabled={isGoogleLoading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>{isGoogleLoading ? 'Verificando Conta Google...' : 'Entrar com Google Oficial Admin'}</span>
                </button>

                <p className="text-[11px] text-zinc-500 text-center">
                  Permitido apenas para e-mails cadastrados na lista oficial de Administradores.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
