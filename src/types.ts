export type CategoryStatus = 'voting_open' | 'voting_closed' | 'winner_revealed';

export interface Nominee {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  categoryId: string;
  projectTitle: string;
  projectDescription: string;
  projectMediaUrl?: string;
  projectType: 'music_clip' | 'media_creator' | 'parody' | 'look_style' | 'breakthrough' | 'community_icon';
  votes: number; // Total gross votes
  verifiedVotes?: number; // Official logged-in unique votes (65% weight - 1 vote per person)
  massVotes?: number; // Mass clicks / fan-club multi-votes without login (35% weight - unlimited)
  pkxdId: string;
  bio: string;
  accentColor?: string;
  badge?: string;
  youtubeUrl?: string;
  thumbnailUrl?: string;
}

export interface SuspiciousVoteSpike {
  id: string;
  nomineeId: string;
  nomineeName: string;
  categoryId: string;
  categoryTitle: string;
  timestamp: string;
  spikeType: 'bot_burst' | 'mass_flood' | 'disproportionate_ratio' | 'rapid_clicks';
  votesCount: number;
  uniqueCount: number;
  massCount: number;
  severity: 'high' | 'medium' | 'low';
  description: string;
}

export interface Category {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  description: string;
  status: CategoryStatus;
  winnerNomineeId?: string;
  nominees: Nominee[];
  order: number;
  sponsor?: string;
}

export interface CommunityNomination {
  id: string;
  submittedByName: string;
  submittedByPkxdId: string;
  nomineeName: string;
  nomineeHandle?: string;
  nomineePkxdId: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  categoryId: string;
  categoryTitle?: string;
  workTitle: string;
  workUrl?: string;
  reason: string;
  avatarUrl?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  communityLikes: number;
}

export const AUTHORIZED_ADMIN_EMAILS = [
  'eukoosh@gmail.com',
  'kawanyuri35@gmail.com'
] as const;

export const ADMIN_MASTER_PINS = [
  'XMA2026',
  'xma2026',
  '2026',
  'ADMIN2026',
  'admin'
] as const;

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return AUTHORIZED_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === clean);
}

export function isValidAdminPin(pin?: string | null): boolean {
  if (!pin) return false;
  const clean = pin.trim().toLowerCase();
  return ADMIN_MASTER_PINS.some((p) => p.toLowerCase() === clean);
}

export interface PKXDUserAccount {
  isLoggedIn: boolean;
  nickname: string;
  email?: string;
  pkxdTag: string; // e.g. '#9921'
  avatarUrl: string;
  favoriteCreator?: string;
  verifiedVotes: Record<string, string>; // categoryId -> nomineeId (1 vote per category)
}

export interface LiveChatMessage {
  id: string;
  userName: string;
  avatarUrl: string;
  userRole?: 'fan' | 'creator' | 'admin' | 'vip';
  message: string;
  timestamp: string;
  isPinned?: boolean;
}

export interface CeremonySegment {
  id: string;
  timeLabel: string;
  title: string;
  host: string;
  type: 'intro' | 'performance' | 'award_category' | 'golden_speech' | 'finale';
  categoryId?: string;
  status: 'upcoming' | 'live' | 'completed';
  description: string;
  highlightMediaUrl?: string;
}

export interface CeremonySettings {
  isLive: boolean;
  streamTitle: string;
  stageSubtitle: string;
  viewerCount: number;
  activeSegmentId: string;
  tickerText: string;
  goldenEnvelopeOpened: boolean;
  revealedWinnerCategoryIds: string[];
  hostName: string;
  coHostName: string;
  soundEffectsEnabled: boolean;
  communityNominationsOpen?: boolean;
  countdownTargetIso?: string;
}

export type AppTab = 
  | 'home' 
  | 'categories' 
  | 'nominees' 
  | 'voting' 
  | 'rules' 
  | 'results' 
  | 'news' 
  | 'community_nominations' 
  | 'ceremony' 
  | 'admin';

export interface XMANewsArticle {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  content: string[];
  category: 'Anúncio' | 'Indicados' | 'Votação' | 'Cerimônia' | 'Bastidores' | 'Regras';
  publishedAt: string;
  readTime: string;
  imageUrl: string;
  featured?: boolean;
}

