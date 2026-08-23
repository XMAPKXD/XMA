import React, { useState, useMemo } from 'react';
import { Category, Nominee, SuspiciousVoteSpike } from '../types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  TrendingUp, 
  Activity, 
  Filter, 
  Search, 
  RotateCcw, 
  Flame, 
  Zap, 
  Users, 
  AlertTriangle, 
  Sliders, 
  Download, 
  Plus, 
  Minus, 
  Trash2, 
  Info,
  CheckCircle2,
  Crown,
  Trophy,
  ArrowUpDown,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { playVoteChime, playFanfare, playAdminGavel } from '../utils/audio';
import { triggerGoldenConfetti, triggerWinnerTrophyBlast } from '../utils/confetti';

interface AdminVotingStatsProps {
  categories: Category[];
  onUpdateCategories: (newCategories: Category[]) => void;
}

export const AdminVotingStats: React.FC<AdminVotingStatsProps> = ({
  categories,
  onUpdateCategories
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'clean'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'weightedScore' | 'uniqueVotes' | 'massVotes' | 'totalVotes' | 'riskRatio'>('weightedScore');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [activeViewMode, setActiveViewMode] = useState<'table' | 'spikes_feed' | 'insights'>('table');

  // Interactive spike simulation logs state
  const [simulatedSpikes, setSimulatedSpikes] = useState<SuspiciousVoteSpike[]>([
    {
      id: 'spike-1',
      nomineeId: 'nom-sample-1',
      nomineeName: 'Indicado Sob Análise',
      categoryId: 'cat-creator-ano',
      categoryTitle: 'Criador PK XD do Ano',
      timestamp: 'Hoje às 16:15',
      spikeType: 'mass_flood',
      votesCount: 850,
      uniqueCount: 12,
      massCount: 838,
      severity: 'high',
      description: 'Disparidade extrema: 98.6% dos votos foram cliques em massa em intervalo de 4 minutos.'
    },
    {
      id: 'spike-2',
      nomineeId: 'nom-sample-2',
      nomineeName: 'Top Hit Creator',
      categoryId: 'cat-hit-musical',
      categoryTitle: 'Melhor Hit Musical PK XD',
      timestamp: 'Hoje às 15:40',
      spikeType: 'rapid_clicks',
      votesCount: 420,
      uniqueCount: 35,
      massCount: 385,
      severity: 'medium',
      description: 'Mobilização intensa de fã-clube detectada. Ratio 11x massa/únicos.'
    }
  ]);

  // Weight constants defined by XMA specifications
  const WEIGHT_UNIQUE = 0.75; // 75%
  const WEIGHT_MASS = 0.25;   // 25%

  // Normalize and enrich all nominees with voting metrics
  const processedNominees = useMemo(() => {
    const list: Array<{
      nominee: Nominee;
      category: Category;
      uniqueVotes: number;
      massVotes: number;
      totalVotes: number;
      weightedScore: number;
      massToUniqueRatio: number;
      uniqueSharePercent: number;
      massSharePercent: number;
      categoryWeightedShare: number;
      riskLevel: 'high' | 'medium' | 'clean';
      riskLabel: string;
      riskReason: string;
    }> = [];

    // Calculate category totals for normalization
    const categoryTotalsMap: Record<string, { totalWeighted: number; totalUnique: number; totalMass: number }> = {};
    categories.forEach((cat) => {
      let totalW = 0;
      let totalU = 0;
      let totalM = 0;
      cat.nominees.forEach((nom) => {
        const u = nom.verifiedVotes || 0;
        const m = nom.massVotes !== undefined ? nom.massVotes : Math.max(0, nom.votes - u);
        const w = (u * WEIGHT_UNIQUE) + (m * WEIGHT_MASS);
        totalW += w;
        totalU += u;
        totalM += m;
      });
      categoryTotalsMap[cat.id] = { totalWeighted: totalW, totalUnique: totalU, totalMass: totalM };
    });

    categories.forEach((cat) => {
      cat.nominees.forEach((nom) => {
        const unique = nom.verifiedVotes || 0;
        const mass = nom.massVotes !== undefined ? nom.massVotes : Math.max(0, nom.votes - unique);
        const total = unique + mass;
        const weightedScore = Number(((unique * WEIGHT_UNIQUE) + (mass * WEIGHT_MASS)).toFixed(2));
        
        const ratio = unique > 0 ? Number((mass / unique).toFixed(1)) : (mass > 0 ? 999 : 0);
        
        const uniqueShare = total > 0 ? Number(((unique / total) * 100).toFixed(1)) : 0;
        const massShare = total > 0 ? Number(((mass / total) * 100).toFixed(1)) : 0;

        const catTotals = categoryTotalsMap[cat.id] || { totalWeighted: 1, totalUnique: 1, totalMass: 1 };
        const categoryWeightedShare = catTotals.totalWeighted > 0 
          ? Number(((weightedScore / catTotals.totalWeighted) * 100).toFixed(1)) 
          : 0;

        // Anti-Bot & Suspicious Spike Risk Assessment
        let riskLevel: 'high' | 'medium' | 'clean' = 'clean';
        let riskLabel = 'Orgânico / Legítimo';
        let riskReason = 'Proporção equilibrada entre votos únicos autenticados e cliques de torcida.';

        if (mass >= 400 && unique === 0) {
          riskLevel = 'high';
          riskLabel = 'Pico Crítico (0 Votos Únicos)';
          riskReason = '100% dos votos são cliques repetitivos sem nenhum usuário autenticado.';
        } else if (ratio >= 35 && mass >= 250) {
          riskLevel = 'high';
          riskLabel = 'Anomalia / Autoclicker';
          riskReason = `Disparidade extrema (${ratio}x mais votos em massa que únicos).`;
        } else if (ratio >= 12 && mass >= 100) {
          riskLevel = 'medium';
          riskLabel = 'Mobilização Alta de Torcida';
          riskReason = `Forte concentração de cliques em massa (${massShare}% do total).`;
        }

        list.push({
          nominee: nom,
          category: cat,
          uniqueVotes: unique,
          massVotes: mass,
          totalVotes: total,
          weightedScore,
          massToUniqueRatio: ratio,
          uniqueSharePercent: uniqueShare,
          massSharePercent: massShare,
          categoryWeightedShare,
          riskLevel,
          riskLabel,
          riskReason
        });
      });
    });

    return list;
  }, [categories]);

  // Key Totals
  const overallMetrics = useMemo(() => {
    let totalUnique = 0;
    let totalMass = 0;
    let totalWeighted = 0;
    let suspiciousCount = 0;
    let mediumCount = 0;

    processedNominees.forEach((item) => {
      totalUnique += item.uniqueVotes;
      totalMass += item.massVotes;
      totalWeighted += item.weightedScore;
      if (item.riskLevel === 'high') suspiciousCount++;
      if (item.riskLevel === 'medium') mediumCount++;
    });

    return {
      totalUnique,
      totalMass,
      totalGross: totalUnique + totalMass,
      totalWeighted: Number(totalWeighted.toFixed(2)),
      suspiciousCount,
      mediumCount
    };
  }, [processedNominees]);

  // Filter and Sort Logic
  const filteredNominees = useMemo(() => {
    let result = [...processedNominees];

    // Filter Category
    if (selectedCategoryId !== 'all') {
      result = result.filter((item) => item.category.id === selectedCategoryId);
    }

    // Filter Risk
    if (riskFilter !== 'all') {
      result = result.filter((item) => item.riskLevel === riskFilter);
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.nominee.name.toLowerCase().includes(q) ||
          item.nominee.handle.toLowerCase().includes(q) ||
          item.nominee.pkxdId.toLowerCase().includes(q) ||
          item.category.title.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortBy === 'weightedScore') {
        valA = a.weightedScore;
        valB = b.weightedScore;
      } else if (sortBy === 'uniqueVotes') {
        valA = a.uniqueVotes;
        valB = b.uniqueVotes;
      } else if (sortBy === 'massVotes') {
        valA = a.massVotes;
        valB = b.massVotes;
      } else if (sortBy === 'totalVotes') {
        valA = a.totalVotes;
        valB = b.totalVotes;
      } else if (sortBy === 'riskRatio') {
        valA = a.massToUniqueRatio;
        valB = b.massToUniqueRatio;
      }
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

    return result;
  }, [processedNominees, selectedCategoryId, riskFilter, searchQuery, sortBy, sortOrder]);

  // Adjust votes handler
  const handleModifyVotes = (categoryId: string, nomineeId: string, type: 'unique' | 'mass', delta: number) => {
    const updated = categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          nominees: cat.nominees.map((n) => {
            if (n.id === nomineeId) {
              const u = n.verifiedVotes || 0;
              const m = n.massVotes !== undefined ? n.massVotes : Math.max(0, n.votes - u);
              const newU = type === 'unique' ? Math.max(0, u + delta) : u;
              const newM = type === 'mass' ? Math.max(0, m + delta) : m;
              return {
                ...n,
                verifiedVotes: newU,
                massVotes: newM,
                votes: newU + newM
              };
            }
            return n;
          })
        };
      }
      return cat;
    });
    onUpdateCategories(updated);
    playVoteChime();
  };

  // Sanitize / Purge suspicious bot clicks from a nominee
  const handlePurgeSuspiciousClicks = (categoryId: string, nomineeId: string, nomineeName: string) => {
    if (!confirm(`Deseja aplicar a sanitização anti-bot em "${nomineeName}"? Isso reduzirá 75% dos votos em massa suspeitos preservando 100% dos votos únicos legítimos.`)) {
      return;
    }

    const updated = categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          nominees: cat.nominees.map((n) => {
            if (n.id === nomineeId) {
              const u = n.verifiedVotes || 0;
              const m = n.massVotes !== undefined ? n.massVotes : Math.max(0, n.votes - u);
              const sanitizedMass = Math.round(m * 0.25);
              return {
                ...n,
                verifiedVotes: u,
                massVotes: sanitizedMass,
                votes: u + sanitizedMass
              };
            }
            return n;
          })
        };
      }
      return cat;
    });

    onUpdateCategories(updated);
    playAdminGavel();
    triggerGoldenConfetti();
    alert(`✅ Sanitização aplicada em "${nomineeName}". O ranking agora reflete com precisão os votos ponderados.`);
  };

  // Simulate a live vote spike (to test detection system)
  const handleSimulateSpike = () => {
    if (categories.length === 0 || categories[0].nominees.length === 0) return;
    const cat = categories[0];
    const targetNom = cat.nominees[0];
    const spikeAmount = 250;

    const newSpike: SuspiciousVoteSpike = {
      id: `spike-${Date.now()}`,
      nomineeId: targetNom.id,
      nomineeName: targetNom.name,
      categoryId: cat.id,
      categoryTitle: cat.title,
      timestamp: 'Agora há instantes',
      spikeType: 'bot_burst',
      votesCount: spikeAmount,
      uniqueCount: 2,
      massCount: spikeAmount - 2,
      severity: 'high',
      description: `Surto simulado: +${spikeAmount} cliques em massa gerados em menos de 10 segundos.`
    };

    setSimulatedSpikes((prev) => [newSpike, ...prev.slice(0, 15)]);
    handleModifyVotes(cat.id, targetNom.id, 'mass', spikeAmount);
    playAdminGavel();
    alert(`🚨 Pico simulado adicionado a "${targetNom.name}". Observe o badge de risco na tabela.`);
  };

  // Export audit report
  const handleExportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      formula: 'Score Ponderado = (Votos Únicos * 0.75) + (Votos em Massa * 0.25)',
      overallMetrics,
      data: filteredNominees.map((item) => ({
        nomineeName: item.nominee.name,
        handle: item.nominee.handle,
        category: item.category.title,
        uniqueVotes_75Percent: item.uniqueVotes,
        massVotes_25Percent: item.massVotes,
        grossVotes: item.totalVotes,
        finalWeightedScore: item.weightedScore,
        categoryShare: `${item.categoryWeightedShare}%`,
        riskLevel: item.riskLevel,
        diagnosis: item.riskReason
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-auditoria-votos-xma-2026-${Date.now()}.json`;
    a.click();
    playFanfare();
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner with Official Formula */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#141524] via-[#1f1a10] to-[#12131d] border-2 border-amber-500/50 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Auditoria em Tempo Real & Detecção Anti-Bot</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-[10px] font-mono font-semibold">
                XMA 2026 Engine
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-cinzel">
              Estatísticas & <span className="text-gold-metallic">Auditoria Ponderada</span>
            </h2>
            <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
              Tabela analítica de votações com aplicação da regra de ponderação oficial e sensor inteligente para identificar anomalias, automações e fã-clubes com autoclicker.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSimulateSpike}
              className="px-3.5 py-2 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-500/50 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              title="Injeta uma rajada de votos para testar o detector de picos suspeitos"
            >
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Simular Pico</span>
            </button>

            <button
              onClick={handleExportReport}
              className="px-4 py-2 rounded-xl bg-gold-metallic-btn text-black font-extrabold text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Auditoria</span>
            </button>
          </div>
        </div>

        {/* Rule Highlight Pill */}
        <div className="p-3.5 rounded-2xl bg-black/60 border border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300 shrink-0 font-bold">
              ⚖️
            </div>
            <div>
              <span className="font-bold text-amber-300">Regra de Cálculo de Vencedores: </span>
              <span className="text-zinc-300">
                O <strong className="text-amber-200">Voto Único com Login</strong> compõe <strong className="text-emerald-400">75%</strong> do peso final, enquanto o <strong className="text-blue-200">Voto em Massa da Torcida</strong> compõe <strong className="text-blue-400">25%</strong>.
              </span>
            </div>
          </div>
          <div className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300 font-mono text-[11px] font-bold self-start sm:self-auto shrink-0">
            Score = (Único × 0.75) + (Massa × 0.25)
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Unique Votes */}
        <div className="p-5 rounded-2xl bg-[#13141f] border border-emerald-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Votos Únicos (75% Peso)</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
              0.75x
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-cinzel mt-1">
            {overallMetrics.totalUnique.toLocaleString('pt-BR')}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between">
            <span>Usuários autenticados</span>
            <span className="text-emerald-400 font-bold">
              {overallMetrics.totalGross > 0 ? ((overallMetrics.totalUnique / overallMetrics.totalGross) * 100).toFixed(1) : 0}% do volume
            </span>
          </div>
        </div>

        {/* Card 2: Mass Votes */}
        <div className="p-5 rounded-2xl bg-[#13141f] border border-blue-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-blue-400" />
              <span>Votos em Massa (25% Peso)</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold">
              0.25x
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-cinzel mt-1">
            {overallMetrics.totalMass.toLocaleString('pt-BR')}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between">
            <span>Cliques rápidos de torcida</span>
            <span className="text-blue-400 font-bold">
              {overallMetrics.totalGross > 0 ? ((overallMetrics.totalMass / overallMetrics.totalGross) * 100).toFixed(1) : 0}% do volume
            </span>
          </div>
        </div>

        {/* Card 3: Total Weighted XMA Score */}
        <div className="p-5 rounded-2xl bg-[#13141f] border border-amber-500/40 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Score Ponderado Oficial</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
              Final
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-cinzel mt-1">
            {overallMetrics.totalWeighted.toLocaleString('pt-BR')} <span className="text-xs text-amber-400/80 font-mono">pts</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Total bruto: <strong className="text-white">{overallMetrics.totalGross.toLocaleString('pt-BR')} votos</strong>
          </div>
        </div>

        {/* Card 4: Suspicious Activity Alert */}
        <div className={`p-5 rounded-2xl border shadow-lg relative overflow-hidden transition-all ${
          overallMetrics.suspiciousCount > 0
            ? 'bg-rose-950/30 border-rose-500/60 shadow-rose-950/40'
            : 'bg-[#13141f] border-zinc-800'
        }`}>
          <div className="flex items-center justify-between pb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              overallMetrics.suspiciousCount > 0 ? 'text-rose-400' : 'text-zinc-400'
            }`}>
              <AlertTriangle className="w-4 h-4" />
              <span>Picos Suspeitos</span>
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
              overallMetrics.suspiciousCount > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-zinc-800 text-zinc-400'
            }`}>
              Detector
            </span>
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold font-cinzel mt-1 ${
            overallMetrics.suspiciousCount > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
          }`}>
            {overallMetrics.suspiciousCount} <span className="text-xs font-sans font-medium text-zinc-400">alertas ativos</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {overallMetrics.suspiciousCount > 0 
              ? 'Anomalias de ratio ou autoclicker' 
              : 'Nenhum padrão abusivo grave detectado'}
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveViewMode('table')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeViewMode === 'table'
              ? 'bg-amber-400 text-black shadow-md font-extrabold'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Tabela Geral de Votação em Tempo Real</span>
        </button>

        <button
          onClick={() => setActiveViewMode('spikes_feed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeViewMode === 'spikes_feed'
              ? 'bg-amber-400 text-black shadow-md font-extrabold'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Log de Picos Suspeitos ({simulatedSpikes.length})</span>
        </button>
      </div>

      {/* TABLE VIEW */}
      {activeViewMode === 'table' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            {/* Left Controls: Search & Category */}
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar indicado, handle ou PK XD ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-black border border-zinc-700 text-white placeholder:text-zinc-500 text-xs focus:border-amber-400 outline-none"
                />
              </div>

              {/* Category Dropdown */}
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-black border border-zinc-700 text-white text-xs outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="all">🏆 Todas as Categorias ({categories.length})</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title} ({cat.nominees.length} indicados)
                  </option>
                ))}
              </select>

              {/* Risk Level Filter */}
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value as typeof riskFilter)}
                className="px-3 py-2 rounded-xl bg-black border border-zinc-700 text-white text-xs outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="all">🔍 Todos os Níveis de Risco</option>
                <option value="high">🔴 Apenas Picos Críticos / Suspeitos</option>
                <option value="medium">🟡 Mobilização Alta de Torcida</option>
                <option value="clean">🟢 Votos Orgânicos / Legítimos</option>
              </select>
            </div>

            {/* Right Controls: Sort */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <span className="text-zinc-500 font-semibold">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 rounded-xl bg-black border border-zinc-700 text-amber-300 font-bold text-xs outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="weightedScore">🌟 Score Ponderado (75/25)</option>
                <option value="uniqueVotes">🛡️ Votos Únicos (75%)</option>
                <option value="massVotes">⚡ Votos em Massa (25%)</option>
                <option value="totalVotes">📊 Total Bruto de Votos</option>
                <option value="riskRatio">🚨 Taxa de Anomalia / Ratio</option>
              </select>

              <button
                onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 cursor-pointer"
                title={`Ordem: ${sortOrder === 'desc' ? 'Decrescente' : 'Crescente'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-3xl bg-[#13141f] border border-zinc-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-black/60 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-mono text-[10px]">
                    <th className="py-3.5 px-4 font-bold"># Rank</th>
                    <th className="py-3.5 px-4 font-bold">Indicado & Categoria</th>
                    <th className="py-3.5 px-4 font-bold text-center">
                      <div className="text-emerald-400">Votos Únicos</div>
                      <div className="text-[9px] text-zinc-500 font-normal">Peso 75% • Autenticado</div>
                    </th>
                    <th className="py-3.5 px-4 font-bold text-center">
                      <div className="text-blue-400">Votos em Massa</div>
                      <div className="text-[9px] text-zinc-500 font-normal">Peso 25% • Torcida</div>
                    </th>
                    <th className="py-3.5 px-4 font-bold text-center">
                      <div className="text-white">Total Bruto</div>
                      <div className="text-[9px] text-zinc-500 font-normal">Soma dos Cliques</div>
                    </th>
                    <th className="py-3.5 px-4 font-bold text-center">
                      <div className="text-amber-300">Score Ponderado</div>
                      <div className="text-[9px] text-amber-500/80 font-normal">Resultado Oficial XMA</div>
                    </th>
                    <th className="py-3.5 px-4 font-bold">Diagnóstico Anti-Bot</th>
                    <th className="py-3.5 px-4 font-bold text-right">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {filteredNominees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-500">
                        Nenhum indicado encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredNominees.map((item, index) => {
                      const isFirst = index === 0 && sortBy === 'weightedScore';
                      const ratio = item.massToUniqueRatio;

                      return (
                        <tr
                          key={`${item.category.id}-${item.nominee.id}`}
                          className={`hover:bg-zinc-800/40 transition-colors ${
                            isFirst ? 'bg-amber-500/5' : ''
                          }`}
                        >
                          {/* Rank */}
                          <td className="py-3.5 px-4 font-mono font-bold">
                            <div className="flex items-center gap-1.5">
                              {isFirst ? (
                                <Crown className="w-4 h-4 text-amber-400" />
                              ) : (
                                <span className="text-zinc-400">#{index + 1}</span>
                              )}
                            </div>
                          </td>

                          {/* Nominee Profile */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.nominee.avatarUrl}
                                alt={item.nominee.name}
                                className="w-10 h-10 rounded-xl object-cover border border-zinc-700 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                                  <span>{item.nominee.name}</span>
                                  {item.nominee.badge && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-400/40">
                                      {item.nominee.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-zinc-400 font-mono truncate">
                                  {item.nominee.handle} • {item.nominee.pkxdId}
                                </div>
                                <div className="text-[10px] text-amber-400/80 truncate font-semibold mt-0.5">
                                  📁 {item.category.title}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Unique Votes (75%) */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="font-mono font-bold text-emerald-300 text-sm">
                              {item.uniqueVotes.toLocaleString('pt-BR')}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-mono">
                              {item.uniqueSharePercent}% • {(item.uniqueVotes * WEIGHT_UNIQUE).toFixed(1)} pts
                            </div>
                          </td>

                          {/* Mass Votes (25%) */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="font-mono font-bold text-blue-300 text-sm">
                              {item.massVotes.toLocaleString('pt-BR')}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-mono">
                              {item.massSharePercent}% • {(item.massVotes * WEIGHT_MASS).toFixed(1)} pts
                            </div>
                          </td>

                          {/* Total Gross */}
                          <td className="py-3.5 px-4 text-center font-mono font-semibold text-zinc-300 text-xs">
                            {item.totalVotes.toLocaleString('pt-BR')}
                          </td>

                          {/* Weighted Score */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-block px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/60 shadow-sm">
                              <div className="font-mono font-extrabold text-amber-300 text-sm">
                                {item.weightedScore.toLocaleString('pt-BR')}
                              </div>
                              <div className="text-[9px] text-amber-400/90 font-mono font-bold">
                                {item.categoryWeightedShare}% da cat.
                              </div>
                            </div>
                          </td>

                          {/* Anti-Bot Diagnosis */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  item.riskLevel === 'high'
                                    ? 'bg-rose-950/80 border border-rose-500 text-rose-300 animate-pulse'
                                    : item.riskLevel === 'medium'
                                    ? 'bg-yellow-950/80 border border-yellow-500 text-yellow-300'
                                    : 'bg-emerald-950/80 border border-emerald-500 text-emerald-300'
                                }`}
                              >
                                {item.riskLevel === 'high' ? '🔴' : item.riskLevel === 'medium' ? '🟡' : '🟢'}{' '}
                                {item.riskLabel}
                              </span>
                              <p className="text-[10px] text-zinc-400 max-w-xs line-clamp-1" title={item.riskReason}>
                                {item.riskReason}
                              </p>
                              {ratio > 0 && (
                                <div className="text-[9px] text-zinc-500 font-mono">
                                  Ratio Massa/Único: <strong className="text-zinc-300">{ratio}x</strong>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {item.riskLevel === 'high' && (
                                <button
                                  onClick={() => handlePurgeSuspiciousClicks(item.category.id, item.nominee.id, item.nominee.name)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-500 text-rose-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                                  title="Expurgar 75% dos cliques em massa suspeitos"
                                >
                                  <ShieldAlert className="w-3 h-3 text-rose-400" />
                                  <span>Purgar Bots</span>
                                </button>
                              )}

                              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-700">
                                <button
                                  onClick={() => handleModifyVotes(item.category.id, item.nominee.id, 'unique', 10)}
                                  className="px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-300 hover:bg-emerald-900 text-[10px] font-bold"
                                  title="+10 Votos Únicos (75% peso)"
                                >
                                  +10 Únicos
                                </button>
                                <button
                                  onClick={() => handleModifyVotes(item.category.id, item.nominee.id, 'mass', 50)}
                                  className="px-2 py-0.5 rounded-lg bg-blue-950 text-blue-300 hover:bg-blue-900 text-[10px] font-bold"
                                  title="+50 Votos em Massa (25% peso)"
                                >
                                  +50 Massa
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SPIKES FEED VIEW */}
      {activeViewMode === 'spikes_feed' && (
        <div className="p-6 rounded-3xl bg-[#13141f] border border-amber-500/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-white font-cinzel">
                Monitor de Picos e Disparidades em Tempo Real
              </h3>
              <p className="text-xs text-zinc-400">
                Histórico cronológico de rajadas de votos e desvios de padrão detectados pelos algoritmos do XMA.
              </p>
            </div>

            <button
              onClick={() => setSimulatedSpikes([])}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
            >
              Limpar Feed
            </button>
          </div>

          <div className="space-y-3">
            {simulatedSpikes.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                Nenhum pico recente registrado. Use o botão "Simular Pico" para testar o sistema.
              </div>
            ) : (
              simulatedSpikes.map((spike) => (
                <div
                  key={spike.id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    spike.severity === 'high'
                      ? 'bg-rose-950/30 border-rose-500/60 text-rose-200'
                      : 'bg-yellow-950/30 border-yellow-500/60 text-yellow-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-black/50 flex items-center justify-center text-base shrink-0">
                      {spike.severity === 'high' ? '🚨' : '⚠️'}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-white text-sm">{spike.nomineeName}</strong>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 font-mono text-zinc-300">
                          {spike.categoryTitle}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">{spike.timestamp}</span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-1">{spike.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 font-mono text-[11px]">
                    <div className="px-2.5 py-1 rounded-lg bg-black/60 border border-zinc-700">
                      ⚡ +{spike.massCount} Massa
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-black/60 border border-zinc-700 text-emerald-400">
                      🛡️ {spike.uniqueCount} Únicos
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
