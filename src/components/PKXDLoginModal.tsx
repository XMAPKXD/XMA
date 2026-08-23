import React, { useState } from 'react';
import { PKXDUserAccount, isAuthorizedAdminEmail } from '../types';
import { X, ShieldCheck, Trophy, Sparkles, LogIn, Lock, Crown } from 'lucide-react';
import { triggerGoldenConfetti } from '../utils/confetti';
import { playVoteChime } from '../utils/audio';
import { signInWithGoogle, logOutFirebase } from '../lib/firebase';

interface PKXDLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAccount: PKXDUserAccount;
  onLogin: (nickname: string, pkxdTag: string, avatarUrl: string, email?: string) => void;
  onLogout: () => void;
}

export const PKXDLoginModal: React.FC<PKXDLoginModalProps> = ({
  isOpen,
  onClose,
  userAccount,
  onLogin,
  onLogout
}) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setAuthError(null);
      const googleUser = await signInWithGoogle();
      if (googleUser) {
        const cleanName = googleUser.displayName || 'Votante XMA';
        const userTag = `#${googleUser.uid.slice(-4) || '000'}`;
        const avatar = googleUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80';
        onLogin(cleanName, userTag, avatar, googleUser.email);
        playVoteChime();
        triggerGoldenConfetti();
        onClose();
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setAuthError('Não foi possível autenticar com o Google. Tente novamente.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl bg-[#14151e] border-2 border-amber-500/50 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-white border border-zinc-700 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-700 p-0.5 mx-auto shadow-lg shadow-amber-500/30">
            <div className="w-full h-full bg-[#0a0a0d] rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-amber-400" />
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-white font-cinzel">
            {userAccount.isLoggedIn ? 'Conta Conectada' : 'Login Oficial XMA'}
          </h2>
          <p className="text-xs text-zinc-300">
            {userAccount.isLoggedIn
              ? 'Sua conta Google está autenticada e pronta para o Voto Único Oficial.'
              : 'Faça login com sua conta Google para liberar o Voto Único Oficial verificado!'}
          </p>
        </div>

        {userAccount.isLoggedIn ? (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/30 flex items-center gap-4">
              <img
                src={userAccount.avatarUrl}
                alt={userAccount.nickname}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
              />
              <div className="space-y-1">
                <div className="font-bold text-white text-base">
                  {userAccount.nickname}
                </div>
                {userAccount.email && (
                  <div className="text-xs text-zinc-300">
                    {userAccount.email}
                  </div>
                )}
                <div className="text-xs font-mono text-amber-400 font-semibold">
                  Tag: {userAccount.pkxdTag}
                </div>
                {isAuthorizedAdminEmail(userAccount.email) ? (
                  <div className="text-[11px] text-amber-300 font-extrabold flex items-center gap-1 bg-amber-500/20 border border-amber-400/50 px-2 py-0.5 rounded-md w-fit">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    Administrador Oficial Autorizado
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Conta Verificada com Google
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 text-center">
              Você já votou oficialmente em <strong>{Object.keys(userAccount.verifiedVotes).length}</strong> categorias.
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={async () => {
                  await logOutFirebase();
                  onLogout();
                  onClose();
                }}
                className="w-1/2 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Desconectar
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 rounded-xl bg-gold-metallic-btn text-black text-xs font-extrabold uppercase transition-transform cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {authError && (
              <div className="p-3 rounded-xl bg-red-900/30 border border-red-500/50 text-red-300 text-xs text-center">
                {authError}
              </div>
            )}

            {/* Google Firebase Login Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full py-4 px-5 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-900 font-extrabold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xl shadow-white/10 hover:scale-[1.02] active:scale-95"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Autenticando...' : 'Continuar com Conta Google'}</span>
            </button>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs leading-relaxed space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Votação Oficial e Segura
              </div>
              <p className="text-[11px] text-zinc-300">
                A autenticação com o Google garante a integridade da votação, permitindo 1 voto oficial verificado por categoria.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
