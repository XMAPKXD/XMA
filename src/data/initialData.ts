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
    nominees: [
      {
        id: 'nom-admin',
        name: 'Admin PK XD',
        handle: '@adminpkxd',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
        categoryId: 'cat-creator-ano',
        projectTitle: 'Transmissões e Eventos Oficiais do Multiverso',
        projectDescription: 'Lives semanais, eventos ao vivo com a comunidade e criação de minigames icônicos no PK XD.',
        projectType: 'media_creator',
        pkxdId: '#000',
        bio: 'O lendário criador e administrador de eventos do universo PK XD.',
        votes: 4210,
        verifiedVotes: 3200,
        massVotes: 1010,
        badge: 'Oficial PK XD'
      },
      {
        id: 'nom-nimda',
        name: 'Nimda',
        handle: '@nimda_pkxd',
        avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
        categoryId: 'cat-creator-ano',
        projectTitle: 'Exploração de Segredos e Easter Eggs',
        projectDescription: 'Vídeos investigativos desvendando todas as atualizações secretas e ilhas escondidas.',
        projectType: 'media_creator',
        pkxdId: '#001',
        bio: 'Mestre dos mistérios e curiosidades escondidas pelo universo do jogo.',
        votes: 3890,
        verifiedVotes: 2900,
        massVotes: 990,
        badge: 'Explorador'
      },
      {
        id: 'nom-koosh',
        name: 'Koosh',
        handle: '@koosh_xd',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        categoryId: 'cat-creator-ano',
        projectTitle: 'Minigames e Desafios da Comunidade',
        projectDescription: 'Torneios épicos no Crazy Run e circuitos de parkour com seguidores.',
        projectType: 'media_creator',
        pkxdId: '#002',
        bio: 'Campeã dos circuitos de velocidade e anfitriã dos maiores campeonatos.',
        votes: 3540,
        verifiedVotes: 2600,
        massVotes: 940
      },
      {
        id: 'nom-bia-gamer',
        name: 'Bia Gamer',
        handle: '@biagamer_pkxd',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
        categoryId: 'cat-creator-ano',
        projectTitle: 'Decoração Épica e Vlogs de Gameplay',
        projectDescription: 'As mansões mais criativas e bem projetadas com arquitetura temática.',
        projectType: 'media_creator',
        pkxdId: '#109',
        bio: 'Referência em construção de casas temáticas e design de interiores no PK XD.',
        votes: 3120,
        verifiedVotes: 2300,
        massVotes: 820
      }
    ]
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
    nominees: [
      {
        id: 'nom-hit-sinfonia',
        name: 'Sinfonia do Glitch',
        handle: '@music_pkxd',
        avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
        categoryId: 'cat-hit-musical',
        projectTitle: 'Trilha Sonora Oficial da Temporada Glitch',
        projectDescription: 'Música eletrônica original com batidas futuristas e sintetizadores.',
        projectType: 'music_clip',
        pkxdId: '#501',
        bio: 'Banda virtual de sintetizadores do multiverso.',
        votes: 2980,
        verifiedVotes: 2100,
        massVotes: 880
      },
      {
        id: 'nom-hit-dourado',
        name: 'Ouro & Gravidade',
        handle: '@sound_xd',
        avatarUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
        categoryId: 'cat-hit-musical',
        projectTitle: 'Remix Eletrizante do Salão Dourado',
        projectDescription: 'Hit dançante mais tocado nos palcos de festa e shows do jogo.',
        projectType: 'music_clip',
        pkxdId: '#502',
        bio: 'DJs do Palco Metálico da Ilha de Festas.',
        votes: 2750,
        verifiedVotes: 1950,
        massVotes: 800
      },
      {
        id: 'nom-hit-crazyrun',
        name: 'Crazy Run Beat',
        handle: '@crazy_sound',
        avatarUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
        categoryId: 'cat-hit-musical',
        projectTitle: 'Batidão Frenético das Corridas',
        projectDescription: 'Trilha de corrida de alta intensidade para adrenalina pura.',
        projectType: 'music_clip',
        pkxdId: '#503',
        bio: 'Composições sonoras eletrizantes para competições.',
        votes: 2410,
        verifiedVotes: 1800,
        massVotes: 610
      }
    ]
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
    nominees: [
      {
        id: 'nom-thumb-lab',
        name: 'Creative Visual Lab',
        handle: '@creative_xd',
        avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        categoryId: 'cat-thumbnail-ano',
        projectTitle: 'A Grande Invasão dos Robôs Gigantes',
        projectDescription: 'Capa hiper-renderizada em 3D com iluminação neon volumétrica e tipografia dourada.',
        projectType: 'media_creator',
        pkxdId: '#301',
        bio: 'Estúdio de design e miniaturas cinematográficas para o YouTube.',
        votes: 2650,
        verifiedVotes: 1900,
        massVotes: 750
      },
      {
        id: 'nom-thumb-neon',
        name: 'Neon Arts PK',
        handle: '@neon_arts_xd',
        avatarUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
        categoryId: 'cat-thumbnail-ano',
        projectTitle: 'O Segredo Proibido da Ilha Flutuante',
        projectDescription: 'Composição de arte fantástica com cores vibrantes e render dos avatares.',
        projectType: 'media_creator',
        pkxdId: '#302',
        bio: 'Especialista em thumbnails imersivas e efeitos luminosos.',
        votes: 2320,
        verifiedVotes: 1700,
        massVotes: 620
      }
    ]
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
    nominees: [
      {
        id: 'nom-clipe-gravidade',
        name: 'Gravidade Zero Oficial',
        handle: '@gravity_prod',
        avatarUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&auto=format&fit=crop&q=80',
        categoryId: 'cat-clipe-visual',
        projectTitle: 'Clipe Cinematográfico: Além da Gravidade',
        projectDescription: 'Efeitos de câmera lenta, coreografia espacial sincronizada e transições visuais de alta fidelidade.',
        projectType: 'music_clip',
        pkxdId: '#201',
        bio: 'Produtora de cinema e machinimas no jogo.',
        votes: 2890,
        verifiedVotes: 2150,
        massVotes: 740
      },
      {
        id: 'nom-clipe-mansao',
        name: 'Mansão Gamer Cinematográfica',
        handle: '@mansion_xd',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        categoryId: 'cat-clipe-visual',
        projectTitle: 'Tour Noturno com Efeitos Especiais de Luz',
        projectDescription: 'Visita guiada cinematográfica com iluminação em tempo real e trilha sonora original.',
        projectType: 'media_creator',
        pkxdId: '#202',
        bio: 'Cineasta de machinimas e tours arquitetônicos.',
        votes: 2540,
        verifiedVotes: 1850,
        massVotes: 690
      }
    ]
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
    nominees: [
      {
        id: 'nom-look-ouro',
        name: 'Armadura Dourada Celestial',
        handle: '@fashion_xd',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
        categoryId: 'cat-estilo-look',
        projectTitle: 'Conjunto Completo Titânio & Asas Douradas',
        projectDescription: 'A combinação de armadura cósmica com capa reluzente e mochila a jato dourada.',
        projectType: 'media_creator',
        pkxdId: '#401',
        bio: 'Ícone de estilo e desfiles de moda na praça central.',
        votes: 3100,
        verifiedVotes: 2400,
        massVotes: 700
      },
      {
        id: 'nom-look-cyber',
        name: 'Cyberpunk Holográfico',
        handle: '@cyber_style',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
        categoryId: 'cat-estilo-look',
        projectTitle: 'Visual Neon Futurista com Máscara Robótica',
        projectDescription: 'Traje cibernético com cores gradiente ciano e roxo metálico.',
        projectType: 'media_creator',
        pkxdId: '#402',
        bio: 'Criador de tendências visuais futuristas.',
        votes: 2820,
        verifiedVotes: 2050,
        massVotes: 770
      }
    ]
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
    nominees: [
      {
        id: 'nom-rev-pedro',
        name: 'Pedro PK Gamer',
        handle: '@pedro_gamer_xd',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        categoryId: 'cat-revelacao-ano',
        projectTitle: 'Crescimento Exponencial e Lives Diárias',
        projectDescription: 'Superou a marca de 50 mil inscritos no ano com energia e carisma contagiantes.',
        projectType: 'media_creator',
        pkxdId: '#701',
        bio: 'Criador revelação que conquistou a comunidade com muita alegria e lives interativas.',
        votes: 3350,
        verifiedVotes: 2550,
        massVotes: 800
      },
      {
        id: 'nom-rev-luna',
        name: 'Luna Star XD',
        handle: '@luna_star_pkxd',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
        categoryId: 'cat-revelacao-ano',
        projectTitle: 'Histórias Engraçadas e Desafios com Inscritos',
        projectDescription: 'Séries de esquetes e histórias no PK XD que viralizaram nas redes.',
        projectType: 'media_creator',
        pkxdId: '#702',
        bio: 'Contadora de histórias e criadora de conteúdos divertidos para todas as idades.',
        votes: 3180,
        verifiedVotes: 2350,
        massVotes: 830
      }
    ]
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
    nominees: [
      {
        id: 'nom-collab-squad',
        name: 'Mega Squad Multiverse',
        handle: '@pkxd_squad',
        avatarUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80',
        categoryId: 'cat-parceria-collab',
        projectTitle: 'Mega Live de 12 Horas e Corrida Beneficente',
        projectDescription: 'Colaboração entre 8 criadores reunidos no palco principal do jogo transmitida ao vivo.',
        projectType: 'media_creator',
        pkxdId: '#801',
        bio: 'O maior coletivo de criadores reunidos para celebrar a comunidade.',
        votes: 3620,
        verifiedVotes: 2700,
        massVotes: 920
      }
    ]
  }
];

export const INITIAL_CEREMONY_SETTINGS: CeremonySettings = {
  isLive: true,
  streamTitle: 'XMA 2026 — PK XD Music & Media Awards Gala Oficial',
  stageSubtitle: 'A Maior Premiação da Cultura e Criação do Multiverso PK XD',
  viewerCount: 24890,
  activeSegmentId: 'seg-opening',
  tickerText: '✨ XMA 2026: Conheça os Indicados Oficiais! As urnas de votação abrirão em breve pela comissão organizadora! 🏆',
  goldenEnvelopeOpened: false,
  revealedWinnerCategoryIds: [],
  hostName: 'Admins XMA',
  coHostName: 'Apresentação Oficial Gala',
  soundEffectsEnabled: true,
  communityNominationsOpen: true
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
