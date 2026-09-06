import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Settings2, Lock, FileText, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CookiePreferences } from '../types';

interface CookieConsentBannerProps {
  onOpenPrivacyPolicy: () => void;
  onOpenTermsOfService: () => void;
}

const COOKIE_STORAGE_KEY = 'xma_cookie_consent_v2';

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onOpenPrivacyPolicy,
  onOpenTermsOfService
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    functional: true,
    consentGiven: false,
    timestamp: 0
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!stored) {
        // Show after small delay for elegant appearance
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      } else {
        const parsed = JSON.parse(stored);
        if (!parsed.consentGiven) {
          setIsVisible(true);
        }
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
    setPreferences(prefs);
    setIsVisible(false);
    setIsConfigureOpen(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      functional: true,
      consentGiven: true,
      timestamp: Date.now()
    });
  };

  const handleDeclineOptional = () => {
    saveConsent({
      essential: true,
      analytics: false,
      functional: false,
      consentGiven: true,
      timestamp: Date.now()
    });
  };

  const handleSaveCustom = () => {
    saveConsent({
      ...preferences,
      essential: true,
      consentGiven: true,
      timestamp: Date.now()
    });
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="p-5 sm:p-6 rounded-3xl bg-[#0e0f17]/95 border-2 border-amber-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl text-white space-y-4"
        >
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
              <Shield className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold font-cinzel text-white">
                PRIVACIDADE & COOKIES XMA
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Utilizamos cookies e tecnologias seguras para assegurar a autenticidade dos seus votos, proteger contra votos duplicados e melhorar a sua experiência no evento.
              </p>
            </div>
          </div>

          {/* Configuration drawer */}
          {isConfigureOpen && (
            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Cookies Essenciais</span>
                  <span className="text-[11px] text-zinc-400">Auditoria de votos e segurança da urna (obrigatório)</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-400/10">
                  SEMPRE ATIVO
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-850">
                <div>
                  <span className="font-bold text-white block">Cookies de Análise</span>
                  <span className="text-[11px] text-zinc-400">Métricas de tráfego agregado e integridade</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="w-4 h-4 accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-850">
                <div>
                  <span className="font-bold text-white block">Cookies de Preferência</span>
                  <span className="text-[11px] text-zinc-400">Lembrar cédula de votação e preferências de áudio</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                  className="w-4 h-4 accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Links */}
          <div className="flex items-center gap-4 text-[11px] text-zinc-400 pt-1">
            <button
              onClick={onOpenPrivacyPolicy}
              className="hover:text-amber-300 underline cursor-pointer"
            >
              Política de Privacidade
            </button>
            <span>•</span>
            <button
              onClick={onOpenTermsOfService}
              className="hover:text-amber-300 underline cursor-pointer"
            >
              Termos de Uso
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            {isConfigureOpen ? (
              <button
                onClick={handleSaveCustom}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-black text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Salvar Preferências
              </button>
            ) : (
              <>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-black text-xs font-black uppercase tracking-wider cursor-pointer shadow-md shadow-amber-500/20"
                >
                  Aceitar Todos
                </button>

                <button
                  onClick={handleDeclineOptional}
                  className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 text-xs font-bold cursor-pointer"
                >
                  Recusar
                </button>

                <button
                  onClick={() => setIsConfigureOpen(!isConfigureOpen)}
                  className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                  title="Configurar Cookies"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
