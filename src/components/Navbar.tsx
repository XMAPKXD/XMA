import React from 'react';
import { 
  Trophy, 
  Vote, 
  Award, 
  Shield, 
  UserPlus, 
  Sparkles, 
  LogIn, 
  Clock, 
  Crown, 
  Lock,
  Radio,
  Users
} from 'lucide-react';
import { PKXDUserAccount, isAuthorizedAdminEmail } from '../types';

interface NavbarProps {
  activeTab: 'gallery' | 'voting' | 'community_nominations' | 'ceremony' | 'admin';
  onSelectTab: (tab: 'gallery' | 'voting' | 'community_nominations' | 'ceremony' | 'admin') => void;
  userAccount: PKXDUserAccount;
  onOpenLoginModal: () => void;
  onShowCountdown?: () => void;
  communityNominationsOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  userAccount,
  onOpenLoginModal,
  onShowCountdown,
  communityNominationsOpen = false
}) => {
  const isAdmin = isAuthorizedAdminEmail(userAccount.email);

  return (
    <header className="sticky top-0 z-40 bg-[#08090e]/95 backdrop-blur-xl border-b border-amber-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Emblem */}
          <div 
            onClick={() => onSelectTab('gallery')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-700 p-[1.5px] shadow-lg shadow-amber-500/25 group-hover:shadow-amber-400/40 group-hover:scale-105 transition-all">
                <div className="w-full h-full bg-[#090a0f] rounded-[14px] flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-400 group-hover:rotate-6 transition-transform" />
                </div>
              </div>
              <div className="absolute -inset-1 bg-amber-400/20 blur-md -z-10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-amber-200 transition-colors">
                  XMA
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase bg-gradient-to-r from-amber-400/20 to-amber-500/10 border border-amber-400/40 text-amber-300 font-mono shadow-sm">
                  2026
                </span>
              </div>
              <p className="text-[10px] font-medium tracking-wider uppercase text-zinc-400 font-mono">
                PK XD Awards Oficial
              </p>
            </div>
          </div>

          {/* Luxury Segmented Navigation Pills (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#101119]/80 p-1.5 rounded-full border border-zinc-800/80 shadow-inner">
            <button
              id="nav-tab-gallery"
              onClick={() => onSelectTab('gallery')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black shadow-md shadow-amber-500/20 font-black scale-[1.02]'
                  : 'text-zinc-400 hover:text-amber-200 hover:bg-zinc-900/60'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Indicados</span>
            </button>

            <button
              id="nav-tab-voting"
              onClick={() => onSelectTab('voting')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'voting'
                  ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black shadow-md shadow-amber-500/20 font-black scale-[1.02]'
                  : 'text-zinc-400 hover:text-amber-200 hover:bg-zinc-900/60'
              }`}
            >
              <Vote className="w-3.5 h-3.5" />
              <span>Urna de Votação</span>
            </button>

            <button
              id="nav-tab-community"
              onClick={() => onSelectTab('community_nominations')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'community_nominations'
                  ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black shadow-md shadow-amber-500/20 font-black scale-[1.02]'
                  : 'text-zinc-400 hover:text-amber-200 hover:bg-zinc-900/60'
              }`}
            >
              {communityNominationsOpen ? (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Indicações da Galera</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-red-400" />
                  <span>Indicações Populares</span>
                </>
              )}
            </button>

            <button
              id="nav-tab-ceremony"
              onClick={() => onSelectTab('ceremony')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'ceremony'
                  ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black shadow-md shadow-amber-500/20 font-black scale-[1.02]'
                  : 'text-zinc-400 hover:text-amber-200 hover:bg-zinc-900/60'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Palco & Envelopes</span>
            </button>

            <button
              id="nav-tab-admin"
              onClick={() => onSelectTab('admin')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black shadow-md shadow-amber-500/20 font-black scale-[1.02]'
                  : isAdmin
                  ? 'text-amber-300 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25'
                  : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-900/60'
              }`}
            >
              {isAdmin ? (
                <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              ) : (
                <Shield className="w-3.5 h-3.5 text-zinc-400" />
              )}
              <span>Painel Admin</span>
              {isAdmin && (
                <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.5 rounded-full font-black uppercase">
                  Staff
                </span>
              )}
            </button>
          </nav>

          {/* Right Area: Countdown Toggle & User Profile */}
          <div className="flex items-center gap-3">
            {onShowCountdown && (
              <button
                onClick={onShowCountdown}
                className="px-3 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-amber-500/30 hover:border-amber-400 text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all hover:scale-105 active:scale-95"
                title="Abrir tela cinematográfica de contagem regressiva"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">15 de Setembro</span>
              </button>
            )}

            {userAccount.isLoggedIn ? (
              <button
                onClick={onOpenLoginModal}
                className="px-3 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-amber-500/40 hover:border-amber-400 flex items-center gap-2.5 cursor-pointer transition-all shadow-md"
              >
                <img
                  src={userAccount.avatarUrl}
                  alt={userAccount.nickname}
                  className="w-7 h-7 rounded-full object-cover border border-amber-400/80"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-white leading-none">
                    {userAccount.nickname}
                  </div>
                  <div className="text-[10px] text-amber-300/80 font-mono mt-0.5">
                    {userAccount.pkxdTag} • Verificado
                  </div>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenLoginModal}
                id="login-pkxd-btn"
                className="px-4 py-2 rounded-full bg-gold-metallic-btn text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar com Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex items-center justify-around py-2.5 border-t border-zinc-800/80 text-[11px] bg-[#090a0f]/90">
          <button
            onClick={() => onSelectTab('gallery')}
            className={`py-1 px-2 font-bold flex flex-col items-center gap-1 min-h-[44px] justify-center ${
              activeTab === 'gallery' ? 'text-amber-300' : 'text-zinc-400'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Indicados</span>
          </button>

          <button
            onClick={() => onSelectTab('voting')}
            className={`py-1 px-2 font-bold flex flex-col items-center gap-1 min-h-[44px] justify-center ${
              activeTab === 'voting' ? 'text-amber-300' : 'text-zinc-400'
            }`}
          >
            <Vote className="w-4 h-4" />
            <span>Votação</span>
          </button>

          <button
            onClick={() => onSelectTab('community_nominations')}
            className={`py-1 px-2 font-bold flex flex-col items-center gap-1 min-h-[44px] justify-center ${
              activeTab === 'community_nominations' ? 'text-amber-300' : 'text-zinc-400'
            }`}
          >
            {communityNominationsOpen ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Indicar</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-red-400" />
                <span>Comunidade</span>
              </>
            )}
          </button>

          <button
            onClick={() => onSelectTab('ceremony')}
            className={`py-1 px-2 font-bold flex flex-col items-center gap-1 min-h-[44px] justify-center ${
              activeTab === 'ceremony' ? 'text-amber-300' : 'text-zinc-400'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Palco</span>
          </button>

          <button
            onClick={() => onSelectTab('admin')}
            className={`py-1 px-2 font-bold flex flex-col items-center gap-1 min-h-[44px] justify-center ${
              activeTab === 'admin' 
                ? 'text-amber-300' 
                : isAdmin 
                ? 'text-amber-400' 
                : 'text-zinc-400'
            }`}
          >
            {isAdmin ? <Crown className="w-4 h-4 text-amber-400" /> : <Shield className="w-4 h-4" />}
            <span>{isAdmin ? 'Admin' : 'Painel'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
