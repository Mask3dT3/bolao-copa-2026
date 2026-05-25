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
import { Sparkles, Calendar } from "lucide-react";

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
  const grupos = useMemo(() => listarGrupos(jogos), [jogos]);
  const [grupoAtivo, setGrupoAtivo] = useState<string>("");
  const [modoTabela, setModoTabela] = useState<"real" | "simulado">("real");

  // Define grupo inicial: primeiro grupo disponível (geralmente "Grupo A")
  useEffect(() => {
    if (!grupoAtivo && grupos.length > 0) {
      setGrupoAtivo(grupos[0]);
    }
  }, [grupos, grupoAtivo]);

  const jogosDoGrupo = useMemo(() => {
    if (!grupoAtivo) return [];
    const agrupados = agruparJogos(jogos);
    return agrupados[grupoAtivo] || [];
  }, [jogos, grupoAtivo]);

  const ehGrupo = grupoAtivo !== "Mata-mata" && grupoAtivo !== "";

  // Calcula classificações (só pra grupos reais)
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

  const temPalpitesNoGrupo = meusPalpites.length > 0;
  const temJogosFinalizados = jogosDoGrupo.some((j) => j.finalizado);

  return (
    <div>
      {/* Seletor de grupos */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1">
        {grupos.map((g) => {
          const ativo = g === grupoAtivo;
          const isMataMata = g === "Mata-mata";
          const label = isMataMata ? "Mata-mata" : g.replace("Grupo ", "");
          return (
            <button
              key={g}
              onClick={() => setGrupoAtivo(g)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-display tracking-[1.5px] whitespace-nowrap border transition ${
                ativo
                  ? "bg-[var(--gold)] text-black border-[var(--gold)] font-bold"
                  : "bg-[var(--bg-card)] text-secondary border-default hover:border-strong"
              }`}
            >
              {isMataMata ? (
                <>🏆 {label.toUpperCase()}</>
              ) : (
                <>
                  <span className={`font-mono text-xs ${ativo ? "text-black/60" : "text-muted"}`}>
                    GRUPO
                  </span>
                  {label}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Tabela de classificação (apenas pra grupos) */}
      {ehGrupo && jogosDoGrupo.length > 0 && (
        <div className="mb-6 stagger-item">
          {/* Toggle Real / Simulado */}
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

          {/* A tabela em si */}
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

      {/* Jogos do grupo */}
      {jogosDoGrupo.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <p className="text-3xl mb-2 opacity-50">⚽</p>
          <p className="text-sm">
            Nenhum jogo {grupoAtivo === "Mata-mata" ? "do mata-mata" : `no ${grupoAtivo}`} ainda.
          </p>
        </div>
      ) : (
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
    </div>
  );
}
