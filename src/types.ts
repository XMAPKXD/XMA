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
  verifiedVotes?: number; // Official logged-in unique votes (75% weight)
  massVotes?: number; // Mass clicks / fan-club multi-votes (25% weight)
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

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return AUTHORIZED_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === clean);
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
}

