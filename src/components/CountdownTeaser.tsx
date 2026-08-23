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
  ArrowRight
} from 'lucide-react';
import { playClockTick, playGrandReveal, playSlideWhoosh } from '../utils/audio';
import { triggerGoldenConfetti } from '../utils/confetti';

interface CountdownTeaserProps {
  onReveal: () => void;
  targetDate?: Date;
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
  targetDate
}) => {
  // Stable target timestamp: Tomorrow at 13:45 (1:45 PM) or custom targetDate
  const targetTimestamp = useMemo(() => {
    if (targetDate) return targetDate.getTime();
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(13, 45, 0, 0);
    return d.getTime();
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 1000 });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  // View mode: 'teaser' (locked countdown) vs 'revealed_presentation' (explaining XMA after countdown ends)
  const [viewMode, setViewMode] = useState<'teaser' | 'revealing' | 'presentation'>('teaser');
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

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
    if (viewMode !== 'teaser') return;
    setViewMode('revealing');
    playGrandReveal();
    triggerGoldenConfetti();

    // After grand fanfare, transition to the presentation showcase
    setTimeout(() => {
      setViewMode('presentation');
      triggerGoldenConfetti();
    }, 2400);
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
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="text-[11px] tracking-[0.25em] uppercase font-mono text-amber-300/90 font-bold drop-shadow-sm">
            {viewMode === 'teaser' ? 'CONTAGEM REGRESSIVA OFICIAL' : 'REVELAÇÃO OFICIAL XMA'}
          </span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Sound Toggle */}
          {viewMode === 'teaser' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setHasInteracted(true);
                setIsMuted(!isMuted);
                if (isMuted) playClockTick(false);
              }}
              className="px-3 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-amber-300 border border-amber-400/30 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg backdrop-blur-md hover:scale-105 active:scale-95"
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

          {/* Quick Reveal / Trigger Button */}
          {viewMode === 'teaser' ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerRevealSequence();
              }}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 hover:from-amber-500/40 hover:to-amber-400/40 text-amber-200 border border-amber-400/50 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg backdrop-blur-md hover:scale-105 active:scale-95"
              title="Revelar o site agora"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Revelar Agora</span>
            </button>
          ) : (
            <button
              onClick={() => onReveal()}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95"
            >
              <span>Entrar no Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 1. MODO CONTAGEM REGRESSIVA (NÃO REVELA NADA, APENAS XMA, CHUVA DOURADA E TIC-TAC) */}
      {/* ========================================================================= */}
      {viewMode === 'teaser' && (
        <main className="my-auto text-center z-20 flex flex-col items-center px-4 max-w-4xl py-8">
          {/* Glowing Trophy Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="mb-4"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-600 p-[1.5px] mx-auto shadow-2xl shadow-amber-500/40">
              <div className="w-full h-full bg-[#07070b] rounded-[22px] flex items-center justify-center">
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
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
            <h1 className="text-8xl sm:text-9xl md:text-[13rem] font-black font-cinzel tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5C0] via-[#E6B800] to-[#8C6D00] drop-shadow-[0_15px_35px_rgba(230,184,0,0.4)] leading-none select-none">
              XMA
            </h1>
            <div className="absolute -inset-8 bg-amber-400/10 blur-3xl -z-10 rounded-full" />
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="space-y-1.5 mt-2 mb-10"
          >
            <p className="text-xs sm:text-base font-semibold uppercase tracking-[0.4em] text-amber-300/90 font-mono">
              PK XD Music & Media Awards 2026
            </p>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium">
              Grande Estreia Mundial: <strong className="text-amber-300">Amanhã às 13:45 (Horário Oficial)</strong>
            </p>
          </motion.div>

          {/* Countdown Clock Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="grid grid-cols-4 gap-3 sm:gap-6 w-full max-w-xl"
          >
            {/* Days */}
            <div className="flex flex-col items-center">
              <div className="w-full py-4 sm:py-6 rounded-2xl bg-zinc-950/85 border-2 border-amber-500/40 backdrop-blur-xl shadow-xl shadow-amber-500/10 flex items-center justify-center">
                <span className="text-3xl sm:text-5xl md:text-6xl font-black font-cinzel text-white drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">
                  {formatUnit(timeLeft.days)}
                </span>
              </div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-400/90 mt-2">
                Dias
              </span>
            </div>

            {/* Hours */}
            <div className="flex flex-col items-center">
              <div className="w-full py-4 sm:py-6 rounded-2xl bg-zinc-950/85 border-2 border-amber-500/40 backdrop-blur-xl shadow-xl shadow-amber-500/10 flex items-center justify-center">
                <span className="text-3xl sm:text-5xl md:text-6xl font-black font-cinzel text-white drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">
                  {formatUnit(timeLeft.hours)}
                </span>
              </div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-400/90 mt-2">
                Horas
              </span>
            </div>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <div className="w-full py-4 sm:py-6 rounded-2xl bg-zinc-950/85 border-2 border-amber-500/40 backdrop-blur-xl shadow-xl shadow-amber-500/10 flex items-center justify-center">
                <span className="text-3xl sm:text-5xl md:text-6xl font-black font-cinzel text-white drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">
                  {formatUnit(timeLeft.minutes)}
                </span>
              </div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-400/90 mt-2">
                Minutos
              </span>
            </div>

            {/* Seconds (Pulsing with Tic-Tac sound) */}
            <div className="flex flex-col items-center">
              <div className="w-full py-4 sm:py-6 rounded-2xl bg-zinc-950/90 border-2 border-amber-400 backdrop-blur-xl shadow-xl shadow-amber-500/30 flex items-center justify-center relative overflow-hidden">
                <span className="text-3xl sm:text-5xl md:text-6xl font-black font-cinzel text-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] animate-pulse">
                  {formatUnit(timeLeft.seconds)}
                </span>
                <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-300 mt-2">
                Segundos
              </span>
            </div>
          </motion.div>

          {!hasInteracted && (
            <p className="text-[11px] text-amber-400/80 mt-6 animate-bounce flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Clique na tela para ativar o som mecânico de Tic-Tac
            </p>
          )}
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

      {/* Epic Flash / Golden Explosion on Reveal */}
      <AnimatePresence>
        {viewMode === 'revealing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="fixed inset-0 z-50 bg-gradient-to-t from-amber-400 via-amber-200 to-white flex flex-col items-center justify-center text-black"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="text-center space-y-4"
            >
              <Trophy className="w-24 h-24 mx-auto text-black animate-bounce" />
              <h2 className="text-6xl sm:text-8xl font-black font-cinzel tracking-wider">
                XMA 2026
              </h2>
              <p className="text-xl sm:text-2xl font-bold uppercase tracking-widest font-mono">
                A CONTAGEM ENCERROU • APRESENTAÇÃO OFICIAL!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
