import { Category, CeremonySegment, CeremonySettings, LiveChatMessage, CommunityNomination } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-creator-ano',
    title: 'Criador PK XD do Ano',
    subtitle: 'O maior destaque em conteúdo e engajamento da comunidade',
    iconName: 'Crown',
    description: 'Reconhece o criador de conteúdo que dominou o multiverso PK XD com gameplay lendário, interações e presença marcante.',
    status: 'voting_open',
    order: 1,
    sponsor: 'XD Universe Studios',
    nominees: []
  },
  {
    id: 'cat-hit-musical',
    title: 'Melhor Hit Musical PK XD',
    subtitle: 'A faixa musical que embalou as festas e palcos do ano',
    iconName: 'Music',
    description: 'Faixas originais, paródias musicais e trilhas sonoras autorais criadas inspiradas no universo PK XD.',
    status: 'voting_open',
    order: 2,
    sponsor: 'Cyber Sound Records',
    nominees: []
  },
  {
    id: 'cat-clipe-visual',
    title: 'Melhor Clipe & Produção Audiovisual',
    subtitle: 'Edição cinematográfica, cenários deslumbrantes e efeitos visuais',
    iconName: 'Film',
    description: 'Direção de arte, cenografia em casas temáticas e edição de vídeo de alto padrão na comunidade PK XD.',
    status: 'voting_open',
    order: 3,
    sponsor: 'Gold Camera Studio',
    nominees: []
  },
  {
    id: 'cat-estilo-look',
    title: 'Melhor Look & Estilo Metálico',
    subtitle: 'O visual mais icônico, ousado e elegante do ano',
    iconName: 'Sparkles',
    description: 'Combinações de armaduras, trajes de gala ouro/prata e acessórios que ditaram a moda no jogo.',
    status: 'voting_open',
    order: 4,
    sponsor: 'Obsidian Haute Couture',
    nominees: []
  },
  {
    id: 'cat-revelacao-ano',
    title: 'Revelação do Ano & Comunidade',
    subtitle: 'O novo talento que explodiu em popularidade e carisma',
    iconName: 'Flame',
    description: 'Novos canais, streamers revelação e criadores que conquistaram o coração dos jogadores este ano.',
    status: 'voting_open',
    order: 5,
    sponsor: 'NextGen PK XD Creators',
    nominees: []
  },
  {
    id: 'cat-parceria-collab',
    title: 'Melhor Colaboração & Evento',
    subtitle: 'A união mais épica de criadores em prol da comunidade',
    iconName: 'Users',
    description: 'Eventos comunitários, mega lives conjuntas e colaborações inesquecíveis entre criadores PK XD.',
    status: 'voting_open',
    order: 6,
    sponsor: 'Multiverse Creator Guild',
    nominees: []
  }
];

export const INITIAL_CEREMONY_SETTINGS: CeremonySettings = {
  isLive: true,
  streamTitle: 'XMA 2026 — PK XD Music & Media Awards Gala Oficial',
  stageSubtitle: 'A Maior Premiação da Cultura e Criação do Multiverso PK XD',
  viewerCount: 24890,
  activeSegmentId: 'seg-opening',
  tickerText: '🏆 XMA 2026: Votações Abertas! Cadastre indicados pelo painel Admins XMA ou envie sua sugestão na aba da Comunidade! ⚡',
  goldenEnvelopeOpened: false,
  revealedWinnerCategoryIds: [],
  hostName: 'Admins XMA',
  coHostName: 'Apresentação Oficial Gala',
  soundEffectsEnabled: true
};

export const INITIAL_CEREMONY_SEGMENTS: CeremonySegment[] = [
  {
    id: 'seg-opening',
    timeLabel: '20:00',
    title: 'Abertura Triunfal & Tapete Metálico',
    host: 'Admins XMA',
    type: 'intro',
    status: 'live',
    description: 'Chegada triunfal dos criadores em limusines flutuantes, desfile de gala e discurso de abertura da comissão XMA.',
    highlightMediaUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'seg-award-hit',
    timeLabel: '20:20',
    title: 'Entrega do Troféu: Melhor Hit Musical PK XD',
    host: 'Cerimonial Dourado',
    type: 'award_category',
    categoryId: 'cat-hit-musical',
    status: 'upcoming',
    description: 'Apresentação dos clipes musicais e abertura do envelope dourado lacrado.',
    highlightMediaUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'seg-performance-live',
    timeLabel: '20:45',
    title: 'Show Especial: Sinfonia Dourada',
    host: 'Apresentação Especial',
    type: 'performance',
    status: 'upcoming',
    description: 'Apresentação musical pirotécnica exclusiva com efeitos de fogo dourado e chuva de prata.',
    highlightMediaUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'seg-award-creator',
    timeLabel: '21:40',
    title: 'O Grande Momento: Criador PK XD do Ano',
    host: 'Admins XMA com Golden Envelope',
    type: 'award_category',
    categoryId: 'cat-creator-ano',
    status: 'upcoming',
    description: 'O momento mais aguardado de toda a noite com entrega do Troféu Titânio Dourado XMA.',
    highlightMediaUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_CHAT_MESSAGES: LiveChatMessage[] = [
  {
    id: 'msg-1',
    userName: 'Admins XMA',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    userRole: 'admin',
    message: '👑 Sejam todos muito bem-vindos à Cerimônia Oficial XMA 2026! Conecte sua conta Google para votar!',
    timestamp: '20:00',
    isPinned: true
  },
  {
    id: 'msg-2',
    userName: 'Fã do PK XD',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    userRole: 'fan',
    message: 'O palco dourado está simplesmente incrível! ✨✨ #XMA2026',
    timestamp: '20:01'
  }
];

export const INITIAL_COMMUNITY_NOMINATIONS: CommunityNomination[] = [];
