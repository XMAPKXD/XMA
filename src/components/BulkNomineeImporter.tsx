import React, { useState, useMemo, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Sparkles, 
  Layers, 
  HelpCircle, 
  FileText, 
  Music, 
  Trash2,
  Trophy,
  ArrowRight
} from 'lucide-react';
import { Category, Nominee } from '../types';
import { playFanfare, playAdminGavel, playVoteChime } from '../utils/audio';
import { triggerGoldenConfetti, triggerWinnerTrophyBlast } from '../utils/confetti';

interface ParsedNomineeItem {
  id: string;
  name: string;
  handle: string;
  pkxdId: string;
  categoryTitle: string;
  categoryId: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  avatarUrl: string;
  reason: string;
  isDuplicate: boolean;
  rawLine: string;
}

interface BulkNomineeImporterProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedCount: number, updatedCategories: Category[]) => void;
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
];

const SAMPLE_DATA = `# Exemplos de Envio em Massa (Cole linhas de texto ou dados do Excel):
# Formato: Nome | @RedeSocial | #TagPKXD | Nome da Categoria | Link YouTube (opcional)
Peter Gamer PK | @petergamer | #9921 | Gamer do Ano
Luna Astra | @luna_pkxd | #4512 | Creator do Ano | https://youtube.com/watch?v=dQw4w9WgXcQ
Bia Estilosa | @bia_fashion | #7781 | Look / Estilo do Ano
Leo Beats | @leobeats | #3344 | Música do Ano | https://youtu.be/example
Guilherme Speed | @guispeed | #1120 | Revelação do Ano`;

