import React from 'react';
import { X, ShieldCheck, FileText, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LegalModalProps {
  isOpen: boolean;
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  type,
  onClose
}) => {
  if (!isOpen || !type) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0e0f17] border-2 border-amber-500/40 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                {type === 'privacy' ? <ShieldCheck className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-xl font-black font-cinzel text-white">
                  {type === 'privacy' ? 'POLÍTICA DE PRIVACIDADE XMA' : 'TERMOS DE USO DO XMA'}
                </h3>
                <span className="text-xs text-zinc-400 font-mono">
                  Edição Oficial 2026 • XD Music & Media Awards
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {type === 'privacy' ? (
              <>
                <section className="space-y-2">
                  <h4 className="text-base font-bold font-cinzel text-white">1. Coleta de Informações</h4>
                  <p>
                    O XMA (XD Music & Media Awards) preza pela privacidade dos jogadores da comunidade PK XD. Coletamos apenas as informações estritamente necessárias para garantir a integridade dos votos, tais como identificador de sessão, nickname, tag pública de jogador no PK XD e e-mail no caso de login verificado com Google.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-base font-bold font-cinzel text-white">2. Finalidade dos Dados</h4>
                  <p>
                    Seus dados são utilizados exclusivamente para:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                    <li>Contabilizar votos com integridade eleitoral e evitar votos duplicados na mesma categoria.</li>
                    <li>Permitir o envio de indicações comunitárias oficiais e certificados de participação.</li>
                    <li>Proteger o sistema contra robôs e scripts automatizados de ataque.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h4 className="text-base font-bold font-cinzel text-white">3. Segurança e Armazenamento</h4>
                  <p>
                    Todos os registros eleitorais e logs de auditoria são protegidos com criptografia moderna e regras de segurança estritas. Não compartilhamos, vendemos ou cedemos qualquer dado pessoal a terceiros comerciais.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-base font-bold font-cinzel text-white">4. Seus Direitos</h4>
                  <p>
                    Qualquer participante pode solicitar a remoção ou redefinição dos seus dados e votos armazenados no navegador a qualquer momento utilizando as opções do painel ou limpando seu cache local.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-2">
                  <h4 className="text-base font-bold font-cinzel text-white">1. Aceitação dos Termos</h4>
                  <p>
                    Ao acessar o site oficial do XMA e registrar seus votos ou indicações, você concorda expressamente em cumprir estas diretrizes de uso, os princípios de respeito comunitário e as regras eleitorais oficiais.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-base font-bold font-cinzel text-white">2. Conduta Comunitária e Fair Play</h4>
                  <p>
                    O XMA foi idealizado para homenagear e celebrar a criatividade e a dedicação dos talentos do PK XD. São expressamente vedados:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                    <li>Uso de robôs, proxies, bots ou scripts para manipulação de resultados.</li>
                    <li>Ofensas, assédio ou discursos discriminatórios dirigidos a qualquer concorrente.</li>
                    <li>Tentativas de invasão, sobrecarga de servidores ou adulteração de dados.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h4 className="text-base font-bold font-cinzel text-white">3. Decisões do Comitê</h4>
                  <p>
                    A apuração final, desempates e auditoria técnica são conduzidos com rigor e imparcialidade pela comissão organizadora do XMA. Votos identificados como provenientes de ataques automatizados serão expurgados da contagem final.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-base font-bold font-cinzel text-white">4. Propriedade Intelectual</h4>
                  <p>
                    PK XD é uma marca registrada de seus respectivos desenvolvedores. O XMA é uma iniciativa cultural independente voltada à celebração e união da comunidade gamer.
                  </p>
                </section>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              Compreendido e Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
