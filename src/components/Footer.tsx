import React from 'react';
import { 
  Trophy, 
  Sparkles, 
  Heart, 
  ShieldCheck, 
  Youtube, 
  Instagram, 
  Twitter, 
  Vote, 
  Award, 
  Crown, 
  FileText,
  Newspaper,
  ChevronRight
} from 'lucide-react';
import { AppTab } from '../types';

interface FooterProps {
  onNavigate: (tab: AppTab) => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenPrivacy,
  onOpenTerms
}) => {
  return (
    <footer className="bg-[#050609] border-t border-amber-500/20 text-white relative overflow-hidden pt-16 pb-12">
      {/* Subtle Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-20 bg-amber-500/10 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div 
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 cursor-pointer group inline-flex"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-700 p-[1.5px] shadow-lg shadow-amber-500/20">
                <div className="w-full h-full bg-[#090a0f] rounded-[10px] flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-cinzel text-xl font-black tracking-wider text-white">
                    XMA
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase bg-amber-400/20 text-amber-300 font-mono border border-amber-400/40">
                    2026
                  </span>
                </div>
                <p className="text-[9px] font-semibold tracking-widest uppercase text-zinc-400 font-mono">
                  XD MUSIC & MEDIA AWARDS
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
              A mais prestigiada premiação da comunidade PK XD. Reconhecemos criadores, músicos, arquitetos e jogadores que elevam a cultura digital com criatividade, amizade e excelência.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-300/90 font-mono">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Auditoria e Transparência Garantidas</span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
              Navegação Oficial
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('categories')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Categorias Oficiais
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('nominees')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Galeria de Indicados
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('voting')}
                  className="hover:text-amber-300 transition-colors cursor-pointer font-bold text-amber-300"
                >
                  Urna de Votação
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('rules')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Regras e Transparência
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('results')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Resultados da Premiação
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('news')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Novidades e Notícias
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
              Integridade & Privacidade
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Política de Privacidade
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTerms}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Termos de Uso
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('rules')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Auditoria de Votos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('ceremony')}
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Cerimônia ao Vivo
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
          <div>
            © 2026 XD Music & Media Awards (XMA). Todos os direitos reservados.
          </div>

          <div className="flex items-center gap-1 text-zinc-400">
            <span>Desenvolvido com carinho para a comunidade do</span>
            <strong className="text-amber-300 font-bold">PK XD</strong>
          </div>
        </div>
      </div>
    </footer>
  );
};
