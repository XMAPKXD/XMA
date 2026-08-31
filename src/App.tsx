import React, { useState, useEffect } from 'react';
import { 
  Category, 
  Nominee, 
  CeremonySettings, 
  CeremonySegment, 
  LiveChatMessage, 
  CommunityNomination,
  PKXDUserAccount 
} from './types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_CEREMONY_SETTINGS, 
  INITIAL_CEREMONY_SEGMENTS, 
  INITIAL_CHAT_MESSAGES,
  INITIAL_COMMUNITY_NOMINATIONS 
} from './data/initialData';
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

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'gallery' | 'voting' | 'community_nominations' | 'ceremony' | 'admin'>('gallery');

  // Site Countdown / Teaser State (Default to true: everyone stays on countdown until admin unlocks)
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(() => {
    try {
      const isAdminSession = sessionStorage.getItem('xma_admin_session_unlocked') === 'true';
      if (isAdminSession) return false;
      const saved = localStorage.getItem('xma_countdown_active_v8');
      return saved !== null ? saved === 'true' : true; // Default to true (locked on countdown timer)
    } catch {
      return true;
    }
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

  // Settings
  const [settings, setSettings] = useState<CeremonySettings>(() => {
    try {
      const saved = localStorage.getItem('xma_settings_2026_v7');
      return saved ? JSON.parse(saved) : INITIAL_CEREMONY_SETTINGS;
    } catch {
      return INITIAL_CEREMONY_SETTINGS;
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

  // Persistence Effects
  useEffect(() => {
    try {
      localStorage.setItem('xma_categories_2026_v7', JSON.stringify(categories));
    } catch {}
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('xma_settings_2026_v7', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('xma_chat_2026_v7', JSON.stringify(chatMessages));
    } catch {}
  }, [chatMessages]);

  useEffect(() => {
    try {
      localStorage.setItem('xma_community_nominations_2026_v7', JSON.stringify(communityNominations));
    } catch {}
  }, [communityNominations]);

  useEffect(() => {
    try {
      localStorage.setItem('xma_user_account_2026_v7', JSON.stringify(userAccount));
    } catch {}
  }, [userAccount]);

  useEffect(() => {
    try {
      localStorage.setItem('xma_user_votes_2026_v7', JSON.stringify(userVotes));
    } catch {}
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
  };

  // Community Nomination Like
  const handleLikeNomination = (nomId: string) => {
    setCommunityNominations((prev) =>
      prev.map((n) => (n.id === nomId ? { ...n, communityLikes: n.communityLikes + 1 } : n))
    );
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
          onAdminUnlock={(adminUser) => {
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
          onReveal={() => {
            // Check if user is admin before unlocking
            try {
              const isAdminSession = sessionStorage.getItem('xma_admin_session_unlocked') === 'true';
              if (isAdminSession) {
                setIsCountdownActive(false);
              }
            } catch {
              setIsCountdownActive(false);
            }
          }}
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
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'gallery' && (
          <NomineesGallery
            categories={categories}
            userVotes={userVotes}
            onVote={(catId, nomId) => handleMassVote(catId, nomId, 1)}
            onSelectNominee={(nominee, category) => setSelectedNomineeModal({ nominee, category })}
            onSwitchToCeremony={() => setActiveTab('voting')}
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

      {/* Footer */}
      <footer className="mt-auto border-t border-amber-500/20 bg-[#07070b] py-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-2 text-amber-400/80 font-cinzel font-bold text-sm">
            <span>XMA 2026</span>
            <span>•</span>
            <span>PK XD Music & Media Awards</span>
          </div>
          <p className="text-zinc-500">
            Paleta Oficial Dourado, Preto e Prata Metálico • Voto em Massa e Voto Único Oficial com Login PK XD
          </p>
        </div>
      </footer>
    </div>
  );
}
