import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Category, 
  Nominee, 
  CeremonySettings, 
  CeremonySegment, 
  LiveChatMessage, 
  CommunityNomination, 
  PKXDUserAccount,
  isAuthorizedAdminEmail,
  AppTab
} from './types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_CEREMONY_SETTINGS, 
  INITIAL_CEREMONY_SEGMENTS, 
  INITIAL_CHAT_MESSAGES,
  INITIAL_COMMUNITY_NOMINATIONS,
  INITIAL_NEWS_ARTICLES 
} from './data/initialData';
import { Trophy } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { GoldenTicker } from './components/GoldenTicker';
import { HeroHome } from './components/HeroHome';
import { VotingBallot } from './components/VotingBallot';
import { CategoriesView } from './components/CategoriesView';
import { NomineesView } from './components/NomineesView';
import { RulesView } from './components/RulesView';
import { ResultsView } from './components/ResultsView';
import { NewsView } from './components/NewsView';
import { NomineesGallery } from './components/NomineesGallery';
import { RealTimeVoting } from './components/RealTimeVoting';
import { CommunityNominationForm } from './components/CommunityNominationForm';
import { LiveCeremony } from './components/LiveCeremony';
import { AdminPanel } from './components/AdminPanel';
import { NomineeDetailModal } from './components/NomineeDetailModal';
import { PKXDLoginModal } from './components/PKXDLoginModal';
import { CountdownTeaser } from './components/CountdownTeaser';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { LegalModal } from './components/LegalModals';
import { Footer } from './components/Footer';
import { triggerGoldenConfetti } from './utils/confetti';
import { playVoteChime } from './utils/audio';
import { setItemPersistent, getItemPersistent } from './utils/persistentStorage';
import { 
  testFirestoreConnection, 
  saveAllCategoriesToFirestore, 
  subscribeCategories, 
  saveCommunityNominationToFirestore, 
  subscribeCommunityNominations,
  getCategoriesOnce
} from './lib/firestoreService';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);
  const [newsArticles] = useState(INITIAL_NEWS_ARTICLES);

  // Load Ceremony Settings
  const [settings, setSettings] = useState<CeremonySettings>(() => {
    return getItemPersistent('xma_ceremony_settings_v8', INITIAL_CEREMONY_SETTINGS);
  });

  // Target timestamp: 10 de Setembro de 2026 às 19:00:00 (Abertura oficial das votações populares)
  const countdownTargetTimestamp = useMemo(() => {
    if (settings?.countdownTargetIso && settings.countdownTargetIso !== '2026-09-15T19:00:00') {
      const parsed = new Date(settings.countdownTargetIso).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    // Mês 8 = Setembro no Date do JavaScript (Dia 10 de Setembro de 2026)
    return new Date(2026, 8, 10, 19, 0, 0).getTime();
  }, [settings?.countdownTargetIso]);

  // Is the countdown currently finished?
  const [isCountdownFinished, setIsCountdownFinished] = useState<boolean>(() => {
    return Date.now() >= countdownTargetTimestamp;
  });

  // Site Countdown / Teaser State
  // STRICT USER RULE: "Até a contagem regressiva acabar, só admins acessam o site! Depois da contagem qualquer pessoa"
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(() => {
    const finished = Date.now() >= countdownTargetTimestamp;
    if (finished) {
      return false; // Anyone can access after countdown!
    }
    try {
      const adminUnlocked = sessionStorage.getItem('xma_admin_session_unlocked') === 'true';
      if (adminUnlocked) return false; // Admin can access
    } catch {}
    return true; // Locked for non-admins until countdown ends!
  });

  // Filter out any dummy / fake nominees so user can add real ones
  const FAKE_NOMINEE_PREFIXES = [
    'nom-admin', 'nom-nimda', 'nom-koosh', 'nom-bia-gamer',
    'nom-hit-', 'nom-thumb-', 'nom-clipe-', 'nom-look-', 'nom-rev-', 'nom-collab-'
  ];

  const isFakeNominee = (id?: string) => {
    if (!id) return false;
    return FAKE_NOMINEE_PREFIXES.some((prefix) => id.startsWith(prefix));
  };

  const sanitizeCategories = (cats: Category[]): Category[] => {
    return cats.map((cat) => ({
      ...cat,
      nominees: (cat.nominees || []).filter((n) => !isFakeNominee(n.id))
    }));
  };

  // Smart Category Merging: Preserves both initial official categories and real nominees
  const mergeCategories = (base: Category[], incoming: Category[]): Category[] => {
    const map = new Map<string, Category>();
    for (const cat of base) {
      if (cat.id) map.set(cat.id, { ...cat, nominees: (cat.nominees || []).filter((n) => !isFakeNominee(n.id)) });
    }
    for (const inc of incoming) {
      if (!inc.id) continue;
      const cleanIncomingNominees = (inc.nominees || []).filter((n) => !isFakeNominee(n.id));
      if (!map.has(inc.id)) {
        map.set(inc.id, { ...inc, nominees: cleanIncomingNominees });
      } else {
        const existing = map.get(inc.id)!;
        const nomMap = new Map<string, Nominee>();
        for (const n of existing.nominees || []) {
          if (n.id && !isFakeNominee(n.id)) nomMap.set(n.id, n);
        }
        for (const n of cleanIncomingNominees) {
          if (n.id && !isFakeNominee(n.id)) {
            if (!nomMap.has(n.id)) {
              nomMap.set(n.id, n);
            } else {
              const curr = nomMap.get(n.id)!;
              nomMap.set(n.id, {
                ...curr,
                ...n,
                votes: Math.max(curr.votes || 0, n.votes || 0),
                verifiedVotes: Math.max(curr.verifiedVotes || 0, n.verifiedVotes || 0),
                massVotes: Math.max(curr.massVotes || 0, n.massVotes || 0)
              });
            }
          }
        }
        map.set(inc.id, {
          ...existing,
          ...inc,
          nominees: Array.from(nomMap.values())
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const mergeWithInitialCategories = (loaded: Category[]): Category[] => {
    return sanitizeCategories(mergeCategories(INITIAL_CATEGORIES, loaded));
  };

  const mergeCommunityNominations = (current: CommunityNomination[], incoming: CommunityNomination[]): CommunityNomination[] => {
    const map = new Map<string, CommunityNomination>();
    for (const nom of current) {
      if (nom.id) map.set(nom.id, nom);
    }
    for (const inc of incoming) {
      if (!inc.id) continue;
      if (!map.has(inc.id)) {
        map.set(inc.id, inc);
      } else {
        const existing = map.get(inc.id)!;
        map.set(inc.id, {
          ...existing,
          ...inc,
          communityLikes: Math.max(existing.communityLikes || 0, inc.communityLikes || 0)
        });
      }
    }
    return Array.from(map.values());
  };

  // Categories & Nominees State (100% Admin Controlled + Initial Data Safeguard)
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const savedV8 = localStorage.getItem('xma_categories_2026_v8');
      if (savedV8) {
        const parsed = JSON.parse(savedV8);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return sanitizeCategories(mergeWithInitialCategories(parsed));
        }
      }
      const savedV7 = localStorage.getItem('xma_categories_2026_v7');
      if (savedV7) {
        const parsed = JSON.parse(savedV7);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const clean = sanitizeCategories(mergeWithInitialCategories(parsed));
          localStorage.setItem('xma_categories_2026_v8', JSON.stringify(clean));
          return clean;
        }
      }
      return INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  // Segments
  const [segments, setSegments] = useState<CeremonySegment[]>(() => {
    try {
      const saved = localStorage.getItem('xma_segments_2026_v7');
      return saved ? JSON.parse(saved) : INITIAL_CEREMONY_SEGMENTS;
    } catch {
      return INITIAL_CEREMONY_SEGMENTS;
    }
  });

  // Chat / Cheer Messages
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('xma_chat_2026_v7');
      return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
    } catch {
      return INITIAL_CHAT_MESSAGES;
    }
  });

  // Community Nominations
  const [communityNominations, setCommunityNominations] = useState<CommunityNomination[]>(() => {
    try {
      const saved = localStorage.getItem('xma_community_nominations_2026_v7');
      return saved ? JSON.parse(saved) : INITIAL_COMMUNITY_NOMINATIONS;
    } catch {
      return INITIAL_COMMUNITY_NOMINATIONS;
    }
  });

  // PK XD User Account State (For 1-vote-per-category verified mode)
  const [userAccount, setUserAccount] = useState<PKXDUserAccount>(() => {
    try {
      const saved = localStorage.getItem('xma_user_account_2026_v7');
      return saved ? JSON.parse(saved) : {
        isLoggedIn: false,
        nickname: '',
        pkxdTag: '#000',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
        verifiedVotes: {}
      };
    } catch {
      return {
        isLoggedIn: false,
        nickname: '',
        pkxdTag: '#000',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
        verifiedVotes: {}
      };
    }
  });

  // Check if current user or active session has admin privileges
  const isUserAdmin = useMemo(() => {
    try {
      if (userAccount?.email && isAuthorizedAdminEmail(userAccount.email)) return true;
      if (sessionStorage.getItem('xma_admin_session_unlocked') === 'true') return true;
    } catch {}
    return false;
  }, [userAccount?.email]);

  // Real-time verification: enforce that only admins can access the site before countdown ends
  // "Até a contagem regressiva acabar, só admins acessam o site! Depois da contagem qualquer pessoa"
  useEffect(() => {
    const checkCountdownAccess = () => {
      const now = Date.now();
      const finished = now >= countdownTargetTimestamp;
      if (finished) {
        setIsCountdownFinished(true);
      } else {
        // Countdown is active: check if user is admin
        let adminUnlocked = false;
        try {
          adminUnlocked = sessionStorage.getItem('xma_admin_session_unlocked') === 'true' ||
            (!!userAccount?.email && isAuthorizedAdminEmail(userAccount.email));
        } catch {}

        if (!adminUnlocked) {
          setIsCountdownActive(true);
        }
      }
    };

    checkCountdownAccess();
    const interval = setInterval(checkCountdownAccess, 1000);
    return () => clearInterval(interval);
  }, [countdownTargetTimestamp, userAccount?.email]);

  const handleReveal = () => {
    const finished = Date.now() >= countdownTargetTimestamp;
    let adminUnlocked = false;
    try {
      adminUnlocked = sessionStorage.getItem('xma_admin_session_unlocked') === 'true' ||
        (!!userAccount?.email && isAuthorizedAdminEmail(userAccount.email));
    } catch {}

    // Before countdown ends, only admins can enter the site!
    if (!finished && !adminUnlocked) {
      alert('Acesso Restrito: Até a contagem regressiva acabar, apenas administradores autorizados têm acesso à plataforma.');
      return;
    }

    try {
      localStorage.setItem('xma_countdown_active_v8', 'false');
    } catch {}
    setIsCountdownActive(false);
  };

  // General vote history tracking
  const [userVotes, setUserVotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('xma_user_votes_2026_v7');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [selectedNomineeModal, setSelectedNomineeModal] = useState<{
    nominee: Nominee;
    category: Category;
  } | null>(null);

  // Track whether categories have been loaded from Firestore to prevent mount wiping
  const isCloudSyncedRef = useRef<boolean>(false);

  // 1. Startup Recovery: Load from IndexedDB (recovering data if localStorage was limited or reset)
  useEffect(() => {
    async function loadPersistentData() {
      try {
        const savedCatsV8 = await getItemPersistent<Category[]>('xma_categories_2026_v8', []);
        if (Array.isArray(savedCatsV8) && savedCatsV8.length > 0) {
          setCategories((current) => {
            return sanitizeCategories(mergeWithInitialCategories(mergeCategories(current, savedCatsV8)));
          });
        } else {
          const savedCatsV7 = await getItemPersistent<Category[]>('xma_categories_2026_v7', []);
          if (Array.isArray(savedCatsV7) && savedCatsV7.length > 0) {
            setCategories((current) => {
              const clean = sanitizeCategories(mergeWithInitialCategories(mergeCategories(current, savedCatsV7)));
              setItemPersistent('xma_categories_2026_v8', clean);
              return clean;
            });
          }
        }

        const savedNoms = await getItemPersistent<CommunityNomination[]>('xma_community_nominations_2026_v7', []);
        if (Array.isArray(savedNoms) && savedNoms.length > 0) {
          setCommunityNominations((current) => {
            return mergeCommunityNominations(current, savedNoms);
          });
        }
      } catch (e) {
        console.warn('Erro ao carregar dados persistentes:', e);
      }
    }
    loadPersistentData();
  }, []);

  // 2. Real-time Cloud Sync with Firestore (With Non-Destructive Merging)
  useEffect(() => {
    let isMounted = true;

    async function initCloudCategories() {
      try {
        await testFirestoreConnection();
        const cloudCats = await getCategoriesOnce();
        if (isMounted && Array.isArray(cloudCats)) {
          if (cloudCats.length > 0) {
            setCategories((prev) => {
              const merged = sanitizeCategories(mergeWithInitialCategories(mergeCategories(prev, cloudCats)));
              setItemPersistent('xma_categories_2026_v8', merged);
              return merged;
            });
            isCloudSyncedRef.current = true;
          } else {
            // Firestore is freshly connected and empty, seed it with current categories
            await saveAllCategoriesToFirestore(categories);
            isCloudSyncedRef.current = true;
          }
        }
      } catch (err) {
        console.warn('Firestore offline ou API não habilitada; operando em modo persistente local (IndexedDB):', err);
      }
    }

    initCloudCategories();

    const unsubCategories = subscribeCategories((cloudCategories) => {
      if (!isMounted) return;
      if (Array.isArray(cloudCategories) && cloudCategories.length > 0) {
        setCategories((prev) => {
          const merged = sanitizeCategories(mergeWithInitialCategories(mergeCategories(prev, cloudCategories)));
          setItemPersistent('xma_categories_2026_v8', merged);
          return merged;
        });
        isCloudSyncedRef.current = true;
      }
    });

    const unsubNominations = subscribeCommunityNominations((cloudNominations) => {
      if (!isMounted) return;
      if (Array.isArray(cloudNominations) && cloudNominations.length > 0) {
        setCommunityNominations((prev) => {
          const merged = mergeCommunityNominations(prev, cloudNominations);
          setItemPersistent('xma_community_nominations_2026_v7', merged);
          return merged;
        });
      }
    });

    return () => {
      isMounted = false;
      unsubCategories();
      unsubNominations();
    };
  }, []);

  // 3. Persistence Effects (Dual-layer IndexedDB + localStorage + Firestore)
  useEffect(() => {
    setItemPersistent('xma_categories_2026_v8', categories);
    // CRITICAL: Only write back to Firestore if initial cloud data has already been loaded!
    // This stops empty or uninitialized local state on mount from wiping out saved Firestore data upon refresh!
    if (isCloudSyncedRef.current) {
      saveAllCategoriesToFirestore(categories);
    }
  }, [categories]);

  useEffect(() => {
    setItemPersistent('xma_settings_2026_v7', settings);
  }, [settings]);

  useEffect(() => {
    setItemPersistent('xma_chat_2026_v7', chatMessages);
  }, [chatMessages]);

  useEffect(() => {
    setItemPersistent('xma_community_nominations_2026_v7', communityNominations);
  }, [communityNominations]);

  useEffect(() => {
    setItemPersistent('xma_user_account_2026_v7', userAccount);
  }, [userAccount]);

  useEffect(() => {
    setItemPersistent('xma_user_votes_2026_v7', userVotes);
  }, [userVotes]);

  useEffect(() => {
    try {
      localStorage.setItem('xma_countdown_active_v8', isCountdownActive ? 'true' : 'false');
    } catch {}
  }, [isCountdownActive]);

  // Mass Voting Handler (Unlimited votes for fan club mass campaigns - 25% weight)
  const handleMassVote = (categoryId: string, nomineeId: string, quantity: number) => {
    const targetCat = categories.find((c) => c.id === categoryId);
    if (!targetCat || targetCat.status !== 'voting_open') {
      return; // Do not register votes while voting is closed / in nominee exhibition phase
    }

    const updatedCategories = categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          nominees: cat.nominees.map((n) => {
            if (n.id === nomineeId) {
              const currentMass = n.massVotes !== undefined ? n.massVotes : Math.max(0, n.votes - (n.verifiedVotes || 0));
              return { 
                ...n, 
                votes: n.votes + quantity,
                massVotes: currentMass + quantity
              };
            }
            return n;
          })
        };
      }
      return cat;
    });

    setCategories(updatedCategories);
    setUserVotes((prev) => ({ ...prev, [categoryId]: nomineeId }));
  };

  // Verified Single Vote Handler (1 vote per category with PK XD login - 75% weight)
  const handleVerifiedSingleVote = (categoryId: string, nomineeId: string) => {
    const targetCat = categories.find((c) => c.id === categoryId);
    if (!targetCat || targetCat.status !== 'voting_open') {
      return; // Do not register votes while voting is closed / in nominee exhibition phase
    }

    const prevNomineeId = userAccount.verifiedVotes[categoryId];

    const updatedCategories = categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          nominees: cat.nominees.map((n) => {
            const currentUnique = n.verifiedVotes || 0;
            const currentMass = n.massVotes !== undefined ? n.massVotes : Math.max(0, n.votes - currentUnique);

            if (n.id === nomineeId) {
              const isSame = prevNomineeId === nomineeId;
              return { 
                ...n, 
                votes: n.votes + (isSame ? 0 : 1),
                verifiedVotes: currentUnique + (isSame ? 0 : 1),
                massVotes: currentMass
              };
            }
            if (prevNomineeId && n.id === prevNomineeId && prevNomineeId !== nomineeId) {
              // Decrement if user switched official vote
              return {
                ...n,
                votes: Math.max(0, n.votes - 1),
                verifiedVotes: Math.max(0, currentUnique - 1),
                massVotes: currentMass
              };
            }
            return n;
          })
        };
      }
      return cat;
    });

    setCategories(updatedCategories);
    setUserAccount((prev) => ({
      ...prev,
      verifiedVotes: {
        ...prev.verifiedVotes,
        [categoryId]: nomineeId
      }
    }));
    setUserVotes((prev) => ({ ...prev, [categoryId]: nomineeId }));
  };

  // Handle batch ballot submission from VotingBallot component
  const handleSaveBallotVotes = (ballotSelections: Record<string, string>) => {
    setCategories((prevCategories) => {
      return prevCategories.map((cat) => {
        const selectedNomId = ballotSelections[cat.id];
        if (!selectedNomId) return cat;

        const prevNomId = userAccount.verifiedVotes[cat.id];

        return {
          ...cat,
          nominees: cat.nominees.map((n) => {
            const currentVotes = n.votes || 0;
            const currentVerified = n.verifiedVotes || 0;

            if (n.id === selectedNomId) {
              const isSame = prevNomId === selectedNomId;
              return {
                ...n,
                votes: currentVotes + (isSame ? 0 : 1),
                verifiedVotes: currentVerified + (isSame ? 0 : 1)
              };
            }

            if (prevNomId && n.id === prevNomId && prevNomId !== selectedNomId) {
              return {
                ...n,
                votes: Math.max(0, currentVotes - 1),
                verifiedVotes: Math.max(0, currentVerified - 1)
              };
            }

            return n;
          })
        };
      });
    });

    setUserVotes((prev) => ({
      ...prev,
      ...ballotSelections
    }));

    setUserAccount((prev) => ({
      ...prev,
      verifiedVotes: {
        ...prev.verifiedVotes,
        ...ballotSelections
      }
    }));
  };

  // Community Nomination Submission
  const handleCommunityNominationSubmit = (
    newNom: Omit<CommunityNomination, 'id' | 'createdAt' | 'status' | 'communityLikes'>
  ) => {
    const submission: CommunityNomination = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: 'Agora há pouco',
      status: 'pending',
      communityLikes: 1,
      ...newNom
    };

    setCommunityNominations((prev) => {
      const updated = [submission, ...prev.filter((p) => p.id !== submission.id)];
      setItemPersistent('xma_community_nominations_2026_v7', updated);
      return updated;
    });

    try {
      saveCommunityNominationToFirestore(submission);
    } catch (err) {
      console.warn('Erro ao salvar indicação na nuvem (mantida localmente):', err);
    }
  };

  // Community Nomination Like
  const handleLikeNomination = (nomId: string) => {
    setCommunityNominations((prev) => {
      const updated = prev.map((n) => (n.id === nomId ? { ...n, communityLikes: n.communityLikes + 1 } : n));
      setItemPersistent('xma_community_nominations_2026_v7', updated);
      const target = updated.find((n) => n.id === nomId);
      if (target) {
        try {
          saveCommunityNominationToFirestore(target);
        } catch {}
      }
      return updated;
    });
    playVoteChime();
  };

  // Login Handler
  const handleLogin = (nickname: string, pkxdTag: string, avatarUrl: string, email?: string) => {
    setUserAccount((prev) => ({
      ...prev,
      isLoggedIn: true,
      nickname,
      pkxdTag,
      avatarUrl,
      email: email || prev.email
    }));
  };

  // Logout Handler
  const handleLogout = () => {
    setUserAccount((prev) => ({
      ...prev,
      isLoggedIn: false,
      email: undefined
    }));
  };

  // Chat message sender
  const handleSendMessage = (msg: string) => {
    const newMessage: LiveChatMessage = {
      id: `msg-${Date.now()}`,
      userName: userAccount.isLoggedIn ? userAccount.nickname : 'Fã do PK XD',
      avatarUrl: userAccount.isLoggedIn ? userAccount.avatarUrl : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      userRole: userAccount.isLoggedIn ? 'vip' : 'fan',
      message: msg,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages((prev) => [newMessage, ...prev]);
  };

  // Open Golden Envelope
  const handleOpenEnvelope = (categoryId: string) => {
    const updated = categories.map((cat) => {
      if (cat.id === categoryId) {
        const sorted = [...cat.nominees].sort((a, b) => b.votes - a.votes);
        return {
          ...cat,
          status: 'winner_revealed' as const,
          winnerNomineeId: sorted[0]?.id || null
        };
      }
      return cat;
    });
    setCategories(updated);
  };

  // Reset database to initial defaults
  const handleResetData = () => {
    setCategories(INITIAL_CATEGORIES);
    setSettings(INITIAL_CEREMONY_SETTINGS);
    setSegments(INITIAL_CEREMONY_SEGMENTS);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setCommunityNominations(INITIAL_COMMUNITY_NOMINATIONS);
    setUserVotes({});
    try {
      localStorage.clear();
    } catch {}
    alert('Dados restaurados com sucesso!');
  };

  // Total votes for selected category modal
  const selectedCatTotalVotes = selectedNomineeModal
    ? selectedNomineeModal.category.nominees.reduce((s, n) => s + n.votes, 0)
    : 0;

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col selection:bg-amber-400 selection:text-black">
      {/* Locked Fullscreen Countdown Teaser (15 de Setembro 19:00) */}
      {isCountdownActive && (
        <CountdownTeaser
          categories={categories}
          communityNominations={communityNominations}
          onSubmitNomination={handleCommunityNominationSubmit}
          onLikeNomination={handleLikeNomination}
          userNickname={userAccount.nickname}
          userPkxdTag={userAccount.pkxdTag}
          targetDate={new Date(countdownTargetTimestamp)}
          onAdminUnlock={(adminUser) => {
            try {
              sessionStorage.setItem('xma_admin_session_unlocked', 'true');
            } catch {}
            setUserAccount({
              isLoggedIn: true,
              nickname: adminUser.name,
              pkxdTag: adminUser.tag,
              avatarUrl: adminUser.avatar,
              email: adminUser.email,
              verifiedVotes: {}
            });
            setIsCountdownActive(false);
            setActiveTab('admin');
          }}
          onReveal={handleReveal}
        />
      )}

      {/* Sticky Top Navigation Container: Ticker + Navbar */}
      <div className="sticky top-0 z-50 w-full bg-[#07080c] shadow-[0_10px_30px_rgba(0,0,0,0.85)]">
        <GoldenTicker tickerText={settings.tickerText} />
        <Navbar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          userAccount={userAccount}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onShowCountdown={() => setIsCountdownActive(true)}
          communityNominationsOpen={settings.communityNominationsOpen ?? false}
        />
      </div>

      {/* Main Container */}
      <main className="flex-1 w-full">
        {activeTab === 'home' && (
          <HeroHome
            categories={categories}
            newsArticles={newsArticles}
            countdownTargetTimestamp={countdownTargetTimestamp}
            onNavigate={setActiveTab}
            onSelectCategory={(cat) => {
              setActiveTab('categories');
            }}
            onSelectNominee={(nominee, category) => {
              setSelectedNomineeModal({ nominee, category });
            }}
            onSelectArticle={() => {
              setActiveTab('news');
            }}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesView
            categories={categories}
            onVoteCategory={(catId) => {
              setActiveTab('voting');
            }}
            onSelectNomineeDetail={(nominee, category) => {
              setSelectedNomineeModal({ nominee, category });
            }}
          />
        )}

        {activeTab === 'nominees' && (
          <NomineesView
            categories={categories}
            onSelectNomineeDetail={(nominee, category) => {
              setSelectedNomineeModal({ nominee, category });
            }}
            onVoteNominee={(catId, nomineeId) => {
              handleVerifiedSingleVote(catId, nomineeId);
              setActiveTab('voting');
            }}
          />
        )}

        {activeTab === 'voting' && (
          <VotingBallot
            categories={categories}
            userAccount={userAccount}
            initialSelections={userVotes}
            onSaveVotes={handleSaveBallotVotes}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onSelectNomineeDetail={(nominee, category) => {
              setSelectedNomineeModal({ nominee, category });
            }}
          />
        )}

        {activeTab === 'rules' && (
          <RulesView />
        )}

        {activeTab === 'results' && (
          <ResultsView
            categories={categories}
            onNavigateToCeremony={() => setActiveTab('ceremony')}
            onSelectNomineeDetail={(nominee, category) => {
              setSelectedNomineeModal({ nominee, category });
            }}
          />
        )}

        {activeTab === 'news' && (
          <NewsView articles={newsArticles} />
        )}

        {activeTab === 'gallery' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <NomineesGallery
              categories={categories}
              userVotes={userVotes}
              onVote={(catId, nomId) => handleMassVote(catId, nomId, 1)}
              onSelectNominee={(nominee, category) => setSelectedNomineeModal({ nominee, category })}
              onSwitchToCeremony={() => setActiveTab('ceremony')}
              onSwitchToAdmin={() => setActiveTab('admin')}
            />
          </div>
        )}

        {activeTab === 'community_nominations' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <CommunityNominationForm
              categories={categories}
              nominations={communityNominations}
              onSubmitNomination={handleCommunityNominationSubmit}
              onLikeNomination={handleLikeNomination}
              userNickname={userAccount.nickname}
              userPkxdTag={userAccount.pkxdTag}
              isOpen={settings.communityNominationsOpen ?? false}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          </div>
        )}

        {activeTab === 'ceremony' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <LiveCeremony
              categories={categories}
              settings={settings}
              segments={segments}
              chatMessages={chatMessages}
              onSendMessage={handleSendMessage}
              onOpenEnvelope={handleOpenEnvelope}
              onToggleSound={() => setSettings({ ...settings, soundEffectsEnabled: !settings.soundEffectsEnabled })}
            />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <AdminPanel
              categories={categories}
              settings={settings}
              segments={segments}
              communityNominations={communityNominations}
              userAccount={userAccount}
              onUpdateCategories={setCategories}
              onUpdateSettings={setSettings}
              onUpdateSegments={setSegments}
              onUpdateCommunityNominations={setCommunityNominations}
              onSendAdminMessage={handleSendMessage}
              onResetData={handleResetData}
              onLoginAdmin={(nick, tag, avatar, email) => handleLogin(nick, tag, avatar, email)}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Nominee Detail Modal */}
      {selectedNomineeModal && (
        <NomineeDetailModal
          nominee={selectedNomineeModal.nominee}
          category={selectedNomineeModal.category}
          onClose={() => setSelectedNomineeModal(null)}
          onVote={(catId, nomineeId) => {
            handleMassVote(catId, nomineeId, 1);
            triggerGoldenConfetti();
            playVoteChime();
          }}
          hasVotedForCategory={Boolean(userVotes[selectedNomineeModal.category.id])}
          votedNomineeId={userVotes[selectedNomineeModal.category.id]}
          totalCategoryVotes={selectedCatTotalVotes}
        />
      )}

      {/* PK XD Login Modal */}
      <PKXDLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        userAccount={userAccount}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* Refined Luxury Footer */}
      <Footer
        onNavigate={setActiveTab}
        onOpenPrivacy={() => setLegalModalType('privacy')}
        onOpenTerms={() => setLegalModalType('terms')}
      />

      {/* Cookie Consent Banner */}
      <CookieConsentBanner
        onOpenPrivacyPolicy={() => setLegalModalType('privacy')}
        onOpenTermsOfService={() => setLegalModalType('terms')}
      />

      {/* Legal Modals (Privacy Policy / Terms of Service) */}
      <LegalModal
        isOpen={Boolean(legalModalType)}
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
}
