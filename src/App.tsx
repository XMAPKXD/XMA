import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Category, 
  Nominee, 
  CeremonySettings, 
  CeremonySegment, 
  LiveChatMessage, 
  CommunityNomination, 
  PKXDUserAccount,
  isAuthorizedAdminEmail
} from './types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_CEREMONY_SETTINGS, 
  INITIAL_CEREMONY_SEGMENTS, 
  INITIAL_CHAT_MESSAGES,
  INITIAL_COMMUNITY_NOMINATIONS 
} from './data/initialData';
import { Trophy } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { GoldenTicker } from './components/GoldenTicker';
import { NomineesGallery } from './components/NomineesGallery';
import { RealTimeVoting } from './components/RealTimeVoting';
import { CommunityNominationForm } from './components/CommunityNominationForm';
import { LiveCeremony } from './components/LiveCeremony';
import { AdminPanel } from './components/AdminPanel';
import { NomineeDetailModal } from './components/NomineeDetailModal';
import { PKXDLoginModal } from './components/PKXDLoginModal';
import { CountdownTeaser } from './components/CountdownTeaser';
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
  const [activeTab, setActiveTab] = useState<'gallery' | 'voting' | 'community_nominations' | 'ceremony' | 'admin'>('gallery');

  // Load Ceremony Settings
  const [settings, setSettings] = useState<CeremonySettings>(() => {
    return getItemPersistent('xma_ceremony_settings_v8', INITIAL_CEREMONY_SETTINGS);
  });

  // Target timestamp: 15 de Setembro de 2026 às 19:00:00 (GMT-3 Brasília)
  const countdownTargetTimestamp = useMemo(() => {
    if (settings?.countdownTargetIso) {
      const parsed = new Date(settings.countdownTargetIso).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    // Month index 8 is September in JavaScript Date
    return new Date(2026, 8, 15, 19, 0, 0).getTime();
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

  // Filter out any leftover hardcoded mock IDs from earlier versions
  const sanitizeNominees = (nominees: Nominee[]): Nominee[] => {
    if (!Array.isArray(nominees)) return [];
    const mockIds = new Set([
      'nom-admin', 'nom-nimda', 'nom-koosh', 'nom-bia-gamer',
      'nom-hit-sinfonia', 'nom-hit-dourado', 'nom-hit-crazyrun',
      'nom-clipe-gravidade', 'nom-clipe-mansao',
      'nom-look-ouro', 'nom-look-cyber',
      'nom-rev-pedro', 'nom-rev-luna',
      'nom-collab-squad'
    ]);
    return nominees.filter((n) => !mockIds.has(n.id));
  };

  // Categories & Nominees State (100% Admin Controlled)
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('xma_categories_2026_v7');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((cat: Category) => ({
            ...cat,
            nominees: sanitizeNominees(cat.nominees || [])
          }));
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
        const savedCats = await getItemPersistent<Category[]>('xma_categories_2026_v7', []);
        if (Array.isArray(savedCats) && savedCats.length > 0) {
          setCategories((current) => {
            // Do not override if already hydrated from cloud Firestore
            if (isCloudSyncedRef.current) return current;
            const currentNomineeCount = current.reduce((acc, c) => acc + (c.nominees?.length || 0), 0);
            const savedNomineeCount = savedCats.reduce((acc, c) => acc + (c.nominees?.length || 0), 0);
            if (savedNomineeCount >= currentNomineeCount) {
              return savedCats.map((cat) => ({
                ...cat,
                nominees: sanitizeNominees(cat.nominees || [])
              }));
            }
            return current;
          });
        }

        const savedNoms = await getItemPersistent<CommunityNomination[]>('xma_community_nominations_2026_v7', []);
        if (Array.isArray(savedNoms) && savedNoms.length > 0) {
          setCommunityNominations((current) => {
            if (savedNoms.length >= current.length) {
              return savedNoms;
            }
            return current;
          });
        }
      } catch (e) {
        console.warn('Erro ao carregar dados persistentes:', e);
      }
    }
    loadPersistentData();
  }, []);

  // 2. Real-time Cloud Sync with Firestore
  useEffect(() => {
    let isMounted = true;

    async function initCloudCategories() {
      try {
        await testFirestoreConnection();
        const cloudCats = await getCategoriesOnce();
        if (isMounted && cloudCats && cloudCats.length > 0) {
          const sanitized = cloudCats.map((c) => ({
            ...c,
            nominees: sanitizeNominees(c.nominees || [])
          }));
          setCategories(sanitized);
          setItemPersistent('xma_categories_2026_v7', sanitized);
          isCloudSyncedRef.current = true;
        } else if (isMounted && (!cloudCats || cloudCats.length === 0)) {
          // If Firestore is brand new and completely empty, seed it with the official categories
          await saveAllCategoriesToFirestore(INITIAL_CATEGORIES);
          isCloudSyncedRef.current = true;
        }
      } catch (err) {
        console.error('Erro ao inicializar categorias do Firestore:', err);
      }
    }

    initCloudCategories();

    const unsubCategories = subscribeCategories((cloudCategories) => {
      if (!isMounted) return;
      if (Array.isArray(cloudCategories) && cloudCategories.length > 0) {
        const sanitized = cloudCategories.map((c) => ({
          ...c,
          nominees: sanitizeNominees(c.nominees || [])
        }));
        setCategories(sanitized);
        setItemPersistent('xma_categories_2026_v7', sanitized);
        isCloudSyncedRef.current = true;
      }
    });

    const unsubNominations = subscribeCommunityNominations((cloudNominations) => {
      if (!isMounted) return;
      if (Array.isArray(cloudNominations) && cloudNominations.length > 0) {
        setCommunityNominations(cloudNominations);
        setItemPersistent('xma_community_nominations_2026_v7', cloudNominations);
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
    setItemPersistent('xma_categories_2026_v7', categories);
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

  // Community Nomination Submission
  const handleCommunityNominationSubmit = (
    newNom: Omit<CommunityNomination, 'id' | 'createdAt' | 'status' | 'communityLikes'>
  ) => {
    const submission: CommunityNomination = {
      id: `comm-${Date.now()}`,
      createdAt: 'Agora há pouco',
      status: 'pending',
      communityLikes: 1,
      ...newNom
    };

    setCommunityNominations((prev) => [submission, ...prev]);
    saveCommunityNominationToFirestore(submission);
  };

  // Community Nomination Like
  const handleLikeNomination = (nomId: string) => {
    setCommunityNominations((prev) => {
      const updated = prev.map((n) => (n.id === nomId ? { ...n, communityLikes: n.communityLikes + 1 } : n));
      const target = updated.find((n) => n.id === nomId);
      if (target) {
        saveCommunityNominationToFirestore(target);
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
          winnerNomineeId: sorted[0]?.id
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

      {/* Top Metallic Announcement Ticker */}
      <GoldenTicker tickerText={settings.tickerText} />

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        userAccount={userAccount}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onShowCountdown={() => setIsCountdownActive(true)}
        communityNominationsOpen={settings.communityNominationsOpen ?? false}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'gallery' && (
          <NomineesGallery
            categories={categories}
            userVotes={userVotes}
            onVote={(catId, nomId) => handleMassVote(catId, nomId, 1)}
            onSelectNominee={(nominee, category) => setSelectedNomineeModal({ nominee, category })}
            onSwitchToCeremony={() => setActiveTab('ceremony')}
            onSwitchToAdmin={() => setActiveTab('admin')}
          />
        )}

        {activeTab === 'voting' && (
          <RealTimeVoting
            categories={categories}
            userVotes={userVotes}
            userAccount={userAccount}
            onMassVote={handleMassVote}
            onVerifiedSingleVote={handleVerifiedSingleVote}
            onSelectNominee={(nominee, category) => setSelectedNomineeModal({ nominee, category })}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onSwitchToAdmin={() => setActiveTab('admin')}
          />
        )}

        {activeTab === 'community_nominations' && (
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
        )}

        {activeTab === 'ceremony' && (
          <LiveCeremony
            categories={categories}
            settings={settings}
            segments={segments}
            chatMessages={chatMessages}
            onSendMessage={handleSendMessage}
            onOpenEnvelope={handleOpenEnvelope}
            onToggleSound={() => setSettings({ ...settings, soundEffectsEnabled: !settings.soundEffectsEnabled })}
          />
        )}

        {activeTab === 'admin' && (
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
      <footer className="mt-auto border-t border-amber-500/20 bg-[#06070a] py-10 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-zinc-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 p-[1px]">
                <div className="w-full h-full bg-[#0b0c13] rounded-[11px] flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <div className="text-left">
                <span className="text-white font-cinzel font-black tracking-wider text-sm block">
                  XMA 2026
                </span>
                <span className="text-[10px] text-zinc-400">
                  PK XD Music & Media Awards
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-zinc-400">
              <button 
                onClick={() => setActiveTab('gallery')} 
                className="hover:text-amber-300 transition-colors cursor-pointer"
              >
                Galeria de Indicados
              </button>
              <button 
                onClick={() => setActiveTab('voting')} 
                className="hover:text-amber-300 transition-colors cursor-pointer"
              >
                Urna de Votação
              </button>
              <button 
                onClick={() => setActiveTab('ceremony')} 
                className="hover:text-amber-300 transition-colors cursor-pointer"
              >
                Palco da Cerimônia
              </button>
              <button 
                onClick={() => setActiveTab('admin')} 
                className="hover:text-amber-300 transition-colors cursor-pointer"
              >
                Painel Admin
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-amber-400/90 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Edição Oficial 2026</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-zinc-500 text-[11px]">
            <p>
              XMA 2026 • Plataforma de Premiação Oficial da Comunidade de Criadores e Fãs de PK XD.
            </p>
            <p className="text-zinc-600">
              Design Dourado Metálico & Obsidian Luxury
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
