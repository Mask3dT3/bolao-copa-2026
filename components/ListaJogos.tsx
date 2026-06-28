"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import CardJogo from "./CardJogo";
import TabelaClassificacao from "./TabelaClassificacao";
import {
  agruparJogos,
  calcularClassificacao,
  listarGrupos,
  listarFasesMataMata,
  JogoGrupo,
  PalpiteUsuario,
} from "@/lib/classificacao";
import { Sparkles, Calendar, Grid3x3, Trophy, ChevronDown } from "lucide-react";

type Jogo = JogoGrupo & {
  id: number;
  estadio: string | null;
  data_jogo: string;
};

type Aposta = {
  id?: number;
  user_id: string;
  jogo_id: number;
  gols_a: number | null;
  gols_b: number | null;
  pontos?: number | null;
  revelado?: boolean;
  profiles?: { nome: string };
};

type Modo = "data" | "grupo";

// Lista FIXA dos 12 grupos da Copa 2026 (A-L) + Mata-mata
const GRUPOS_FIXOS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

// Formata contagem regressiva: >1d => "2d 5h"; 1-24h => "5h 03m"; <1h => "12:34"
function formatarCountdown(ms: number): string {
  if (ms <= 0) return "";
  const totalSeg = Math.floor(ms / 1000);
  const dias = Math.floor(totalSeg / 86400);
  const horas = Math.floor((totalSeg % 86400) / 3600);
  const min = Math.floor((totalSeg % 3600) / 60);
  const seg = totalSeg % 60;
  if (dias >= 1) return `${dias}d ${horas}h`;
  if (horas >= 1) return `${horas}h ${String(min).padStart(2, "0")}m`;
  return `${min}:${String(seg).padStart(2, "0")}`;
}

// Banner do jogo de agora / próximo, com contagem regressiva ao vivo
function BannerFoco({ jogo, onVer }: { jogo: Jogo; onVer: () => void }) {
  const [agoraMs, setAgoraMs] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setAgoraMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const data = new Date(jogo.data_jogo);
  const msRestante = data.getTime() - agoraMs;
  const aoVivo = msRestante <= 0 && !jogo.finalizado;

  return (
    <div className="mb-4 rounded-2xl border border-[var(--gold)]/30 bg-[var(--gold)]/[0.06] p-4 flex items-center gap-3 stagger-item">
      <div className="flex-1 min-w-0">
        <div
          className={`font-display text-[10px] tracking-[2px] flex items-center gap-1.5 ${
            aoVivo ? "text-red-400" : "text-[var(--gold)]"
          }`}
        >
          {aoVivo ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              AO VIVO AGORA
            </>
          ) : (
            "PRÓXIMO JOGO"
          )}
        </div>
        <div className="font-semibold truncate mt-0.5">
          {jogo.time_a} <span className="text-faint">×</span> {jogo.time_b}
        </div>
        <div className="text-xs text-muted font-mono mt-0.5">
          {data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} ·{" "}
          {data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
      <div className="text-right shrink-0">
        {aoVivo ? (
          <div className="font-display text-xs tracking-[1px] text-red-400">EM ANDAMENTO</div>
        ) : (
          <div className="font-score font-bold text-2xl text-[var(--gold)] leading-none">
            {formatarCountdown(msRestante)}
          </div>
        )}
        <button
          onClick={onVer}
          className="mt-2 inline-flex items-center gap-1 text-[10px] font-display tracking-[1.5px] text-secondary hover:text-primary border border-default hover:border-strong rounded-full px-2.5 py-1"
        >
          VER <ChevronDown size={12} />
        </button>
      </div>
    </div>
  );
}