export interface CookiePreferences {
  essential?: boolean;
  necessary?: boolean;
  analytics: boolean;
  functional?: boolean;
  preferences?: boolean;
  consentGiven?: boolean;
  timestamp?: number;
  acceptedAt?: string;
}

// Official XMA 2026 Dual-Voting System Weights
// 1. Voto em Massa (Sem Login): Votos ilimitados para mutirões de torcida -> Peso 35% (0.35)
// 2. Voto Único Oficial (Com Login): 1 voto por categoria por usuário autenticado -> Peso 65% (0.65)
export const VOTE_WEIGHT_MASS = 0.35; // 35%
export const VOTE_WEIGHT_VERIFIED = 0.65; // 65%

// Cronograma Oficial do XMA 2026:
// 1. Abertura das Votações: 10 de Setembro de 2026 às 19:00 (GMT-3 Brasília)
// 2. Fechamento das Votações: 20 de Setembro de 2026 às 23:59:59 (GMT-3 Brasília)
// 3. Revelação dos Vencedores / Gala Oficial: 25 de Setembro de 2026 às 19:00 (GMT-3 Brasília)
export const XMA_SCHEDULE = {
  // Mês 8 = Setembro no Date do JavaScript
  VOTING_OPEN_TIMESTAMP: new Date(2026, 8, 10, 19, 0, 0).getTime(),
  VOTING_CLOSE_TIMESTAMP: new Date(2026, 8, 20, 23, 59, 59).getTime(),
  WINNERS_REVEAL_TIMESTAMP: new Date(2026, 8, 25, 19, 0, 0).getTime(),
  VOTING_OPEN_ISO: '2026-09-10T19:00:00',
  VOTING_CLOSE_ISO: '2026-09-20T23:59:59',
  WINNERS_REVEAL_ISO: '2026-09-25T19:00:00'
};

export interface NomineeVotingScore {
  uniqueVotes: number;
  massVotes: number;
  totalVotes: number;
  uniqueSharePct: number; // % dentro dos votos com login da categoria
  massSharePct: number; // % dentro dos votos em massa da categoria
  weightedScorePct: number; // (% Único * 0.65) + (% Massa * 0.35)
  weightedAbsoluteScore: number; // (únicos * 0.65) + (massa * 0.35)
}

export function calculateNomineeVotingScores(category: Category): Record<string, NomineeVotingScore> {
  const result: Record<string, NomineeVotingScore> = {};
  if (!category || !category.nominees || category.nominees.length === 0) {
    return result;
  }

  const totalUnique = category.nominees.reduce((sum, n) => sum + (n.verifiedVotes || 0), 0);
  const totalMass = category.nominees.reduce((sum, n) => {
    const m = n.massVotes !== undefined ? n.massVotes : Math.max(0, n.votes - (n.verifiedVotes || 0));
    return sum + m;
  }, 0);

  category.nominees.forEach((n) => {
    const u = n.verifiedVotes || 0;
    const m = n.massVotes !== undefined ? n.massVotes : Math.max(0, n.votes - u);
    const total = u + m;
    const uPct = totalUnique > 0 ? (u / totalUnique) * 100 : 0;
    const mPct = totalMass > 0 ? (m / totalMass) * 100 : 0;
    const weightedScorePct = (totalUnique > 0 || totalMass > 0)
      ? Number(((uPct * VOTE_WEIGHT_VERIFIED) + (mPct * VOTE_WEIGHT_MASS)).toFixed(1))
      : 0;
    const weightedAbsoluteScore = Number(((u * VOTE_WEIGHT_VERIFIED) + (m * VOTE_WEIGHT_MASS)).toFixed(2));

    result[n.id] = {
      uniqueVotes: u,
      massVotes: m,
      totalVotes: total,
      uniqueSharePct: Number(uPct.toFixed(1)),
      massSharePct: Number(mPct.toFixed(1)),
      weightedScorePct,
      weightedAbsoluteScore
    };
  });

  return result;
}


