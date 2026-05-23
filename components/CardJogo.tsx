"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Lock, Check, Edit2 } from "lucide-react";

type Aposta = {
  id?: number;
  gols_a: number;
  gols_b: number;
  pontos?: number;
};

type ApostaComUser = Aposta & {
  user_id: string;
  profiles?: { nome: string };
};

type Props = {
  jogo: {
    id: number;
    fase: string;
    time_a: string;
    time_b: string;
    data_jogo: string;
    estadio: string | null;
    gols_a: number | null;
    gols_b: number | null;
    finalizado: boolean;
  };
  minhaAposta: Aposta | null;
  todasApostas: ApostaComUser[];
  userId: string;
};

export default function CardJogo({ jogo, minhaAposta, todasApostas, userId }: Props) {
  const [editando, setEditando] = useState(!minhaAposta);
  const [golsA, setGolsA] = useState<string>(minhaAposta?.gols_a?.toString() ?? "");
  const [golsB, setGolsB] = useState<string>(minhaAposta?.gols_b?.toString() ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [aposta, setAposta] = useState(minhaAposta);

  const dataJogo = new Date(jogo.data_jogo);
  const agora = new Date();
  const jaComecou = agora >= dataJogo;
  const fechado = jaComecou || jogo.finalizado;

  async function salvar() {
    if (golsA === "" || golsB === "") return;
    setSalvando(true);
    setErro("");

    const supabase = createClient();
    const dados = {
      user_id: userId,
      jogo_id: jogo.id,
      gols_a: parseInt(golsA),
      gols_b: parseInt(golsB),
    };

    const { data, error } = await supabase
      .from("apostas")
      .upsert(dados, { onConflict: "user_id,jogo_id" })
      .select()
      .single();

    if (error) {
      setErro("Erro ao salvar. O jogo já começou?");
    } else {
      setAposta(data);
      setEditando(false);
    }
    setSalvando(false);
  }

  function pontosDe(a: Aposta) {
    if (!jogo.finalizado || jogo.gols_a === null || jogo.gols_b === null) return null;
    if (a.gols_a === jogo.gols_a && a.gols_b === jogo.gols_b) return 5;
    const r1 = a.gols_a > a.gols_b ? "A" : a.gols_a < a.gols_b ? "B" : "E";
    const r2 = jogo.gols_a > jogo.gols_b ? "A" : jogo.gols_a < jogo.gols_b ? "B" : "E";
    return r1 === r2 ? 3 : 0;
  }

  const meusPontos = aposta ? pontosDe(aposta) : null;

  const finalizadoStyle = jogo.finalizado
    ? "bg-yellow-400/[0.04] border-yellow-400/20"
    : "bg-white/[0.03] border-white/10";

  return (
    <div className={`border rounded p-4 mb-3 ${finalizadoStyle}`}>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="font-display text-[11px] tracking-[2px] bg-yellow-400/15 text-yellow-400 px-2 py-0.5 rounded">
          {jogo.fase}
        </span>
        <span className="text-xs text-white/70 font-mono">
          {dataJogo.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} ·{" "}
          {dataJogo.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </span>
        {jogo.finalizado && (
          <span className="ml-auto flex items-center gap-1 font-display text-[10px] tracking-[1px] bg-green-400/15 text-green-400 px-2 py-0.5 rounded">
            <Check size={10} /> FINALIZADO
          </span>
        )}
        {fechado && !jogo.finalizado && (
          <span className="ml-auto flex items-center gap-1 font-display text-[10px] tracking-[1px] bg-red-400/15 text-red-400 px-2 py-0.5 rounded">
            <Lock size={10} /> FECHADO
          </span>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-3">
        <div className="font-display text-lg md:text-xl tracking-wide text-center">{jogo.time_a}</div>
        {jogo.finalizado && jogo.gols_a !== null ? (
          <div className="flex items-center gap-3">
            <span className="font-display text-4xl text-yellow-400 leading-none">{jogo.gols_a}</span>
            <span className="text-xl opacity-40">×</span>
            <span className="font-display text-4xl text-yellow-400 leading-none">{jogo.gols_b}</span>
          </div>
        ) : (
          <div className="text-xl opacity-30">×</div>
        )}
        <div className="font-display text-lg md:text-xl tracking-wide text-center">{jogo.time_b}</div>
      </div>

      {!fechado && editando && (
        <div className="bg-black/30 p-3 rounded mt-3 border border-dashed border-yellow-400/30">
          <div className="font-display text-[11px] tracking-[2px] opacity-60 mb-2.5">SUA APOSTA</div>
          <div className="flex items-center gap-3 mb-3">
            <input
              type="number"
              min="0"
              value={golsA}
              onChange={(e) => setGolsA(e.target.value)}
              className="w-16 py-2.5 bg-deep border border-yellow-400/40 rounded text-yellow-400 font-display text-2xl text-center outline-none"
              placeholder="0"
            />
            <span className="text-lg opacity-50">×</span>
            <input
              type="number"
              min="0"
              value={golsB}
              onChange={(e) => setGolsB(e.target.value)}
              className="w-16 py-2.5 bg-deep border border-yellow-400/40 rounded text-yellow-400 font-display text-2xl text-center outline-none"
              placeholder="0"
            />
          </div>
          {erro && <div className="text-red-400 text-xs mb-2">{erro}</div>}
          <button
            onClick={salvar}
            disabled={salvando}
            className="w-full py-3 bg-yellow-400 text-black font-display tracking-[3px] text-sm font-bold rounded disabled:opacity-50"
          >
            {salvando ? "SALVANDO..." : "CONFIRMAR APOSTA"}
          </button>
        </div>
      )}

      {!fechado && !editando && aposta && (
        <div className="flex items-center justify-between bg-yellow-400/[0.08] px-4 py-2.5 rounded mt-3 border border-yellow-400/20">
          <div className="font-display text-[11px] tracking-[2px] opacity-60">SUA APOSTA</div>
          <div className="font-display text-xl text-yellow-400">
            {aposta.gols_a} × {aposta.gols_b}
          </div>
          <button
            onClick={() => setEditando(true)}
            className="flex items-center gap-1 border border-yellow-400/30 text-yellow-400 px-2.5 py-1.5 text-[11px] font-display tracking-wide rounded"
          >
            <Edit2 size={11} /> EDITAR
          </button>
        </div>
      )}

      {jogo.finalizado && aposta && meusPontos !== null && (
        <div
          className={`p-3 rounded mt-3 text-center border ${
            meusPontos > 0
              ? "bg-green-400/10 border-green-400/30"
              : "bg-red-400/5 border-red-400/20"
          }`}
        >
          <div className="font-display text-[11px] tracking-[2px] opacity-60">
            SUA APOSTA: {aposta.gols_a} × {aposta.gols_b}
          </div>
          <div className="font-display text-base mt-1.5">
            {meusPontos === 5 && "🎯 PLACAR EXATO · +5 PTS"}
            {meusPontos === 3 && "✓ ACERTOU O RESULTADO · +3 PTS"}
            {meusPontos === 0 && "✗ NÃO PONTUOU"}
          </div>
        </div>
      )}

      {jogo.finalizado && !aposta && (
        <div className="text-center py-2.5 opacity-50 text-xs font-display tracking-[2px] mt-3">
          VOCÊ NÃO APOSTOU
        </div>
      )}

      {fechado && !jogo.finalizado && !aposta && (
        <div className="text-center py-2.5 opacity-50 text-xs font-display tracking-[2px] mt-3">
          VOCÊ NÃO APOSTOU · AGUARDANDO RESULTADO
        </div>
      )}

      {todasApostas.length > 0 && (
        <details className="mt-3 border-t border-white/8 pt-3">
          <summary className="cursor-pointer text-xs opacity-70 font-display tracking-[2px]">
            {todasApostas.length} {todasApostas.length === 1 ? "APOSTA" : "APOSTAS"}
          </summary>
          <div className="mt-2.5 flex flex-col gap-1">
            {todasApostas.map((a) => {
              const pts = jogo.finalizado ? pontosDe(a) : null;
              return (
                <div
                  key={a.user_id}
                  className="grid grid-cols-[1fr_auto_auto] gap-3 text-sm py-1.5 items-center"
                >
                  <span>{a.profiles?.nome || "Anônimo"}</span>
                  <span className="font-mono text-yellow-400">
                    {a.gols_a} × {a.gols_b}
                  </span>
                  {pts !== null && (
                    <span
                      className={`font-display min-w-[30px] text-right ${
                        pts > 0 ? "text-green-400" : "text-white/40"
                      }`}
                    >
                      +{pts}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}
