import React, { useState } from 'react';
import { 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  AlertTriangle, 
  Users, 
  Clock, 
  CheckCircle2, 
  Vote, 
  Lock, 
  Award,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RuleAccordionItem {
  id: string;
  title: string;
  icon: React.ElementType;
  shortSummary: string;
  details: string[];
}

export const RulesView: React.FC = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'quem-pode-votar': true,
    'como-votar': true
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const rulesData: RuleAccordionItem[] = [
    {
      id: 'quem-pode-votar',
      title: 'Quem Pode Votar',
      icon: Users,
      shortSummary: 'A votação é aberta a todos os jogadores, criadores e fãs da comunidade PK XD.',
      details: [
        'Qualquer membro da comunidade global do PK XD pode participar da votação popular.',
        'Não há restrição de nível de conta, nacionalidade ou tempo de jogo.',
        'Recomenda-se a identificação via login Google / perfil verificado para assegurar o selo de auditoria no comprovante eleitoral.'
      ]
    },
    {
      id: 'como-votar',
      title: 'Como Votar e Confirmar as Escolhas',
      icon: Vote,
      shortSummary: 'Acesse a urna oficial, selecione um indicado por categoria e revise sua cédula antes do envio.',
      details: [
        'Navegue até a aba Votação no menu superior ou clique em qualquer botão "VOTAR AGORA".',
        'Em cada categoria, clique no botão "VOTAR" do seu indicado favorito.',
        'O card do indicado selecionado ficará iluminado em ouro com o status "SELECIONADO ✓".',
        'Você pode avançar ou pular categorias livremente e clicar em "REVISAR VOTOS" para conferir seu resumo antes da confirmação final.'
      ]
    },
    {
      id: 'quantos-votos',
      title: 'Modalidades de Voto e Quantidade Permitida',
      icon: ShieldCheck,
      shortSummary: 'O XMA 2026 adota o sistema duplo: Voto em Massa ilimitado (35%) e Voto Único com Login (65%).',
      details: [
        'Voto em Massa (Sem Login) — Peso 35%: Você pode votar quantas vezes quiser! Não exige login e foi criado especialmente para mutirões de fãs e torcidas organizadas.',
        'Voto Único Oficial (Com Login) — Peso 65%: Cada pessoa autenticada tem direito a exatamente 1 (um) voto oficial por categoria.',
        'Ao estar conectado, seu voto único é registrado de imediato. Se selecionar outro indicado na mesma categoria, seu voto único é atualizado para o novo escolhido.',
        'Você pode usar os dois métodos: registrar seu Voto Único de 65% e continuar votando no Voto em Massa de 35% para turbinar seu candidato nos mutirões.'
      ]
    },
    {
      id: 'periodo-votacao',
      title: 'Cronograma Oficial do XMA 2026',
      icon: Clock,
      shortSummary: 'Abertura no dia 10/09, fechamento no dia 20/09 e revelação dos vencedores no dia 25/09.',
      details: [
        '10 de Setembro de 2026 às 19:00 (GMT-3): Abertura oficial das urnas digitais para a votação popular em todas as categorias.',
        '20 de Setembro de 2026 às 23:59 (GMT-3): Fechamento e lacre oficial das urnas. Início do processo de auditoria de integridade e consolidação matemática.',
        '25 de Setembro de 2026 às 19:00 (GMT-3): Grande Gala Oficial ao Vivo no palco virtual do XMA com abertura dos envelopes dourados e entrega dos troféus aos vencedores.',
        'Votos recebidos após o encerramento do cronômetro no dia 20 não serão computados pela auditoria eleitoral.'
      ]
    },
    {
      id: 'criterios-avaliacao',
      title: 'Critérios de Avaliação e Pesagem dos Votos (Fórmula 65/35)',
      icon: Award,
      shortSummary: 'Apuração ponderada: 65% Voto Único Oficial (com login) + 35% Voto em Massa (sem login).',
      details: [
        'O resultado final de cada categoria combina matematicamente as duas modalidades de votação popular:',
        'Fórmula Oficial: Score Ponderado = (Voto Único com Login × 65%) + (Voto em Massa da Torcida × 35%).',
        'O Voto Único com Login possui o maior peso (65%) para assegurar a representatividade individual de cada jogador.',
        'O Voto em Massa sem Login (35%) premia o engajamento e a paixão das torcidas que mobilizam a comunidade em mutirões de cliques.',
        'Em caso de empate matemático no score ponderado, o desempate favorece o indicado com maior número absoluto de votos únicos com login.'
      ]
    },
    {
      id: 'o-que-e-proibido',
      title: 'Condutas Expressamente Proibidas',
      icon: AlertTriangle,
      shortSummary: 'É estritamente vedado o uso de scripts, bots, coação ou compras de votos.',
      details: [
        'Uso de robôs, scrapers automatizados, scripts de clique em massa ou proxies para inflar artificialmente votos.',
        'Promessa de recompensas financeiras ou itens no jogo em troca comprovada de votos.',
        'Assédio moral, ofensas ou perseguição a qualquer indicado nas redes sociais ou no jogo.',
        'Contas ou padrões identificados como fraudulentos serão descartados pelo algoritmo de integridade do XMA.'
      ]
    },
    {
      id: 'divulgacao-resultados',
      title: 'Como os Resultados Serão Divulgados',
      icon: Sparkles,
      shortSummary: 'A divulgação ocorre na grande Gala ao Vivo com transmissão em tempo real.',
      details: [
        'Os vencedores de cada categoria receberão o troféu oficial e serão anunciados durante a transmissão com envelopes virtuais selados.',
        'Imediatamente após o encerramento da cerimônia, a página RESULTADOS do site exibirá a lista completa de campeões com dados auditados.',
        'Os vencedores receberão destaque perpétuo no Hall da Fama da premiação.'
      ]
    },
    {
      id: 'politica-antifraude',
      title: 'Política Contra Manipulação e Auditoria Técnica',
      icon: Lock,
      shortSummary: 'Filtros de integridade matemática e segurança comportamental.',
      details: [
        'O sistema do XMA adota análise comportamental para identificar rajadas atípicas de tráfego que caracterizem ataques de repetição.',
        'Trabalhamos com transparência e honestidade: nosso compromisso é garantir que os votos refletidos na premiação venham de pessoas reais apaixonadas pelo multiverso PK XD.'
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span>DIRETRIZES & TRANSPARÊNCIA</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-cinzel text-white tracking-tight">
          REGRAS DO XMA
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
          Conheça o estatuto oficial, prazos, critérios de integridade e conduta da maior premiação da comunidade PK XD.
        </p>
      </div>

      {/* Accordions List */}
      <div className="space-y-4">
        {rulesData.map((rule) => {
          const Icon = rule.icon;
          const isOpen = Boolean(openSections[rule.id]);

          return (
            <div
              key={rule.id}
              className="rounded-2xl bg-[#0c0d15] border border-zinc-800/90 overflow-hidden transition-all duration-300 shadow-md shadow-black/40"
            >
              <button
                type="button"
                onClick={() => toggleSection(rule.id)}
                className="w-full p-5 sm:p-6 text-left flex items-start sm:items-center justify-between gap-4 hover:bg-[#10111a] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-amber-400" />
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white font-cinzel">
                      {rule.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {rule.shortSummary}
                    </p>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-zinc-900 text-zinc-400 shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2 border-t border-zinc-850/80 space-y-2.5">
                      {rule.details.map((detail, dIdx) => (
                        <div key={dIdx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                            {detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Security Statement */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-950 via-[#0e0f17] to-zinc-950 border border-amber-500/20 text-center space-y-2">
        <h4 className="text-sm font-bold text-white font-cinzel uppercase tracking-wider">
          Dúvidas ou denúncias de conduta irregular?
        </h4>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          Entre em contato com a equipe organizadora do XMA através dos canais oficiais da comunidade para reportar violações ou solicitar esclarecimentos.
        </p>
      </div>
    </div>
  );
};