export const BulkNomineeImporter: React.FC<BulkNomineeImporterProps> = ({
  categories,
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [defaultCategoryId, setDefaultCategoryId] = useState<string>(categories[0]?.id || '');
  const [skipDuplicates, setSkipDuplicates] = useState<boolean>(true);
  const [assignDefaultAvatar, setAssignDefaultAvatar] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to match category by name, subtitle or ID
  const findCategory = (rawCat: string): Category | undefined => {
    if (!rawCat) return undefined;
    const clean = rawCat.trim().toLowerCase();
    return categories.find(
      (c) =>
        c.id.toLowerCase() === clean ||
        c.title.toLowerCase() === clean ||
        c.title.toLowerCase().includes(clean) ||
        c.subtitle.toLowerCase().includes(clean)
    );
  };

  // Parse raw text into structured items
  const parsedItems: ParsedNomineeItem[] = useMemo(() => {
    if (!inputText.trim()) return [];

    const lines = inputText.split(/\r?\n/);
    const items: ParsedNomineeItem[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      // Skip empty lines or commented lines starting with # or //
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) {
        return;
      }

      // Check delimiters: Tab (Excel), Pipe (|), Semicolon (;), Comma (,)
      let parts: string[] = [];
      if (trimmed.includes('\t')) {
        parts = trimmed.split('\t');
      } else if (trimmed.includes('|')) {
        parts = trimmed.split('|');
      } else if (trimmed.includes(';')) {
        parts = trimmed.split(';');
      } else if (trimmed.includes(',')) {
        parts = trimmed.split(',');
      } else {
        parts = [trimmed];
      }

      const cleanParts = parts.map((p) => p.trim());
      const rawName = cleanParts[0] || '';
      if (!rawName) return;

      const rawHandle = cleanParts[1] || '';
      const rawPkxdId = cleanParts[2] || '';
      const rawCategory = cleanParts[3] || '';
      const rawYoutube = cleanParts[4] || '';
      const rawThumbnail = cleanParts[5] || '';
      const rawAvatar = cleanParts[6] || '';
      const rawReason = cleanParts[7] || '';

      // Determine Category
      let matchedCat = findCategory(rawCategory);
      if (!matchedCat) {
        matchedCat = categories.find((c) => c.id === defaultCategoryId) || categories[0];
      }

      const targetCatId = matchedCat?.id || defaultCategoryId || categories[0]?.id || 'cat-default';
      const targetCatTitle = matchedCat?.title || 'Categoria';

      // Format Handle
      let cleanHandle = rawHandle;
      if (cleanHandle && !cleanHandle.startsWith('@')) {
        cleanHandle = `@${cleanHandle}`;
      }
      if (!cleanHandle) {
        cleanHandle = `@${rawName.toLowerCase().replace(/\s+/g, '_')}`;
      }

      // Format PKXD ID
      let cleanPkxd = rawPkxdId;
      if (cleanPkxd && !cleanPkxd.startsWith('#')) {
        cleanPkxd = `#${cleanPkxd}`;
      }
      if (!cleanPkxd) {
        cleanPkxd = `#${Math.floor(1000 + Math.random() * 9000)}`;
      }

      // Check if duplicate in the target category
      const targetCat = categories.find((c) => c.id === targetCatId);
      const isDuplicate = Boolean(
        targetCat?.nominees.some(
          (nom) =>
            nom.name.trim().toLowerCase() === rawName.toLowerCase() ||
            (nom.handle && nom.handle.toLowerCase() === cleanHandle.toLowerCase())
        )
      );

      items.push({
        id: `parsed-${index}-${Date.now()}`,
        name: rawName,
        handle: cleanHandle,
        pkxdId: cleanPkxd,
        categoryId: targetCatId,
        categoryTitle: targetCatTitle,
        youtubeUrl: rawYoutube,
        thumbnailUrl: rawThumbnail,
        avatarUrl: rawAvatar,
        reason: rawReason || 'Indicado Oficial cadastrado em massa via XMA 2026',
        isDuplicate,
        rawLine: trimmed
      });
    });

    return items;
  }, [inputText, defaultCategoryId, categories]);

  // Valid non-duplicate items (or all items if skipDuplicates is disabled)
  const itemsToImport = useMemo(() => {
    if (skipDuplicates) {
      return parsedItems.filter((item) => !item.isDuplicate);
    }
    return parsedItems;
  }, [parsedItems, skipDuplicates]);

  // File Upload Handler (CSV / TXT / JSON)
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        // If JSON file
        if (file.name.endsWith('.json')) {
          try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
              const lines = parsed.map((item) => {
                const name = item.name || item.nomineeName || '';
                const handle = item.handle || item.instagram || item.tiktok || '';
                const pkxdId = item.pkxdId || item.tag || '';
                const cat = item.category || item.categoryTitle || item.categoryId || '';
                const yt = item.youtubeUrl || item.youtube || '';
                return `${name} | ${handle} | ${pkxdId} | ${cat} | ${yt}`;
              });
              setInputText(lines.join('\n'));
              playVoteChime();
              return;
            }
          } catch (err) {
            console.error('Falha ao processar JSON:', err);
          }
        }
        // TXT or CSV
        setInputText(content);
        playVoteChime();
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Download Sample CSV
  const handleDownloadSampleCsv = () => {
    const headers = 'Nome,Rede_Social,Tag_PKXD,Nome_Da_Categoria,Link_YouTube';
    const sampleRows = [
      'Peter Gamer PK,@petergamer,#9921,Gamer do Ano,https://youtube.com/watch?v=example1',
      'Luna Astra,@luna_pkxd,#4512,Creator do Ano,',
      'Leo Beats,@leobeats,#3344,Música do Ano,https://youtu.be/musica_exemplo',
      'Bia Fashion,@bia_estilo,#7781,Look / Estilo do Ano,'
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...sampleRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'modelo_envio_massa_indicados_xma.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Execute Bulk Import
  const handleConfirmImport = () => {
    if (itemsToImport.length === 0) return;

    setIsProcessing(true);

    try {
      // Group items by categoryId
      const grouped: { [catId: string]: Nominee[] } = {};

      itemsToImport.forEach((item, idx) => {
        const catId = item.categoryId;
        if (!grouped[catId]) {
          grouped[catId] = [];
        }

        const avatar =
          item.avatarUrl ||
          (assignDefaultAvatar
            ? DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length]
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80');

        const newNominee: Nominee = {
          id: `nom-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
          name: item.name.trim(),
          handle: item.handle.trim(),
          avatarUrl: avatar,
          categoryId: catId,
          projectTitle: item.reason || 'Indicado Oficial XMA 2026',
          projectDescription: item.reason || '',
          projectType: item.youtubeUrl ? 'music_clip' : 'media_creator',
          votes: 0,
          verifiedVotes: 0,
          massVotes: 0,
          pkxdId: item.pkxdId.trim(),
          bio: item.reason || 'Indicado oficial na disputa pelo Troféu XMA 2026.',
          youtubeUrl: item.youtubeUrl ? item.youtubeUrl.trim() : undefined,
          projectMediaUrl: item.youtubeUrl ? item.youtubeUrl.trim() : undefined,
          thumbnailUrl: item.thumbnailUrl ? item.thumbnailUrl.trim() : undefined
        };

        grouped[catId].push(newNominee);
      });

      // Update Categories
      const updatedCategories = categories.map((cat) => {
        const toAdd = grouped[cat.id];
        if (toAdd && toAdd.length > 0) {
          return {
            ...cat,
            nominees: [...cat.nominees, ...toAdd]
          };
        }
        return cat;
      });

      playFanfare();
      playAdminGavel();
      triggerGoldenConfetti();
      triggerWinnerTrophyBlast();

      onImportSuccess(itemsToImport.length, updatedCategories);
      onClose();
    } catch (err) {
      console.error('Erro ao importar indicados em lote:', err);
      alert('Ocorreu um erro ao processar os indicados.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div 
        className="relative w-full max-w-4xl bg-gradient-to-b from-[#161724] via-[#11121c] to-[#0b0c14] border-2 border-amber-500/50 rounded-3xl shadow-2xl shadow-amber-950/50 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {/* Ambient glow */}
        <div className="absolute -top-16 -right-16 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-800 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Módulo Administrativo XMA
              </span>
              <span className="text-zinc-500 text-xs">•</span>
              <span className="text-xs text-zinc-400">Importação em Lote</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-cinzel flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-amber-400 shrink-0" />
              <span>Envio em Massa de Indicados</span>
            </h2>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Adicione múltiplos indicados simultaneamente colando dados de planilhas (Excel/Google Sheets), arquivos CSV ou linhas de texto.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 transition-all cursor-pointer shrink-0"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-black/40 border border-zinc-800 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setInputText(SAMPLE_DATA)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Carregar Exemplo Rápido</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSampleCsv}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Baixar Modelo CSV</span>
            </button>

            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/40 border border-red-800/50 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>
            )}
          </div>

          {/* Upload Button */}
          <label className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white font-bold flex items-center gap-2 cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Subir Arquivo (CSV / TXT / JSON)</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
          </label>
        </div>

        {/* Form Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Default Category Selector */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Categoria Padrão (para linhas sem categoria especificada)
            </label>
            <select
              value={defaultCategoryId}
              onChange={(e) => setDefaultCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/80 border border-zinc-700 focus:border-amber-400 text-amber-300 text-xs font-bold outline-none transition-all cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-zinc-950 text-white">
                  {c.title} ({c.nominees.length} indicados existentes)
                </option>
              ))}
            </select>
            <p className="text-[10px] text-zinc-500 mt-1">
              Dica: Você também pode digitar o nome da categoria diretamente em cada linha para associar automaticamente.
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2 p-3 rounded-xl bg-black/40 border border-zinc-800/80">
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={skipDuplicates}
                onChange={(e) => setSkipDuplicates(e.target.checked)}
                className="rounded border-zinc-700 text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
              />
              <span className="font-semibold">Pular indicados repetidos</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={assignDefaultAvatar}
                onChange={(e) => setAssignDefaultAvatar(e.target.checked)}
                className="rounded border-zinc-700 text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
              />
              <span className="font-semibold">Gerar avatares automáticos</span>
            </label>
          </div>
        </div>

        {/* Input Textarea with Drag & Drop Area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Cole ou Digite os Dados dos Indicados (uma pessoa por linha)
            </label>
            <span className="text-[11px] font-mono text-zinc-400">
              Formato: <strong className="text-amber-300">Nome | @rede | #tag | Categoria</strong>
            </span>
          </div>

          <div className={`relative rounded-2xl transition-all ${isDragging ? 'ring-2 ring-amber-400 scale-[1.005]' : ''}`}>
            <textarea
              rows={7}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Cole aqui os indicados copiados do Excel ou Bloco de Notas...&#10;Exemplo:&#10;Luna Gamer | @lunagamer | #12345 | Gamer do Ano&#10;Peter PK | @peterpk | #67890 | Creator do Ano"
              className="w-full p-4 rounded-2xl bg-black/80 border border-zinc-700 focus:border-amber-400 text-white font-mono text-xs placeholder:text-zinc-600 outline-none transition-all resize-y"
            />

            {isDragging && (
              <div className="absolute inset-0 rounded-2xl bg-amber-500/20 backdrop-blur-sm border-2 border-dashed border-amber-400 flex items-center justify-center text-amber-300 font-bold text-sm">
                Solte seu arquivo CSV / TXT / JSON aqui para carregar!
              </div>
            )}
          </div>
        </div>

        {/* Live Preview Table */}
        {parsedItems.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-bold text-white font-cinzel">
                  Prévia dos Indicados Identificados ({parsedItems.length})
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-emerald-400 font-bold">
                  {itemsToImport.length} válidos para envio
                </span>
                {parsedItems.length - itemsToImport.length > 0 && (
                  <span className="text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                    {parsedItems.length - itemsToImport.length} duplicados ignorados
                  </span>
                )}
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto rounded-2xl border border-zinc-800 bg-black/60 divide-y divide-zinc-800/80">
              {parsedItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-3 flex items-center justify-between gap-3 text-xs ${
                    item.isDuplicate && skipDuplicates ? 'opacity-50 bg-red-950/10' : 'hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 text-center font-mono text-[11px] text-zinc-500 shrink-0">
                      #{idx + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white truncate">{item.name}</span>
                        <span className="text-[11px] font-mono text-zinc-400">{item.handle}</span>
                        <span className="text-[10px] font-mono text-amber-400/90">{item.pkxdId}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold truncate max-w-xs">
                          {item.categoryTitle}
                        </span>
                        {item.youtubeUrl && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950/60 border border-red-500/40 text-red-300 font-medium flex items-center gap-1">
                            <Music className="w-2.5 h-2.5" />
                            YouTube
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {item.isDuplicate ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        {skipDuplicates ? 'Duplicado (Pular)' : 'Já Existe'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Pronto
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-800">
          <div className="text-xs text-zinc-400 text-center sm:text-left">
            {itemsToImport.length > 0 ? (
              <span>
                Pronto para cadastrar <strong className="text-amber-300">{itemsToImport.length} indicados</strong> no XMA 2026.
              </span>
            ) : (
              <span>Nenhum indicado válido identificado para importar.</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={itemsToImport.length === 0 || isProcessing}
              onClick={handleConfirmImport}
              className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl ${
                itemsToImport.length > 0 && !isProcessing
                  ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isProcessing
                  ? 'Importando...'
                  : `Cadastrar ${itemsToImport.length} Indicados em Massa`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
