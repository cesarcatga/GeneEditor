import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const COR_HEADER  = "#1a3a5c";
const COR_AMBER   = "#b45309";
const COR_GREEN   = "#15803d";
const COR_ROXO    = "#7c3aed";

// ── Componente utilitário ─────────────────────
function Secao({ titulo }) {
  return (
    <div className="mt-8 mb-3">
      <p className="font-bold text-sm" style={{ color: COR_HEADER }}>{titulo}</p>
      <div className="h-px mt-1" style={{ backgroundColor: COR_HEADER }} />
    </div>
  );
}

// ── Importador NCBI ───────────────────────────
function ImportadorNcbi({ onImportar, onFechar }) {
  const [texto, setTexto]     = useState("");
  const [exons, setExons]     = useState([]);
  const [erro, setErro]       = useState("");
  const [loading, setLoading] = useState(false);

  async function identificar() {
    setErro(""); setExons([]); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("texto", texto);
      const res  = await fetch(`${API}/parsear-ncbi`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setExons(data.exons);
    } catch (e) {
      setErro(e.message || "Erro ao identificar Exons.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="px-6 py-4 text-white font-bold text-lg" style={{ backgroundColor: COR_ROXO }}>
          📥 Importar Exons do NCBI GenBank
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-500">Cole o texto da seção <em>Features</em> do NCBI GenBank abaixo.</p>
          <textarea
            className="w-full h-48 border rounded p-2 text-xs font-mono resize-y"
            placeholder="exon  1..120&#10;   /number=1&#10;exon  830..887&#10;   /number=2&#10;..."
            value={texto}
            onChange={e => setTexto(e.target.value)}
          />
          <button
            onClick={identificar}
            disabled={loading || !texto.trim()}
            className="px-5 py-2 rounded text-white font-bold text-sm disabled:opacity-50"
            style={{ backgroundColor: COR_ROXO }}
          >
            {loading ? "Identificando…" : "🔍 Identificar Exons"}
          </button>

          {erro && <p className="text-red-600 text-sm">{erro}</p>}

          {exons.length > 0 && (
            <>
              <p className="text-green-700 text-sm font-medium">
                ✅ {exons.length} exon(s) identificado(s). Revise e clique em Importar.
              </p>
              <div className="overflow-auto max-h-52 border rounded">
                <table className="w-full text-xs text-center">
                  <thead className="bg-gray-100 font-semibold">
                    <tr>
                      <th className="p-2">Exon</th>
                      <th className="p-2">Início (pb)</th>
                      <th className="p-2">Fim (pb)</th>
                      <th className="p-2">Tamanho</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exons.map(e => (
                      <tr key={e.numero} className="border-t">
                        <td className="p-2">Exon {e.numero}</td>
                        <td className="p-2">{e.inicio}</td>
                        <td className="p-2">{e.fim}</td>
                        <td className="p-2">{e.fim - e.inicio + 1} pb</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={() => onImportar(exons)}
            disabled={exons.length === 0}
            className="px-5 py-2 rounded text-white font-bold text-sm disabled:opacity-40"
            style={{ backgroundColor: COR_GREEN }}
          >
            ✅ Importar para o Editor
          </button>
          <button
            onClick={onFechar}
            className="px-5 py-2 rounded text-white text-sm bg-gray-500"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── App Principal ─────────────────────────────
export default function ExonEditorWeb() {
  // Estado geral
  const [arquivo, setArquivo]           = useState(null);
  const [sequencia, setSequencia]       = useState("");
  const [totalPb, setTotalPb]           = useState(null);
  const [previa, setPrevia]             = useState("");
  const [checkpointOk, setCheckpointOk] = useState(false);
  const [loadingCp, setLoadingCp]       = useState(false);
  const [erroCp, setErroCp]             = useState("");

  // Formatação base
  const [fonteBase, setFonteBase]     = useState("Courier New");
  const [tamBase, setTamBase]         = useState(11);
  const [corBase, setCorBase]         = useState("#aaaaaa");
  const [caixa, setCaixa]             = useState("maiuscula");

  // Exons
  const [exons, setExons]             = useState([]);
  const [ncbiAberto, setNcbiAberto]   = useState(false);
  const [inicio, setInicio]           = useState("");
  const [fim, setFim]                 = useState("");
  const [fonteExon, setFonteExon]     = useState("Courier New");
  const [tamExon, setTamExon]         = useState(14);
  const [corExon, setCorExon]         = useState("#000000");

  // Processamento
  const [loadingGerar, setLoadingGerar] = useState(false);
  const [erroGerar, setErroGerar]       = useState("");
  const [status, setStatus]             = useState("");

  // ── Checkpoint ─────────────────────────────
  async function verificarSequencia() {
    if (!arquivo) return;
    setErroCp(""); setLoadingCp(true); setCheckpointOk(false);
    setSequencia(""); setTotalPb(null); setPrevia("");
    try {
      const fd = new FormData();
      fd.append("file", arquivo);
      const res  = await fetch(`${API}/verificar`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setSequencia(data.sequencia);
      setTotalPb(data.total);
      setPrevia(data.previa);
    } catch (e) {
      setErroCp(e.message || "Erro ao ler o arquivo.");
    } finally {
      setLoadingCp(false);
    }
  }

  function confirmarCheckpoint() {
    setCheckpointOk(true);
    setStatus("Sequência confirmada. Adicione os Exons e gere o documento.");
  }

  function resetarCheckpoint() {
    setCheckpointOk(false);
    setSequencia(""); setTotalPb(null); setPrevia(""); setErroCp("");
    setExons([]);
    setStatus("Checkpoint resetado.");
  }

  // ── Importar NCBI ───────────────────────────
  function receberExonsNcbi(novos) {
    const validos = novos.filter(e => e.fim <= (totalPb || 0));
    const ignorados = novos.length - validos.length;
    const exonsFormatados = validos.map(e => ({
      numero:  e.numero,
      inicio:  e.inicio,
      fim:     e.fim,
      fonte:   fonteExon,
      tamanho: tamExon,
      cor:     corExon,
    }));
    setExons(prev => [...prev, ...exonsFormatados]);
    setNcbiAberto(false);
    setStatus(`✅ ${validos.length} exon(s) importado(s) do NCBI.${ignorados > 0 ? ` ${ignorados} ignorado(s) por exceder o total.` : ""}`);
  }

  // ── Adicionar Exon manual ───────────────────
  function adicionarExon() {
    const ini = parseInt(inicio);
    const fim_ = parseInt(fim);
    if (isNaN(ini) || isNaN(fim_)) return alert("Posições devem ser números inteiros.");
    if (ini < 1) return alert("Início deve ser ≥ 1.");
    if (ini >= fim_) return alert("Início deve ser menor que Fim.");
    if (fim_ > totalPb) return alert(`Fim (${fim_}) excede o total da sequência (${totalPb} pb).`);
    const n = exons.length + 1;
    setExons(prev => [...prev, { numero: n, inicio: ini, fim: fim_, fonte: fonteExon, tamanho: tamExon, cor: corExon }]);
    setInicio(""); setFim("");
  }

  function removerExon(idx) {
    setExons(prev => prev.filter((_, i) => i !== idx).map((e, i) => ({ ...e, numero: i + 1 })));
  }

  // ── Gerar documento ─────────────────────────
  async function gerarDocumento() {
    if (!sequencia) return;
    setErroGerar(""); setLoadingGerar(true); setStatus("Gerando documento…");
    try {
      const fd = new FormData();
      fd.append("sequencia", sequencia);
      fd.append("config_base", JSON.stringify({ fonte: fonteBase, tamanho: tamBase, cor: corBase }));
      fd.append("exons", JSON.stringify(exons));
      fd.append("caixa", caixa);
      fd.append("chars_por_linha", "60");

      const res = await fetch(`${API}/gerar`, { method: "POST", body: fd });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail);
      }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = "sequencia_anotada.docx";
      a.click();
      URL.revokeObjectURL(url);
      setStatus(`✅ Documento gerado — ${totalPb?.toLocaleString()} pb, ${exons.length} exon(s).`);
    } catch (e) {
      setErroGerar(e.message || "Erro ao gerar documento.");
      setStatus("Erro durante o processamento.");
    } finally {
      setLoadingGerar(false);
    }
  }

  const bloqueado = !checkpointOk;

  // ── Render ──────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0f4f8" }}>
      {/* Cabeçalho */}
      <div className="text-white py-4 px-6" style={{ backgroundColor: COR_HEADER }}>
        <h1 className="text-2xl font-bold">🧬 ExonEditor</h1>
        <p className="text-xs opacity-70 mt-1">Limpeza e anotação de Exons em sequências genéticas</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16">

        {/* ── ETAPA 1 ── */}
        <Secao titulo="Etapa 1 — Arquivo de Entrada" />
        <div className="flex gap-3 items-center flex-wrap">
          <label className="cursor-pointer px-4 py-2 rounded text-white text-sm font-bold"
            style={{ backgroundColor: "#2563eb" }}>
            📂 Selecionar .docx
            <input type="file" accept=".docx" className="hidden"
              onChange={e => { setArquivo(e.target.files[0]); resetarCheckpoint(); }} />
          </label>
          {arquivo && <span className="text-sm text-gray-600">{arquivo.name}</span>}
        </div>

        {/* ── ETAPA 2 ── */}
        <Secao titulo="Etapa 2 — Formatação Base (Íntrons / Sequência Geral)" />
        <div className="flex flex-wrap gap-4 items-center text-sm">
          <label className="flex items-center gap-2">
            Fonte:
            <select className="border rounded px-2 py-1"
              value={fonteBase} onChange={e => setFonteBase(e.target.value)}>
              {["Courier New","Consolas","Lucida Console","Arial","Times New Roman"].map(f =>
                <option key={f}>{f}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2">
            Tamanho:
            <input type="number" min={6} max={24} value={tamBase}
              onChange={e => setTamBase(Number(e.target.value))}
              className="border rounded w-14 px-2 py-1" />
          </label>
          <label className="flex items-center gap-2">
            Cor:
            <input type="color" value={corBase}
              onChange={e => setCorBase(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border" />
            <span className="text-xs text-gray-400 italic">(cinza — padrão)</span>
          </label>
        </div>

        {/* Caixa */}
        <div className="flex gap-6 mt-3 text-sm items-center">
          <span>Caixa:</span>
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="radio" value="maiuscula" checked={caixa === "maiuscula"}
              onChange={() => setCaixa("maiuscula")} />
            MAIÚSCULA (ATCG)
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="radio" value="minuscula" checked={caixa === "minuscula"}
              onChange={() => setCaixa("minuscula")} />
            minúscula (atcg)
          </label>
        </div>

        {/* ── BOTÃO CHECKPOINT ── */}
        <button
          onClick={verificarSequencia}
          disabled={!arquivo || loadingCp}
          className="mt-6 px-6 py-3 rounded text-white font-bold text-sm disabled:opacity-50"
          style={{ backgroundColor: COR_AMBER }}
        >
          {loadingCp ? "Verificando…" : "🔍 Verificar Sequência → Checkpoint"}
        </button>

        {/* ── PAINEL CHECKPOINT ── */}
        {totalPb !== null && (
          <div className={`mt-4 p-4 rounded border text-sm transition-all
            ${checkpointOk ? "bg-green-50 border-green-300" : "bg-yellow-50 border-yellow-300"}`}>
            <p className={`font-bold text-base ${checkpointOk ? "text-green-700" : "text-yellow-700"}`}>
              {checkpointOk ? "✅" : "📊"} Total na sequência limpa: {totalPb.toLocaleString()} pb
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Números, espaços e marcas de parágrafo removidos. Confira a prévia abaixo.
            </p>
            <div className="mt-2 p-2 rounded font-mono text-xs break-all"
              style={{ backgroundColor: checkpointOk ? "#dcfce7" : "#fefce8" }}>
              {previa}
            </div>
            {!checkpointOk && (
              <div className="flex gap-3 mt-3">
                <button onClick={confirmarCheckpoint}
                  className="px-4 py-2 rounded text-white font-bold text-sm"
                  style={{ backgroundColor: COR_GREEN }}>
                  ✅ Confirmar e Prosseguir
                </button>
                <button onClick={resetarCheckpoint}
                  className="px-4 py-2 rounded text-white text-sm bg-gray-500">
                  ↩ Resetar
                </button>
              </div>
            )}
            {checkpointOk && (
              <p className="text-green-700 text-xs mt-2 font-medium">
                Sequência confirmada. Adicione os Exons abaixo.
              </p>
            )}
          </div>
        )}
        {erroCp && <p className="text-red-600 text-sm mt-2">{erroCp}</p>}

        {/* ── ETAPA 3 ── */}
        <Secao titulo="Etapa 3 — Intervalos de Exons" />

        {bloqueado ? (
          <p className="text-sm italic" style={{ color: COR_AMBER }}>
            ⚠ Verifique e confirme a sequência na Etapa 2 para habilitar esta seção.
          </p>
        ) : (
          <div className="space-y-6">
            {/* Dois modos lado a lado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* NCBI */}
              <div className="rounded border p-4" style={{ backgroundColor: "#f5f3ff", borderColor: "#c4b5fd" }}>
                <p className="font-bold text-sm mb-1" style={{ color: COR_ROXO }}>🔬 Importar do NCBI GenBank</p>
                <p className="text-xs text-gray-500 mb-3">
                  Cole o texto da seção 'Features'.<br />Todos os Exons são detectados automaticamente.
                </p>
                <button onClick={() => setNcbiAberto(true)}
                  className="px-4 py-2 rounded text-white font-bold text-sm"
                  style={{ backgroundColor: COR_ROXO }}>
                  📥 Abrir Importador NCBI
                </button>
              </div>

              {/* Manual */}
              <div className="rounded border p-4 bg-white">
                <p className="font-bold text-sm mb-1" style={{ color: COR_HEADER }}>✏️ Adicionar Manualmente</p>
                <p className="text-xs text-gray-500 mb-3">Informe posição e formatação de cada Exon.</p>
                <div className="flex flex-wrap gap-2 text-xs items-center mb-2">
                  <label className="flex items-center gap-1">
                    Início: <input type="number" value={inicio} onChange={e => setInicio(e.target.value)}
                      className="border rounded w-20 px-1 py-1" />
                  </label>
                  <label className="flex items-center gap-1">
                    Fim: <input type="number" value={fim} onChange={e => setFim(e.target.value)}
                      className="border rounded w-20 px-1 py-1" />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2 text-xs items-center mb-3">
                  <label className="flex items-center gap-1">
                    Fonte:
                    <select className="border rounded px-1 py-1" value={fonteExon}
                      onChange={e => setFonteExon(e.target.value)}>
                      {["Courier New","Consolas","Lucida Console","Arial"].map(f => <option key={f}>{f}</option>)}
                    </select>
                  </label>
                  <label className="flex items-center gap-1">
                    Tam:
                    <input type="number" min={6} max={24} value={tamExon}
                      onChange={e => setTamExon(Number(e.target.value))}
                      className="border rounded w-12 px-1 py-1" />
                  </label>
                  <label className="flex items-center gap-1">
                    Cor:
                    <input type="color" value={corExon}
                      onChange={e => setCorExon(e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border" />
                    <span className="text-gray-400 italic">(preto)</span>
                  </label>
                </div>
                <button onClick={adicionarExon}
                  className="px-4 py-2 rounded text-white font-bold text-xs bg-green-700">
                  + Adicionar Exon
                </button>
              </div>
            </div>

            {/* Tabela de Exons */}
            {exons.length > 0 && (
              <div className="overflow-auto rounded border">
                <table className="w-full text-xs text-center">
                  <thead className="bg-gray-100 font-semibold">
                    <tr>
                      {["Exon","Início","Fim","Tamanho","Fonte","Cor",""].map(h =>
                        <th key={h} className="p-2 border-b">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {exons.map((e, i) => (
                      <tr key={i} className="border-t hover:bg-gray-50">
                        <td className="p-2">Exon {e.numero}</td>
                        <td className="p-2">{e.inicio}</td>
                        <td className="p-2">{e.fim}</td>
                        <td className="p-2">{e.fim - e.inicio + 1} pb</td>
                        <td className="p-2">{e.fonte}</td>
                        <td className="p-2">
                          <span className="inline-block w-5 h-5 rounded border"
                            style={{ backgroundColor: e.cor }} />
                        </td>
                        <td className="p-2">
                          <button onClick={() => removerExon(i)}
                            className="text-red-600 hover:text-red-800 font-bold">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {exons.length > 0 && (
              <p className="text-xs text-gray-500">{exons.length} exon(s) na lista</p>
            )}

            {/* Botão gerar */}
            <button
              onClick={gerarDocumento}
              disabled={loadingGerar}
              className="w-full py-4 rounded text-white font-bold text-base disabled:opacity-50 transition"
              style={{ backgroundColor: COR_HEADER }}
            >
              {loadingGerar ? "Gerando…" : "⚙ Processar e Baixar Documento"}
            </button>

            {erroGerar && <p className="text-red-600 text-sm">{erroGerar}</p>}
          </div>
        )}

        {/* Status */}
        {status && (
          <p className="mt-4 text-sm italic text-gray-500">{status}</p>
        )}
      </div>

      {/* Modal NCBI */}
      {ncbiAberto && (
        <ImportadorNcbi
          onImportar={receberExonsNcbi}
          onFechar={() => setNcbiAberto(false)}
        />
      )}
    </div>
  );
}
