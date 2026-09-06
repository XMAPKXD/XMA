import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Sparkles, 
  ArrowRight, 
  Vote, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Users, 
  Award, 
  CheckCircle2, 
  Eye, 
  ExternalLink,
  ChevronRight,
  Flame,
  Radio,
  Star,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { Category, Nominee, AppTab, XMANewsArticle, XMA_SCHEDULE } from '../types';

interface HeroHomeProps {
  categories: Category[];
  newsArticles: XMANewsArticle[];
  countdownTargetTimestamp: number;
  onNavigate: (tab: AppTab) => void;
  onSelectCategory?: (category: Category) => void;
  onSelectNominee?: (nominee: Nominee, category: Category) => void;
  onSelectArticle?: (article: XMANewsArticle) => void;
}

export const HeroHome: React.FC<HeroHomeProps> = ({
  categories,
  newsArticles,
  countdownTargetTimestamp,
  onNavigate,
  onSelectCategory,
  onSelectNominee,
  onSelectArticle
}) => {
  // Countdown Timer State & Multi-Phase Calendar
  const [phaseInfo, setPhaseInfo] = useState<{
    phase: 'before_open' | 'voting_open' | 'voting_closed' | 'winners_revealed';
    badge: string;
    title: string;
    description: string;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    phase: 'before_open',
    badge: 'CONTAGEM REGRESSIVA • ABERTURA DAS URNAS',
    title: 'ABERTURA DAS VOTAÇÕES: 10 DE SETEMBRO',
    description: 'O cronômetro oficial marca os dias e horas para a abertura das urnas populares. As votações fecham dia 20 de Setembro e os vencedores serão revelados dia 25 de Setembro.',
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const openTarget = countdownTargetTimestamp || XMA_SCHEDULE.VOTING_OPEN_TIMESTAMP;
      const closeTarget = XMA_SCHEDULE.VOTING_CLOSE_TIMESTAMP;
      const revealTarget = XMA_SCHEDULE.WINNERS_REVEAL_TIMESTAMP;

      if (now < openTarget) {
        // Phase 1: Before voting opens (Counting down to Day 10 at 19:00)
        const diff = openTarget - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setPhaseInfo({
          phase: 'before_open',
          badge: 'CONTAGEM REGRESSIVA • ABERTURA DAS URNAS',
          title: 'ABERTURA DAS VOTAÇÕES: 10 DE SETEMBRO',
          description: 'O cronômetro oficial marca a contagem para a abertura das urnas populares. As votações ficarão abertas até dia 20 de Setembro, e a revelação dos grandes vencedores acontecerá dia 25 de Setembro.',
          days,
          hours,
          minutes,
          seconds
        });
      } else if (now >= openTarget && now < closeTarget) {
        // Phase 2: Voting is open! Counting down to Day 20 at 23:59:59
        const diff = closeTarget - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setPhaseInfo({
          phase: 'voting_open',
          badge: 'URNA OFICIAL DIGITAL ABERTA',
          title: 'VOTAÇÕES ABERTAS — FECHAMENTO DIA 20',
          description: 'As urnas oficiais do XMA estão abertas! Participe com Voto Único Oficial (65%) e Voto em Massa ilimitado (35%). As urnas fecham no dia 20 de Setembro.',
          days,
          hours,
          minutes,
          seconds
        });
      } else if (now >= closeTarget && now < revealTarget) {
        // Phase 3: Voting closed! Counting down to Day 25 at 19:00
        const diff = revealTarget - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setPhaseInfo({
          phase: 'voting_closed',
          badge: 'VOTAÇÕES ENCERRADAS • APURAÇÃO FINAL',
          title: 'REVELAÇÃO DOS VENCEDORES: DIA 25',
          description: 'Urnas encerradas e votos em auditoria de integridade. A grande cerimônia de gala com revelação dos vencedores acontecerá no dia 25 de Setembro!',
          days,
          hours,
          minutes,
          seconds
        });
      } else {
        // Phase 4: Winners revealed!
        setPhaseInfo({
          phase: 'winners_revealed',
          badge: 'VENCEDORES CONSAGRADOS',
          title: 'RESULTADOS OFICIAIS DO XMA 2026',
          description: 'A cerimônia de gala foi realizada e os grandes campeões foram coroados com o Troféu Titânio Dourado!',
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [countdownTargetTimestamp]);

  const totalNominees = categories.reduce((acc, cat) => acc + (cat.nominees?.length || 0), 0);
  const totalVotes = categories.reduce(
    (acc, cat) => acc + cat.nominees.reduce((nSum, n) => nSum + (n.votes || 0), 0),
    0
  );

  const scrollToAbout = () => {
    const el = document.getElementById('como-funciona-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden w-full space-y-24 sm:space-y-32 pb-24">
      {/* Subtle Ambient Golden Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-80 right-[-150px] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] left-[-150px] w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* ========================================================= */}
      {/* 🏆 HERO OPENING (Abertura Extremamente Impactante) */}
      {/* ========================================================= */}
      <section className="pt-12 sm:pt-20 lg:pt-28 text-center max-w-5xl mx-auto px-4 sm:px-6 relative">
        {/* Pre-header badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold tracking-wider mb-6 backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="uppercase font-mono font-bold tracking-widest text-[11px] sm:text-xs">
            EDIÇÃO OFICIAL 2026 • PREMIAÇÃO DA COMUNIDADE
          </span>
        </motion.div>

        {/* Main Logo & Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="space-y-3"
        >
          <h1 className="font-cinzel text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-none">
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-400">
              XMA
            </span>
            <span className="block text-xl sm:text-3xl lg:text-4xl tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 mt-2 font-bold font-['Syne',sans-serif]">
              XD MUSIC & MEDIA AWARDS
            </span>
          </h1>

          {/* Subtitle */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium text-zinc-200 font-cinzel pt-2">
            Celebrando quem transforma a comunidade.
          </h2>

          {/* Supporting paragraph */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400 leading-relaxed pt-2">
            O <strong className="text-amber-300 font-semibold">XMA</strong> reconhece e homenageia criadores, jogadores, músicas, conteúdos e as personalidades que se destacaram e moldaram o universo do PK XD neste ano com paixão, inovação e prestígio.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
        >
          <button
            onClick={() => onNavigate('voting')}
            id="hero-votar-agora-btn"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-amber-500/25 hover:shadow-amber-400/40 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer group"
          >
            <Vote className="w-4 h-4 text-black" />
            <span>VOTAR AGORA</span>
            <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={scrollToAbout}
            id="hero-conheca-btn"
            className="w-full sm:w-auto px-7 py-4 rounded-full bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 text-zinc-200 text-sm font-bold tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <span>CONHEÇA O XMA</span>
          </button>
        </motion.div>

        {/* Subtle Decorative Golden Divider */}
        <div className="mt-16 flex items-center justify-center gap-4 max-w-sm mx-auto">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-amber-500/60" />
          <div className="w-2 h-2 rotate-45 border border-amber-400 bg-amber-400/20" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-500/30 to-amber-500/60" />
        </div>
      </section>

      {/* ========================================================= */}
      {/* ⏱️ CONTAGEM REGRESSIVA (Countdown Elegante) */}
      {/* ========================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl bg-gradient-to-b from-[#12131d] via-[#0d0e16] to-[#07080c] border border-amber-500/30 p-8 sm:p-12 shadow-2xl shadow-black/80 backdrop-blur-2xl text-center overflow-hidden">
          {/* Subtle Corner Accents */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/5 rounded-br-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-amber-500/5 rounded-tl-full pointer-events-none" />

          {/* Header depending on Voting status */}
          <div className="relative z-10 space-y-3 mb-6">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              phaseInfo.phase === 'voting_open'
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                : 'bg-amber-500/15 border border-amber-500/40 text-amber-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                phaseInfo.phase === 'voting_open' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'
              }`} />
              <span>{phaseInfo.badge}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black font-cinzel text-white">
              {phaseInfo.title}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
              {phaseInfo.description}
            </p>
          </div>

          {/* Official 3-Phase Timeline Strip */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-2xl mx-auto mb-8 text-left">
            <div className={`p-3 rounded-2xl border transition-all ${
              phaseInfo.phase === 'before_open'
                ? 'bg-amber-500/15 border-amber-400/60 shadow-lg shadow-amber-500/10'
                : 'bg-zinc-950/60 border-zinc-800/80'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black uppercase text-amber-400">FASE 1 • 10/09</span>
                {phaseInfo.phase !== 'before_open' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="font-bold text-white text-xs mt-0.5">Abertura das Votações</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Urnas liberadas às 19:00</div>
            </div>

            <div className={`p-3 rounded-2xl border transition-all ${
              phaseInfo.phase === 'voting_open'
                ? 'bg-amber-500/15 border-amber-400/60 shadow-lg shadow-amber-500/10'
                : 'bg-zinc-950/60 border-zinc-800/80'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black uppercase text-zinc-400">FASE 2 • 20/09</span>
                {(phaseInfo.phase === 'voting_closed' || phaseInfo.phase === 'winners_revealed') && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <div className="font-bold text-white text-xs mt-0.5">Fechamento das Urnas</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Encerramento às 23:59</div>
            </div>

            <div className={`p-3 rounded-2xl border transition-all ${
              phaseInfo.phase === 'voting_closed' || phaseInfo.phase === 'winners_revealed'
                ? 'bg-amber-500/15 border-amber-400/60 shadow-lg shadow-amber-500/10'
                : 'bg-zinc-950/60 border-zinc-800/80'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black uppercase text-amber-300">FASE 3 • 25/09</span>
                {phaseInfo.phase === 'winners_revealed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="font-bold text-amber-300 text-xs mt-0.5">Revelação dos Vencedores</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Gala ao vivo às 19:00</div>
            </div>
          </div>

          {/* Countdown Clock Display */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto relative z-10">
            <div className="p-4 sm:p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-inner flex flex-col items-center justify-center">
              <span className="text-3xl sm:text-5xl font-black font-cinzel text-white tracking-tight">
                {String(phaseInfo.days).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-amber-300/80 mt-1">
                Dias
              </span>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-inner flex flex-col items-center justify-center">
              <span className="text-3xl sm:text-5xl font-black font-cinzel text-white tracking-tight">
                {String(phaseInfo.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-amber-300/80 mt-1">
                Horas
              </span>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-inner flex flex-col items-center justify-center">
              <span className="text-3xl sm:text-5xl font-black font-cinzel text-white tracking-tight">
                {String(phaseInfo.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-amber-300/80 mt-1">
                Minutos
              </span>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-inner flex flex-col items-center justify-center">
              <span className="text-3xl sm:text-5xl font-black font-cinzel text-amber-400 tracking-tight">
                {String(phaseInfo.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-amber-300/80 mt-1">
                Segundos
              </span>
            </div>
          </div>

          {/* Quick Action under Countdown */}
          <div className="mt-8 relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('voting')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>VOTE NOS SEUS FAVORITOS</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>

            <button
              onClick={() => onNavigate('categories')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>VER CATEGORIAS</span>
            </button>
          </div>

          {/* Metric Stats Banner */}
          <div className="mt-10 pt-8 border-t border-zinc-850/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-black font-cinzel text-amber-300">
                {categories.length}
              </div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">
                Categorias Oficiais
              </div>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-black font-cinzel text-amber-300">
                {totalNominees}
              </div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">
                Indicados de Destaque
              </div>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-black font-cinzel text-amber-300">
                {totalVotes.toLocaleString('pt-BR')}
              </div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">
                Votos Auditados
              </div>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-black font-cinzel text-emerald-400">
                100%
              </div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">
                Gratuito e Livre
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 🔒 TRANSPARÊNCIA E CREDIBILIDADE (Como Funciona) */}
      {/* ========================================================= */}
      <section id="como-funciona-section" className="max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-28">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Processo Oficial</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-cinzel text-white">
            COMO FUNCIONA?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Uma premiação séria, transparente e comprometida em honrar os verdadeiros talentos da comunidade PK XD.
          </p>
        </div>

        {/* 5 Sequential Steps */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-3">
          {[
            {
              step: '01',
              title: 'Definição de Categorias',
              desc: 'O comitê e a comunidade estabelecem as áreas que mais impactaram o ano.'
            },
            {
              step: '02',
              title: 'Seleção dos Indicados',
              desc: 'Curadoria técnica analisa relevância, impacto, criatividade e conduta no jogo.'
            },
            {
              step: '03',
              title: 'Votação Popular Aberta',
              desc: 'Jogadores e fãs votam nos seus favoritos com confirmação transparente.'
            },
            {
              step: '04',
              title: 'Apuração e Auditoria',
              desc: 'Os votos são contabilizados, verificados e protegidos contra fraudes.'
            },
            {
              step: '05',
              title: 'Gala de Resultados',
              desc: 'A grande cerimônia oficial revela os vencedores dos troféus dourados.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative p-5 rounded-2xl bg-zinc-950/70 border border-zinc-850/80 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <span className="font-mono text-xs font-black text-amber-400/70 group-hover:text-amber-300 transition-colors">
                  ETAPA {item.step}
                </span>
                <h4 className="text-sm font-bold text-white font-cinzel leading-snug">
                  {item.title}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bloco de Transparência Detalhado */}
        <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-zinc-950 via-[#0e0f17] to-zinc-950 border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h4 className="text-base sm:text-lg font-bold text-white font-cinzel">
                COMPROMISSO COM A TRANSPARÊNCIA
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              O XMA preza pela integridade absoluta do processo. Nenhuma categoria é comprada, nenhum indicado é favorecido e todas as regras, pesos e critérios são públicos e acessíveis a qualquer momento.
            </p>
          </div>

          <button
            onClick={() => onNavigate('rules')}
            className="shrink-0 px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
          >
            <span>LER REGRAS COMPLETAS</span>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 🏅 CATEGORIAS EM DESTAQUE */}
      {/* ========================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Categorias Oficiais 2026</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-cinzel text-white">
              DISPUTAS DESTA EDIÇÃO
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Conheça as categorias onde os grandes talentos do PK XD estão concorrendo.
            </p>
          </div>

          <button
            onClick={() => onNavigate('categories')}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors cursor-pointer shrink-0"
          >
            <span>VER TODAS AS CATEGORIAS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.slice(0, 6).map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory ? onSelectCategory(cat) : onNavigate('categories')}
              className="p-6 rounded-2xl bg-[#0d0e16] border border-zinc-800/80 hover:border-amber-500/50 hover:bg-[#10111a] transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {cat.nominees?.length || 0} INDICADOS
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white font-cinzel group-hover:text-amber-300 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {cat.description || cat.subtitle}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-850 flex items-center justify-between text-xs">
                <span className="text-zinc-500 text-[11px] font-mono">
                  {cat.sponsor ? `Patrocínio: ${cat.sponsor}` : 'Categoria Oficial'}
                </span>
                <span className="text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Conhecer</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 📰 NOVIDADES DO XMA (News Section) */}
      {/* ========================================================= */}
      {newsArticles && newsArticles.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Cobertura Oficial</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black font-cinzel text-white">
                NOVIDADES DO XMA
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Fique por dentro de todos os comunicados, bastidores e atualizações da premiação.
              </p>
            </div>

            <button
              onClick={() => onNavigate('news')}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors cursor-pointer shrink-0"
            >
              <span>VER TODAS AS NOTÍCIAS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsArticles.slice(0, 3).map((article) => (
              <div
                key={article.id}
                onClick={() => onSelectArticle ? onSelectArticle(article) : onNavigate('news')}
                className="rounded-2xl bg-[#0d0e16] border border-zinc-800/80 hover:border-amber-500/40 overflow-hidden transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/80 backdrop-blur-md border border-amber-500/30 text-amber-300">
                      {article.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mb-2">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      <span>{article.publishedAt}</span>
                      <span>•</span>
                      <span>{article.readTime}</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                      {article.title}
                    </h3>

                    <p className="text-xs text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-850 flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                    <span>Ler notícia completa</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 👑 FINAL CALL TO ACTION (Chamada de Prestígio) */}
      {/* ========================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <div className="relative rounded-3xl bg-gradient-to-r from-amber-950/30 via-zinc-900/70 to-amber-950/30 border border-amber-500/30 p-8 sm:p-14 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h3 className="text-2xl sm:text-4xl font-black font-cinzel text-white leading-tight">
              Faça parte da história do XMA 2026.
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              O seu voto valoriza quem dedica horas criando alegria, arte e amizade para todos nós no PK XD. É rápido, gratuito e seguro.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('voting')}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Vote className="w-4 h-4 text-black" />
                <span>IR PARA A URNA DE VOTAÇÃO</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
