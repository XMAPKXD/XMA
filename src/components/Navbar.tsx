import React from 'react';
import { Trophy, Vote, Award, Shield, UserPlus, Sparkles, User, LogIn, CheckCircle2, Timer, Crown } from 'lucide-react';
import { PKXDUserAccount, isAuthorizedAdminEmail } from '../types';

interface NavbarProps {
  activeTab: 'gallery' | 'voting' | 'community_nominations' | 'ceremony' | 'admin';
  onSelectTab: (tab: 'gallery' | 'voting' | 'community_nominations' | 'ceremony' | 'admin') => void;
  userAccount: PKXDUserAccount;
  onOpenLoginModal: () => void;
  onShowCountdown?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  userAccount,
  onOpenLoginModal,
  onShowCountdown
}) => {
  const isAdmin = isAuthorizedAdminEmail(userAccount.email);
  return (
    <header className="sticky top-0 z-40 bg-[#0d0e14]/90 backdrop-blur-md border-b border-amber-500/30 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div 
            onClick={() => onSelectTab('gallery')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0a0a0d] rounded-[14px] flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-cinzel text-xl font-extrabold tracking-tight text-white">
                  XMA
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase bg-amber-400/20 border border-amber-400/40 text-amber-300">
                  2026
                </span>
              </div>
              <p className="text-[10px] font-semibold tracking-wider uppercase text-zinc-400">
                PK XD Music & Media Awards
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-black/40 p-1.5 rounded-2xl border border-zinc-800">
            <button
              id="nav-tab-gallery"
              onClick={() => onSelectTab('gallery')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-amber-400 text-black shadow-md font-extrabold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Indicados</span>
            </button>

            <button
              id="nav-tab-voting"
              onClick={() => onSelectTab('voting')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'voting'
                  ? 'bg-amber-400 text-black shadow-md font-extrabold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Vote className="w-4 h-4" />
              <span>Votação</span>
            </button>

            <button
              id="nav-tab-community"
              onClick={() => onSelectTab('community_nominations')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'community_nominations'
                  ? 'bg-amber-400 text-black shadow-md font-extrabold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Indicar Astro</span>
            </button>

            <button
              id="nav-tab-ceremony"
              onClick={() => onSelectTab('ceremony')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'ceremony'
                  ? 'bg-amber-400 text-black shadow-md font-extrabold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Resultados & Palco</span>
            </button>

            <button
              id="nav-tab-admin"
              onClick={() => onSelectTab('admin')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-md font-extrabold'
                  : isAdmin
                  ? 'text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20'
                  : 'text-zinc-400 hover:text-amber-300'
              }`}
            >
              {isAdmin ? (
                <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
              ) : (
                <Shield className="w-4 h-4 text-amber-400" />
              )}
              <span>Admins XMA</span>
              {isAdmin && (
                <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.2 rounded font-black uppercase">
                  Admin
                </span>
              )}
            </button>
          </nav>

          {/* User Account Login Button & Countdown */}
          <div className="flex items-center gap-2.5">
            {onShowCountdown && (
              <button
                onClick={onShowCountdown}
                className="px-3 py-2 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-105 active:scale-95"
                title="Ver tela de Contagem Regressiva XMA"
              >
                <Timer className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="hidden sm:inline">Contagem</span>
              </button>
            )}

            {userAccount.isLoggedIn ? (
              <button
                onClick={onOpenLoginModal}
                className="px-3.5 py-1.5 rounded-2xl bg-zinc-900 border border-amber-500/40 hover:border-amber-400 flex items-center gap-2.5 cursor-pointer transition-all shadow-md"
              >
                <img
                  src={userAccount.avatarUrl}
                  alt={userAccount.nickname}
                  className="w-7 h-7 rounded-xl object-cover border border-amber-400"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-white leading-tight">
                    {userAccount.nickname}
                  </div>
                  <div className="text-[10px] text-amber-400 font-mono">
                    {userAccount.pkxdTag} • Verificado
                  </div>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenLoginModal}
                id="login-pkxd-btn"
                className="px-4 py-2 rounded-2xl bg-gold-metallic-btn text-black font-extrabold text-xs uppercase flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar com Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center justify-around py-2.5 border-t border-zinc-800 text-[11px]">
          <button
            onClick={() => onSelectTab('gallery')}
            className={`py-1 px-2 font-bold flex flex-col items-center gap-1 ${
              activeTab === 'gallery' ? 'text-amber-400' : 'text-zinc-400'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Indicados</span>
          </button>

          <button
            onClick={() => onSelectTab('voting')}
            className={`py-1 px-2 font-bold flex flex-col items-center gap-1 ${
              activeTab === 'voting' ? 'text-amber-400' : 'text-zinc-400'
            }`}
          >
            <Vote className="w-4 h-4" />
            <span>Votação</span>
          </button>

          <button
            onClick={() => onSelectTab('community_nominations')}
            className={`py-1 px-2 font-bold flex flex-col items-center gap-1 ${
              activeTab === 'community_nominations' ? 'text-amber-400' : 'text-zinc-400'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Indicar</span>
          </button>

          <button
            onClick={() => onSelectTab('ceremony')}
            className={`py-1 px-2 font-bold flex flex-col items-center gap-1 ${
              activeTab === 'ceremony' ? 'text-amber-400' : 'text-zinc-400'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Palco</span>
          </button>

          <button
            onClick={() => onSelectTab('admin')}
            className={`py-1 px-2 font-bold flex flex-col items-center gap-1 ${
              activeTab === 'admin' 
                ? 'text-amber-400' 
                : isAdmin 
                ? 'text-amber-300' 
                : 'text-zinc-400'
            }`}
          >
            {isAdmin ? <Crown className="w-4 h-4 text-amber-400" /> : <Shield className="w-4 h-4" />}
            <span>{isAdmin ? '👑 Admin' : 'Admin'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
