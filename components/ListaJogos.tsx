"use client";

import { useState, useMemo, useEffect } from "react";
import CardJogo from "./CardJogo";
import TabelaClassificacao from "./TabelaClassificacao";
import {
  agruparJogos,
  calcularClassificacao,
  listarGrupos,
  JogoGrupo,
  PalpiteUsuario,
} from "@/lib/classificacao";
import { Sparkles, Calendar, Grid3x3, Trophy } from "lucide-react";

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
// Garante que mata-mata sempre apareça mesmo sem jogos cadastrados ainda
const GRUPOS_FIXOS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

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
  const [modo, setModo] = useState<Modo>("grupo");
  const [grupoAtivo, setGrupoAtivo] = useState<string>("Grupo A");
  const [filtroData, setFiltroData] = useState<"todos" | "pendentes" | "proximos" | "encerrados">("todos");

  const agora = new Date();

  // Define grupo inicial baseado no que existe
  const gruposDisponiveis = useMemo(() => listarGrupos(jogos), [jogos]);

  // Lista completa: sempre mostra todos os grupos da Copa + Mata-mata
  const todosGrupos = useMemo(() => {
    const lista: string[] = GRUPOS_FIXOS.map((l) => `Grupo ${l}`);
    lista.push("Mata-mata");
    return lista;
  }, []);

  const jogosDoGrupo = useMemo(() => {
    if (modo !== "grupo" || !grupoAtivo) return [];
    const agrupados = agruparJogos(jogos);
    return agrupados[grupoAtivo] || [];
  }, [jogos, grupoAtivo, modo]);

  const jogosPorData = useMemo(() => {
    if (modo !== "data") return [];
    return jogos.filter((j) => {
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
  }, [jogos, filtroData, minhasApostas, modo]);

  const ehGrupo = grupoAtivo !== "Mata-mata" && grupoAtivo !== "";

  // Tabela de classificação (só pra grupos)
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

  // Contadores para o modo "data"
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
  }, [jogos, minhasApostas, modo]);

  return (
    <div>
      {/* Toggle Por data / Por grupo */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex p-1 bg-[var(--bg-card)] border border-default rounded-xl">
          <button
            onClick={() => setModo("grupo")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-display tracking-[1.5px] transition ${
              modo === "grupo"
                ? "bg-[var(--gold)] text-black font-bold"
                : "text-secondary hover:text-primary"
            }`}
          >
            <Grid3x3 size={13} /> POR GRUPO
          </button>
          <button
            onClick={() => setModo("data")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-display tracking-[1.5px] transition ${
              modo === "data"
                ? "bg-[var(--gold)] text-black font-bold"
                : "text-secondary hover:text-primary"
            }`}
          >
            <Calendar size={13} /> POR DATA
          </button>
        </div>
      </div>

      {/* MODO POR GRUPO: grid de seleção + tabela + jogos */}
      {modo === "grupo" && (
        <>
          {/* Grid de grupos (4 colunas em mobile, 7 em desktop) */}
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
            {/* Mata-mata - ocupa 4 colunas em mobile, 1 em desktop */}
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

          {/* Tabela de classificação (só pra grupos) */}
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
                    Sem jogos finalizados ainda. Palpite nos jogos abaixo pra ver a classificação simulada.
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

          {/* Mata-mata: aviso especial se não tem jogos */}
          {grupoAtivo === "Mata-mata" && jogosDoGrupo.length === 0 && (
            <div className="scorecard rounded-2xl px-6 py-12 text-center stagger-item">
              <Trophy size={48} className="mx-auto text-[var(--gold)]/40 mb-3" />
              <p className="font-display tracking-[2px] text-sm text-muted">AGUARDANDO</p>
              <p className="text-secondary mt-2 max-w-md mx-auto">
                Os jogos do mata-mata vão aparecer aqui automaticamente assim que
                os times se classificarem na fase de grupos.
              </p>
              <p className="text-xs text-muted mt-4">
                A Football-Data.org libera os fixtures conforme os grupos terminam.
              </p>
            </div>
          )}

          {/* Jogos do grupo */}
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

          {/* Grupos sem jogos ainda */}
          {ehGrupo && jogosDoGrupo.length === 0 && (
            <div className="text-center py-12 text-muted stagger-item">
              <p className="text-3xl mb-2 text-muted">⚽</p>
              <p className="text-sm">Nenhum jogo nesse grupo ainda.</p>
              <p className="text-xs text-faint mt-1">
                A Football-Data.org sincroniza automaticamente quando os jogos forem cadastrados.
              </p>
            </div>
          )}
        </>
      )}

      {/* MODO POR DATA */}
      {modo === "data" && (
        <>
          {/* Filtros */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-2 -mx-1 px-1">
            {[
              { key: "todos", label: "Todos", count: jogos.length },
              { key: "pendentes", label: "Sem palpite", count: contadores.pendentes },
              { key: "proximos", label: "Próximos", count: contadores.proximos },
              { key: "encerrados", label: "Encerrados", count: contadores.encerrados },
            ].map((f) => {
              const ativo = filtroData === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFiltroData(f.key as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-display tracking-[1.5px] whitespace-nowrap border transition ${
                    ativo
                      ? "bg-[var(--gold)] text-black border-[var(--gold)] font-bold"
                      : "bg-[var(--bg-card)] text-secondary border-default hover:border-strong"
                  }`}
                >
                  {f.label.toUpperCase()}
                  <span className={`text-[10px] font-mono ${ativo ? "text-black/60" : "text-muted"}`}>
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Lista */}
          {jogosPorData.length === 0 ? (
            <div className="text-center py-16 text-muted">
              <p className="text-2xl mb-2 text-faint">🏟️</p>
              <p className="text-sm">Nenhum jogo nesse filtro.</p>
            </div>
          ) : (
            jogosPorData.map((jogo) => (
              <CardJogo
                key={jogo.id}
                jogo={jogo as any}
                minhaAposta={(minhasApostas[jogo.id] as any) || null}
                todasApostas={(apostasPorJogo[jogo.id] || []) as any}
                userId={userId}
              />
            ))
          )}
        </>
      )}
    </div>
  );
}
