import React, { useState } from 'react';
import { 
  Trophy, 
  Vote, 
  Award, 
  Shield, 
  Sparkles, 
  LogIn, 
  Clock, 
  Crown, 
  Menu,
  X,
  FileText,
  Flame,
  Radio,
  Newspaper,
  ChevronRight,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PKXDUserAccount, isAuthorizedAdminEmail, AppTab } from '../types';

interface NavbarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = isAuthorizedAdminEmail(userAccount.email);

  const navLinks: { id: AppTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'home', label: 'INÍCIO', icon: Sparkles },
    { id: 'categories', label: 'CATEGORIAS', icon: Award },
    { id: 'nominees', label: 'INDICADOS', icon: Trophy },
    { id: 'voting', label: 'VOTAÇÃO', icon: Vote, badge: 'ABERTA' },
    { id: 'rules', label: 'REGRAS', icon: FileText },
    { id: 'results', label: 'RESULTADOS', icon: Crown },
    { id: 'news', label: 'NOVIDADES', icon: Newspaper }
  ];

  const handleNavClick = (tab: AppTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="w-full bg-[#07080c]/95 backdrop-blur-xl border-b border-amber-500/15 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo XMA - XD Music & Media Awards */}
            <div 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 cursor-pointer group select-none"
              id="brand-logo"
            >
              <div className="relative">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-700 p-[1.5px] shadow-lg shadow-amber-500/20 group-hover:shadow-amber-400/40 transition-all duration-300 group-hover:scale-105">
                  <div className="w-full h-full bg-[#090a0f] rounded-[10px] flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-amber-400 group-hover:rotate-6 transition-transform" />
                  </div>
                </div>
                <div className="absolute -inset-1 bg-amber-400/20 blur-md -z-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-cinzel text-xl sm:text-2xl font-black tracking-wider text-white group-hover:text-amber-200 transition-colors">
                    XMA
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase bg-gradient-to-r from-amber-400/20 to-amber-500/10 border border-amber-400/40 text-amber-300 font-mono">
                    2026
                  </span>
                </div>
                <p className="text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase text-zinc-400 font-mono">
                  XD MUSIC & MEDIA AWARDS
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1 bg-[#101119]/80 p-1.5 rounded-full border border-zinc-800/80 shadow-inner">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    id={`nav-link-${link.id}`}
                    onClick={() => handleNavClick(link.id)}
                    className={`relative px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black shadow-md shadow-amber-500/25 font-black scale-[1.02]'
                        : 'text-zinc-300 hover:text-white hover:bg-zinc-900/70'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-black tracking-wider ${
                        isActive ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {link.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Medium screen Navigation (Compact) */}
            <nav className="hidden lg:flex xl:hidden items-center gap-1 bg-[#101119]/80 p-1.5 rounded-full border border-zinc-800/80">
              {navLinks.slice(0, 5).map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      isActive
                        ? 'bg-amber-400 text-black font-black'
                        : 'text-zinc-300 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Action Area */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Highlight Action Button: VOTAR AGORA */}
              <button
                onClick={() => handleNavClick('voting')}
                id="btn-votar-agora-navbar"
                className="hidden sm:inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:shadow-amber-400/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Vote className="w-3.5 h-3.5" />
                <span>VOTAR AGORA</span>
                <ChevronRight className="w-3.5 h-3.5 -ml-1" />
              </button>

              {/* Admin Quick Entry */}
              <button
                onClick={() => handleNavClick('admin')}
                className={`p-2 rounded-full border transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-amber-400 text-black border-amber-400'
                    : isAdmin
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
                title="Painel Administrativo"
                id="nav-admin-button"
              >
                {isAdmin ? (
                  <Crown className="w-4 h-4 text-amber-400" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
              </button>

              {/* Login / Profile Button */}
              {userAccount.isLoggedIn ? (
                <button
                  onClick={onOpenLoginModal}
                  className="px-2.5 sm:px-3.5 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-amber-500/40 flex items-center gap-2 cursor-pointer transition-all shadow-md"
                  id="user-profile-button"
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
                    <div className="text-[9px] text-amber-300 font-mono mt-0.5">
                      {userAccount.pkxdTag || '#PKXD'}
                    </div>
                  </div>
                </button>
              ) : (
                <button
                  onClick={onOpenLoginModal}
                  id="login-pkxd-btn"
                  className="px-3 sm:px-4 py-2 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 hover:border-amber-400/60 text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Entrar</span>
                </button>
              )}

              {/* Mobile Menu Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-white hover:border-amber-500/40 transition-all cursor-pointer"
                aria-label="Abrir Menu de Navegação"
                id="mobile-menu-toggle"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="xl:hidden bg-[#0a0b12] border-b border-amber-500/20 px-4 py-6 shadow-2xl overflow-hidden"
            >
              <div className="space-y-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = activeTab === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => handleNavClick(link.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black font-black'
                          : 'bg-zinc-900/60 text-zinc-300 hover:bg-zinc-900 hover:text-white border border-zinc-850'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{link.label}</span>
                      </div>
                      {link.badge ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {link.badge}
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      )}
                    </button>
                  );
                })}

                {/* Additional tabs in drawer */}
                <button
                  onClick={() => handleNavClick('community_nominations')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'community_nominations'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-black'
                      : 'bg-zinc-900/60 text-zinc-300 hover:bg-zinc-900 hover:text-white border border-zinc-850'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Indicações da Comunidade</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                <button
                  onClick={() => handleNavClick('ceremony')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'ceremony'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-black'
                      : 'bg-zinc-900/60 text-zinc-300 hover:bg-zinc-900 hover:text-white border border-zinc-850'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Palco ao Vivo & Envelopes</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                <button
                  onClick={() => handleNavClick('admin')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-amber-400 text-black font-black'
                      : 'bg-zinc-900/60 text-zinc-300 hover:bg-zinc-900 hover:text-white border border-zinc-850'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Painel Administrativo</span>
                  </div>
                  {isAdmin && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400 text-black font-black">
                      STAFF
                    </span>
                  )}
                </button>

                {/* Mobile Highlight CTA */}
                <div className="pt-3">
                  <button
                    onClick={() => handleNavClick('voting')}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 cursor-pointer"
                  >
                    <Vote className="w-4 h-4" />
                    <span>VOTAR AGORA NOS FAVORITOS</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};
