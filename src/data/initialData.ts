import { Category, CeremonySegment, CeremonySettings, LiveChatMessage, CommunityNomination, XMANewsArticle } from '../types';

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
    title: 'Music of the Year (Melhor Música)',
    subtitle: 'A faixa musical que embalou as festas e palcos do ano',
    iconName: 'Music',
    description: 'Faixas originais, paródias musicais e trilhas sonoras autorais criadas inspiradas no universo PK XD.',
    status: 'voting_open',
    order: 2,
    sponsor: 'Cyber Sound Records',
    nominees: []
  },
  {
    id: 'cat-thumbnail-ano',
    title: 'Thumbnail of the Year (Melhor Capa)',
    subtitle: 'A thumbnail mais criativa, chamativa e bem produzida do YouTube',
    iconName: 'Sparkles',
    description: 'Artes de capa, miniaturas e thumbnails que conquistaram cliques e marcaram a comunidade.',
    status: 'voting_open',
    order: 3,
    sponsor: 'Creative Visual Lab',
    nominees: []
  },
  {
    id: 'cat-clipe-visual',
    title: 'Melhor Clipe & Produção Audiovisual',
    subtitle: 'Edição cinematográfica, cenários deslumbrantes e efeitos visuais',
    iconName: 'Film',
    description: 'Direção de arte, cenografia em casas temáticas e edição de vídeo de alto padrão na comunidade PK XD.',
    status: 'voting_open',
    order: 4,
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
    order: 5,
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
    order: 6,
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
    order: 7,
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
  tickerText: '✨ XMA 2026: Votações abrem dia 10/09 • Fechamento dia 20/09 • Revelação dos Vencedores dia 25/09! 🏆',
  goldenEnvelopeOpened: false,
  revealedWinnerCategoryIds: [],
  hostName: 'Admins XMA',
  coHostName: 'Apresentação Oficial Gala',
  soundEffectsEnabled: true,
  communityNominationsOpen: false,
  countdownTargetIso: '2026-09-10T19:00:00'
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

export const INITIAL_NEWS_ARTICLES: XMANewsArticle[] = [
  {
    id: 'news-1',
    title: 'Abertura Oficial da Votação Popular do XMA 2026',
    subtitle: 'A maior premiação digital da comunidade abre suas urnas oficiais com categorias inéditas e indicados consagrados.',
    summary: 'A comissão organizadora do XD Music & Media Awards anunciou hoje o início oficial da fase de votação popular. Fãs e jogadores de todo o mundo já podem escolher seus favoritos.',
    content: [
      'O XMA (XD Music & Media Awards) chega à sua edição de 2026 estabelecendo um novo padrão de celebração cultural e reconhecimento de talentos no universo PK XD.',
      'Com mais de 8 categorias oficiais cobrindo criação de conteúdo, produções musicais, arquitetura de casas no metaverso e canais de transmissão, a premiação convida todos os membros da comunidade a fazerem parte da decisão histórica.',
      'Cronograma Oficial: As votações abrem oficialmente no dia 10 de Setembro às 19:00 e seguem até o dia 20 de Setembro. A grande cerimônia de revelação dos vencedores acontecerá no dia 25 de Setembro.'
    ],
    category: 'Votação',
    publishedAt: '05 de Setembro de 2026',
    readTime: '3 min de leitura',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1000&auto=format&fit=crop&q=80',
    featured: true
  },
  {
    id: 'news-2',
    title: 'Revelados os Indicados Oficiais ao Troféu Titânio Dourado',
    subtitle: 'Criadores veteranos e revelações surpreendentes disputam as categorias mais prestigiadas do ano.',
    summary: 'Após uma rigorosa fase de pré-seleção e curadoria dos momentos mais emblemáticos do ano, o comitê do XMA consolidou os perfis que disputarão as estatuetas douradas.',
    content: [
      'A lista oficial de indicados ao XMA 2026 traz uma mistura eletrizante de nomes consagrados que definiram o entretenimento no PK XD e novos criadores promissores.',
      'Destaque para a disputadíssima categoria "Creator do Ano", que reúne criadores que movimentaram multidões com lives, desafios épicos e eventos comunitários inesquecíveis.',
      'Conheça a biografia completa, projetos e redes sociais de cada concorrente na aba oficial de Indicados do site.'
    ],
    category: 'Indicados',
    publishedAt: '03 de Setembro de 2026',
    readTime: '4 min de leitura',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80',
    featured: false
  },
  {
    id: 'news-3',
    title: 'Transparência e Regras: Como Funciona a Auditoria dos Votos',
    subtitle: 'Conheça o sistema de integridade que assegura que cada voto legítimo seja respeitado e contabilizado.',
    summary: 'A equipe de tecnologia do XMA detalhou publicamente os critérios de segurança e integridade eleitoral adotados para evitar manipulações automatizadas e fraudes.',
    content: [
      'A credibilidade do XMA está alicerçada em critérios transparentes e auditáveis. Cada categoria conta com pesagem balanceada entre votos verificados e engajamento popular amplo.',
      'Mecanismos de detecção comportamental identificam e mitigam ataques de scripts automatizados, garantindo que o prestígio dos vencedores reflita genuinamente o carinho da comunidade.',
      'As diretrizes completas de conduta e elegibilidade já estão disponíveis na íntegra na seção de Regras da premiação.'
    ],
    category: 'Regras',
    publishedAt: '01 de Setembro de 2026',
    readTime: '3 min de leitura',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80',
    featured: false
  },
  {
    id: 'news-4',
    title: 'Gala de Premiação: Detalhes da Cerimônia ao Vivo',
    subtitle: 'Palco holográfico, tapete vermelho e números musicais exclusivos prometem marcar a noite de gala.',
    summary: 'A produção da cerimônia ao vivo revelou os primeiros detalhes da transmissão especial que revelará os vencedores com troféus 3D e discursos emocionantes.',
    content: [
      'A cerimônia do XMA 2026 contará com uma experiência de transmissão ao vivo de ponta, permitindo que os jogadores participem com aplausos, comentários em tempo real e reações interativas.',
      'Abertura com tapete metálico, envelopes dourados selados e apresentações exclusivas farão parte da programação oficial.',
      'Ative as notificações e acompanhe a contagem regressiva oficial direto na página inicial.'
    ],
    category: 'Cerimônia',
    publishedAt: '28 de Agosto de 2026',
    readTime: '5 min de leitura',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&auto=format&fit=crop&q=80',
    featured: false
  }
];