export default function ListaJogos({
  jogos,
  apostasPorJogo,
  minhasApostas,
  userId,
}: {
  jogos: Jogo[];
  apostasPorJogo: Record<number, Aposta[]>;
  minhasApostas: Record<number, Aposta>;
  userId: string;
}) {
  const [modo, setModo] = useState<Modo>("data"); // POR DATA é o padrão ao abrir
  const [grupoAtivo, setGrupoAtivo] = useState<string>("Grupo A");
  const [faseMM, setFaseMM] = useState<string>(""); // fase ativa dentro do Mata-mata
  const [filtroData, setFiltroData] = useState<"todos" | "pendentes" | "proximos" | "encerrados">(
    "todos"
  );

  const focoRef = useRef<HTMLDivElement | null>(null);
  const agora = new Date();

  // Mede a altura do cabeçalho fixo pra encaixar a barra de filtros logo abaixo dele
  const [topo, setTopo] = useState(0);
  useEffect(() => {
    const medir = () => {
      const header = document.querySelector("header");
      setTopo(header ? Math.round(header.getBoundingClientRect().height) : 0);
    };
    medir();
    const t = setTimeout(medir, 300); // remede depois que fontes/imagens carregam
    window.addEventListener("resize", medir);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", medir);
    };
  }, []);

  const gruposDisponiveis = useMemo(() => listarGrupos(jogos), [jogos]);

  // Fases de mata-mata que têm jogos + qual está ativa
  const fasesMataMata = useMemo(() => listarFasesMataMata(jogos), [jogos]);
  const faseMMAtiva =
    faseMM && fasesMataMata.includes(faseMM) ? faseMM : fasesMataMata[0] || "";

  const jogosDoGrupo = useMemo(() => {
    if (modo !== "grupo" || !grupoAtivo) return [];
    const agrupados = agruparJogos(jogos);
    const base = agrupados[grupoAtivo] || [];
    // No Mata-mata, filtra pela fase ativa (Oitavas, Quartas, ...)
    if (grupoAtivo === "Mata-mata" && faseMMAtiva) {
      return base.filter((j) => j.fase === faseMMAtiva);
    }
    return base;
  }, [jogos, grupoAtivo, modo, faseMMAtiva]);

  // Lista por data: SEMPRE em ordem cronológica (ascendente)
  const jogosPorData = useMemo(() => {
    if (modo !== "data") return [];
    const filtrados = jogos.filter((j) => {
      const data = new Date(j.data_jogo);
      const jaComecou = data <= agora;
      const finalizado = j.finalizado;
      const temAposta = !!minhasApostas[j.id];

      switch (filtroData) {
        case "pendentes":
          return !jaComecou && !finalizado && !temAposta;
        case "proximos":
          return !jaComecou && !finalizado;
        case "encerrados":
          return finalizado;
        default:
          return true;
      }
    });
    return filtrados.sort(
      (a, b) => new Date(a.data_jogo).getTime() - new Date(b.data_jogo).getTime()
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jogos, filtroData, minhasApostas, modo]);

  // Jogo "foco": ao vivo agora -> senão o próximo a acontecer -> senão o último encerrado
  const foco = useMemo<Jogo | null>(() => {
    if (modo !== "data" || jogos.length === 0) return null;
    const ordenados = [...jogos].sort(
      (a, b) => new Date(a.data_jogo).getTime() - new Date(b.data_jogo).getTime()
    );
    const t = Date.now();
    const aoVivo = ordenados.find(
      (j) => new Date(j.data_jogo).getTime() <= t && !j.finalizado
    );
    if (aoVivo) return aoVivo;
    const proximo = ordenados.find(
      (j) => new Date(j.data_jogo).getTime() > t && !j.finalizado
    );
    if (proximo) return proximo;
    const encerrados = ordenados.filter((j) => j.finalizado);
    return encerrados.length ? encerrados[encerrados.length - 1] : ordenados[ordenados.length - 1];
  }, [jogos, modo]);

  function rolarParaFoco() {
    // garante que o jogo em foco esteja na lista atual, depois rola até ele
    setFiltroData("todos");
    setTimeout(() => {
      focoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  }

  const ehGrupo = grupoAtivo !== "Mata-mata" && grupoAtivo !== "";

  const classificacaoReal = useMemo(() => {
    if (!ehGrupo) return [];
    return calcularClassificacao(jogosDoGrupo, null);
  }, [jogosDoGrupo, ehGrupo]);

  const meusPalpites = useMemo<PalpiteUsuario[]>(() => {
    return jogosDoGrupo
      .map((j) => minhasApostas[j.id])
      .filter((a): a is Aposta => !!a && a.gols_a !== null && a.gols_b !== null)
      .map((a) => ({
        jogo_id: a.jogo_id,
        gols_a: a.gols_a!,
        gols_b: a.gols_b!,
      }));
  }, [jogosDoGrupo, minhasApostas]);

  const classificacaoSimulada = useMemo(() => {
    if (!ehGrupo) return [];
    return calcularClassificacao(jogosDoGrupo, meusPalpites);
  }, [jogosDoGrupo, meusPalpites, ehGrupo]);

  const [modoTabela, setModoTabela] = useState<"real" | "simulado">("real");
  const temPalpitesNoGrupo = meusPalpites.length > 0;
  const temJogosFinalizados = jogosDoGrupo.some((j) => j.finalizado);

  const contadores = useMemo(() => {
    if (modo !== "data") return { pendentes: 0, proximos: 0, encerrados: 0 };
    const pendentes = jogos.filter((j) => {
      const data = new Date(j.data_jogo);
      return data > agora && !j.finalizado && !minhasApostas[j.id];
    }).length;
    const proximos = jogos.filter((j) => {
      const data = new Date(j.data_jogo);
      return data > agora && !j.finalizado;
    }).length;
    const encerrados = jogos.filter((j) => j.finalizado).length;
    return { pendentes, proximos, encerrados };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jogos, minhasApostas, modo]);

  const filtros = [
    { key: "todos", label: "Todos", count: jogos.length },
    { key: "pendentes", label: "Sem palpite", count: contadores.pendentes },
    { key: "proximos", label: "Próximos", count: contadores.proximos },
    { key: "encerrados", label: "Encerrados", count: contadores.encerrados },
  ];

  return (
    <div>
      {/* Barra de controles fixa (gruda logo abaixo do cabeçalho) */}
      <div
        className="sticky z-30 -mx-4 px-4 pt-3 pb-2.5 bg-[var(--bg-elevated)] border-b border-default"
        style={{ top: topo }}
      >
        {/* Toggle POR DATA / POR GRUPO */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 bg-[var(--bg-card)] border border-default rounded-xl">
            <button
              onClick={() => setModo("data")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-display tracking-[1.5px] transition ${
                modo === "data"
                  ? "bg-[var(--gold)] text-black font-bold"
                  : "text-secondary hover:text-primary"
              }`}
            >
              <Calendar size={13} /> POR DATA
            </button>
            <button
              onClick={() => setModo("grupo")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-display tracking-[1.5px] transition ${
                modo === "grupo"
                  ? "bg-[var(--gold)] text-black font-bold"
                  : "text-secondary hover:text-primary"
              }`}
            >
              <Grid3x3 size={13} /> POR GRUPO
            </button>
          </div>
        </div>

        {/* Filtros (só no modo data) */}
        {modo === "data" && (
          <div className="flex gap-2 overflow-x-auto mt-2.5 pb-0.5 -mx-1 px-1">
            {filtros.map((f) => {
              const ativo = filtroData === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFiltroData(f.key as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-display tracking-[1.5px] whitespace-nowrap border transition ${
                    ativo
                      ? "bg-[var(--gold)] text-black border-[var(--gold)] font-bold"
                      : "bg-[var(--bg-card)] text-secondary border-default hover:border-strong"
                  }`}
                >
                  {f.label.toUpperCase()}
                  <span
                    className={`text-[10px] font-mono ${ativo ? "text-black/60" : "text-muted"}`}
                  >
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* MODO POR GRUPO */}
      {modo === "grupo" && (
        <div className="mt-5">
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-5">
            {GRUPOS_FIXOS.map((letra) => {
              const grupo = `Grupo ${letra}`;
              const ativo = grupo === grupoAtivo;
              const temJogos = gruposDisponiveis.includes(grupo);
              return (
                <button
                  key={letra}
                  onClick={() => setGrupoAtivo(grupo)}
                  disabled={!temJogos}
                  className={`relative py-2.5 rounded-lg text-sm font-display tracking-wider transition ${
                    ativo
                      ? "bg-[var(--gold)] text-black font-bold shadow-lg shadow-[var(--gold)]/30"
                      : temJogos
                      ? "bg-[var(--bg-card)] border border-default text-secondary hover:border-strong"
                      : "bg-[var(--bg-card)]/50 border border-default text-faint cursor-not-allowed"
                  }`}
                  title={!temJogos ? "Sem jogos ainda" : undefined}
                >
                  <span className={`text-[9px] block ${ativo ? "text-black/60" : "text-muted"}`}>
                    GRUPO
                  </span>
                  <span className="text-lg font-bold leading-none">{letra}</span>
                </button>
              );
            })}
            <button
              onClick={() => setGrupoAtivo("Mata-mata")}
              className={`col-span-4 sm:col-span-1 relative py-2.5 rounded-lg text-sm font-display tracking-wider transition flex items-center justify-center gap-1.5 ${
                grupoAtivo === "Mata-mata"
                  ? "bg-[var(--gold)] text-black font-bold shadow-lg shadow-[var(--gold)]/30"
                  : "bg-[var(--bg-card)] border border-default text-secondary hover:border-strong"
              }`}
            >
              <Trophy size={14} />
              <span className="font-bold">MATA-MATA</span>
            </button>
          </div>

          {/* Navegação por fase + regra dos 90' (só no Mata-mata) */}
          {grupoAtivo === "Mata-mata" && fasesMataMata.length > 0 && (
            <div className="stagger-item">
              {/* Chips de fase: Oitavas · Quartas · Semis · Final */}
              <div className="flex gap-2 overflow-x-auto pb-1 mb-4 -mx-1 px-1">
                {fasesMataMata.map((f) => {
                  const ativa = f === faseMMAtiva;
                  return (
                    <button
                      key={f}
                      onClick={() => setFaseMM(f)}
                      className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[12px] font-display tracking-[1.5px] border transition ${
                        ativa
                          ? "bg-[var(--gold)] text-black border-[var(--gold)] font-bold"
                          : "bg-[var(--bg-card)] text-secondary border-default hover:border-strong"
                      }`}
                    >
                      {f.toUpperCase()}
                    </button>
                  );
                })}
              </div>

              {/* Faixa da regra dos 90' */}
              <div className="mb-5 rounded-2xl border border-[var(--gold)]/30 bg-[var(--gold)]/[0.06] p-4 flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-[var(--danger)] text-[var(--danger)] flex items-center justify-center font-score font-bold text-base">
                  90′
                </div>
                <div className="min-w-0">
                  <div className="font-display tracking-[1px] text-[var(--gold)]">
                    NO MATA-MATA, VALE AOS 90'
                  </div>
                  <div className="text-xs text-secondary mt-0.5 leading-relaxed">
                    Prorrogação e pênaltis{" "}
                    <strong className="text-primary">não contam</strong> pra pontuação —
                    o placar palpitado é o do tempo normal.
                  </div>
                </div>
              </div>
            </div>
          )}

          {ehGrupo && jogosDoGrupo.length > 0 && (
            <div className="mb-6 stagger-item">
              {temPalpitesNoGrupo && (
                <div className="flex gap-2 mb-3 p-1 bg-[var(--bg-card)] border border-default rounded-xl w-fit mx-auto">
                  <button
                    onClick={() => setModoTabela("real")}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-display tracking-[1.5px] transition ${
                      modoTabela === "real"
                        ? "bg-[var(--gold)] text-black font-bold"
                        : "text-secondary"
                    }`}
                  >
                    <Calendar size={12} /> REAL
                  </button>
                  <button
                    onClick={() => setModoTabela("simulado")}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-display tracking-[1.5px] transition ${
                      modoTabela === "simulado"
                        ? "bg-purple-400 text-black font-bold"
                        : "text-secondary"
                    }`}
                  >
                    <Sparkles size={12} /> SE EU ACERTAR
                  </button>
                </div>
              )}

              {!temJogosFinalizados && !temPalpitesNoGrupo ? (
                <div className="scorecard rounded-2xl px-4 py-8 text-center">
                  <p className="text-sm text-muted">
                    Sem jogos finalizados ainda. Palpite nos jogos abaixo pra ver a classificação
                    simulada.
                  </p>
                </div>
              ) : modoTabela === "simulado" && temPalpitesNoGrupo ? (
                <TabelaClassificacao
                  classificacao={classificacaoSimulada}
                  simulado
                  titulo={`${grupoAtivo} — SE SEUS PALPITES ACERTAREM`}
                />
              ) : (
                <TabelaClassificacao
                  classificacao={classificacaoReal}
                  titulo={`${grupoAtivo} — CLASSIFICAÇÃO REAL`}
                />
              )}
            </div>
          )}

          {grupoAtivo === "Mata-mata" && fasesMataMata.length === 0 && (
            <div className="scorecard rounded-2xl px-6 py-12 text-center stagger-item">
              <Trophy size={48} className="mx-auto text-[var(--gold)]/40 mb-3" />
              <p className="font-display tracking-[2px] text-sm text-muted">AGUARDANDO</p>
              <p className="text-secondary mt-2 max-w-md mx-auto">
                Os jogos do mata-mata vão aparecer aqui automaticamente assim que os times se
                classificarem na fase de grupos.
              </p>
              <p className="text-xs text-muted mt-4">
                A Football-Data.org libera os fixtures conforme os grupos terminam.
              </p>
            </div>
          )}

          {jogosDoGrupo.length > 0 && (
            <>
              <div className="font-display text-sm tracking-[2px] text-muted mb-3 mt-2">
                {jogosDoGrupo.length} {jogosDoGrupo.length === 1 ? "JOGO" : "JOGOS"}
              </div>
              {jogosDoGrupo.map((jogo) => (
                <CardJogo
                  key={jogo.id}
                  jogo={jogo as any}
                  minhaAposta={(minhasApostas[jogo.id] as any) || null}
                  todasApostas={(apostasPorJogo[jogo.id] || []) as any}
                  userId={userId}
                />
              ))}
            </>
          )}

          {ehGrupo && jogosDoGrupo.length === 0 && (
            <div className="text-center py-12 text-muted stagger-item">
              <p className="text-3xl mb-2 text-muted">⚽</p>
              <p className="text-sm">Nenhum jogo nesse grupo ainda.</p>
              <p className="text-xs text-faint mt-1">
                A Football-Data.org sincroniza automaticamente quando os jogos forem cadastrados.
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODO POR DATA */}
      {modo === "data" && (
        <div className="mt-4">
          {/* Banner do jogo de agora / próximo */}
          {foco && !foco.finalizado && (
            <BannerFoco jogo={foco} onVer={rolarParaFoco} />
          )}

          {/* Lista cronológica */}
          {jogosPorData.length === 0 ? (
            <div className="text-center py-16 text-muted">
              <p className="text-2xl mb-2 text-faint">🏟️</p>
              <p className="text-sm">Nenhum jogo nesse filtro.</p>
            </div>
          ) : (
            jogosPorData.map((jogo) => {
              const ehFoco = !!foco && jogo.id === foco.id;
              return (
                <div
                  key={jogo.id}
                  ref={ehFoco ? focoRef : undefined}
                  style={ehFoco ? { scrollMarginTop: topo + 120 } : undefined}
                  className={
                    ehFoco ? "rounded-2xl ring-2 ring-[var(--gold)]/60" : undefined
                  }
                >
                  <CardJogo
                    jogo={jogo as any}
                    minhaAposta={(minhasApostas[jogo.id] as any) || null}
                    todasApostas={(apostasPorJogo[jogo.id] || []) as any}
                    userId={userId}
                  />
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
