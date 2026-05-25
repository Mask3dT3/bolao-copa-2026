"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Lock, Check, Edit2, Share2, Clock, EyeOff } from "lucide-react";
import { getBandeiraCircularUrl } from "@/lib/bandeiras";
import { useToast } from "./ToastProvider";

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
  todasApostas: Aposta[];
  userId: string;
};

function Bandeira({ time, size = 48 }: { time: string; size?: number }) {
  const url = getBandeiraCircularUrl(time);
  if (!url) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-full bg-[var(--border-default)] flex items-center justify-center text-xs font-bold text-muted"
      >
        {time.substring(0, 2).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={time}
      style={{ width: size, height: size }}
      className="rounded-full object-cover ring-2 ring-[var(--gold)]/20 flag-hover"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

function formatarTempoRestante(data: Date): string | null {
  const agora = new Date();
  const diff = data.getTime() - agora.getTime();
  if (diff < 0) return null;
  const min = Math.floor(diff / 60000);
  const horas = Math.floor(min / 60);
  const dias = Math.floor(horas / 24);
  if (dias > 1) return `${dias} dias`;
  if (dias === 1) return "Amanhã";
  if (horas > 1) return `${horas}h`;
  if (horas === 1) return "1h";
  return `${min} min`;
}

export default function CardJogo({ jogo, minhaAposta, todasApostas, userId }: Props) {
  const { toast } = useToast();
  const [editando, setEditando] = useState(!minhaAposta);
  const [golsA, setGolsA] = useState<string>(minhaAposta?.gols_a?.toString() ?? "");
  const [golsB, setGolsB] = useState<string>(minhaAposta?.gols_b?.toString() ?? "");
  const [salvando, setSalvando] = useState(false);
  const [aposta, setAposta] = useState(minhaAposta);

  const dataJogo = new Date(jogo.data_jogo);
  const agora = new Date();
  const jaComecou = agora >= dataJogo;
  const fechado = jaComecou || jogo.finalizado;
  const tempoRestante = formatarTempoRestante(dataJogo);
  const proximo = tempoRestante && (dataJogo.getTime() - agora.getTime()) < 3600000;

  async function salvar() {
    if (golsA === "" || golsB === "") return;
    setSalvando(true);

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
      toast("error", "Não consegui salvar", "O jogo pode ter começado.");
    } else {
      setAposta(data);
      setEditando(false);
      toast(
        "success",
        minhaAposta ? "Palpite atualizado!" : "Palpite confirmado!",
        `${jogo.time_a} ${dados.gols_a} × ${dados.gols_b} ${jogo.time_b}`
      );
    }
    setSalvando(false);
  }

  function compartilharWhatsapp() {
    if (!aposta || aposta.gols_a === null || aposta.gols_b === null) return;
    const texto = `🏆 *Bolão Copa 2026*\n\nMeu palpite:\n${jogo.time_a} *${aposta.gols_a} × ${aposta.gols_b}* ${jogo.time_b}\n\n${jogo.fase}\n${dataJogo.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })} às ${dataJogo.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}\n\nE você, qual o seu?`;
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  }

  function pontosDe(a: Aposta) {
    if (!jogo.finalizado || jogo.gols_a === null || jogo.gols_b === null) return null;
    if (a.gols_a === null || a.gols_b === null) return null;
    if (a.gols_a === jogo.gols_a && a.gols_b === jogo.gols_b) return 5;
    const r1 = a.gols_a > a.gols_b ? "A" : a.gols_a < a.gols_b ? "B" : "E";
    const r2 = jogo.gols_a > jogo.gols_b ? "A" : jogo.gols_a < jogo.gols_b ? "B" : "E";
    return r1 === r2 ? 3 : 0;
  }

  const meusPontos = aposta ? pontosDe(aposta) : null;

  return (
    <div
      className={`stagger-item rounded-2xl p-5 mb-3 ${
        jogo.finalizado ? "scorecard scorecard-finalizado" : "scorecard"
      }`}
    >
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="font-display text-[11px] tracking-[2px] bg-[var(--gold)]/15 text-[var(--gold)] px-2.5 py-1 rounded-full">
          {jogo.fase}
        </span>
        <span className="text-xs text-muted font-mono flex items-center gap-1">
          <Clock size={11} />
          {dataJogo.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} ·{" "}
          {dataJogo.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </span>
        {proximo && !fechado && (
          <span className="ml-auto flex items-center gap-1 font-display text-[10px] tracking-[1px] bg-orange-400/15 text-orange-400 px-2 py-0.5 rounded-full pulse-glow">
            ⏰ EM {tempoRestante}
          </span>
        )}
        {jogo.finalizado && (
          <span className="ml-auto flex items-center gap-1 font-display text-[10px] tracking-[1px] bg-green-400/15 text-green-400 px-2 py-0.5 rounded-full">
            <Check size={10} /> ENCERRADO
          </span>
        )}
        {fechado && !jogo.finalizado && (
          <span className="ml-auto flex items-center gap-1 font-display text-[10px] tracking-[1px] bg-red-400/15 text-red-400 px-2 py-0.5 rounded-full">
            <Lock size={10} /> FECHADO
          </span>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2">
        <div className="flex flex-col items-center gap-2">
          <Bandeira time={jogo.time_a} size={52} />
          <div
            className="font-semibold text-sm sm:text-base text-center leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {jogo.time_a}
          </div>
        </div>

        <div className="px-2">
          {jogo.finalizado && jogo.gols_a !== null ? (
            <div className="flex items-center gap-2">
              <span className="font-score font-bold text-5xl text-[var(--gold)] leading-none drop-shadow-[0_0_12px_rgba(255,215,0,0.3)]">
                {jogo.gols_a}
              </span>
              <span className="text-2xl text-faint font-thin">×</span>
              <span className="font-score font-bold text-5xl text-[var(--gold)] leading-none drop-shadow-[0_0_12px_rgba(255,215,0,0.3)]">
                {jogo.gols_b}
              </span>
            </div>
          ) : (
            <div className="text-2xl text-faint font-thin">×</div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <Bandeira time={jogo.time_b} size={52} />
          <div
            className="font-semibold text-sm sm:text-base text-center leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {jogo.time_b}
          </div>
        </div>
      </div>

      {!fechado && editando && (
        <div className="bg-[var(--bg-input)] p-4 rounded-xl mt-4 border border-dashed border-[var(--gold)]/40">
          <div className="font-display text-xs tracking-[3px] text-[var(--gold)] mb-3 text-center">
            SEU PALPITE
          </div>
          <div className="flex items-center justify-center gap-3 mb-3">
            <input
              type="number"
              min="0"
              max="20"
              value={golsA}
              onChange={(e) => setGolsA(e.target.value)}
              className="w-16 h-16 border-2 border-[var(--gold)]/40 rounded-xl text-[var(--gold)] font-score font-bold text-3xl text-center outline-none focus:border-[var(--gold)] transition"
              placeholder="0"
            />
            <span className="text-2xl text-faint">×</span>
            <input
              type="number"
              min="0"
              max="20"
              value={golsB}
              onChange={(e) => setGolsB(e.target.value)}
              className="w-16 h-16 border-2 border-[var(--gold)]/40 rounded-xl text-[var(--gold)] font-score font-bold text-3xl text-center outline-none focus:border-[var(--gold)] transition"
              placeholder="0"
            />
          </div>
          <button
            onClick={salvar}
            disabled={salvando || golsA === "" || golsB === ""}
            className="w-full py-3 bg-[var(--gold)] hover:opacity-90 text-black font-display tracking-[3px] text-sm font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed glow-gold"
          >
            {salvando ? "SALVANDO..." : minhaAposta ? "ATUALIZAR PALPITE" : "CONFIRMAR PALPITE"}
          </button>
        </div>
      )}

      {!fechado && !editando && aposta && aposta.gols_a !== null && (
        <div className="flex items-center justify-between bg-[var(--gold)]/[0.08] px-4 py-3 rounded-xl mt-4 border border-[var(--gold)]/20">
          <div>
            <div className="font-display text-[10px] tracking-[2px] text-muted">SEU PALPITE</div>
            <div className="font-score font-bold text-2xl text-[var(--gold)] mt-0.5">
              {aposta.gols_a} × {aposta.gols_b}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={compartilharWhatsapp}
              className="flex items-center gap-1.5 border border-default hover:border-strong text-secondary px-3 py-2 text-xs font-medium rounded-lg"
              title="Compartilhar no WhatsApp"
            >
              <Share2 size={13} />
            </button>
            <button
              onClick={() => setEditando(true)}
              className="flex items-center gap-1.5 border border-[var(--gold)]/40 hover:border-[var(--gold)] text-[var(--gold)] px-3 py-2 text-xs font-display tracking-wider rounded-lg"
            >
              <Edit2 size={12} /> EDITAR
            </button>
          </div>
        </div>
      )}

      {jogo.finalizado && aposta && meusPontos !== null && (
        <div
          className={`p-3 rounded-xl mt-4 text-center border ${
            meusPontos > 0
              ? "bg-green-400/10 border-green-400/30"
              : "bg-red-400/5 border-red-400/20"
          }`}
        >
          <div className="font-display text-[10px] tracking-[2px] text-muted">
            SEU PALPITE: {aposta.gols_a} × {aposta.gols_b}
          </div>
          <div className="font-display text-base mt-1.5 tracking-wide">
            {meusPontos === 5 && <span className="text-[var(--gold)]">🎯 PLACAR EXATO · +5 PTS</span>}
            {meusPontos === 3 && <span className="text-green-400">✓ ACERTOU O RESULTADO · +3 PTS</span>}
            {meusPontos === 0 && <span className="text-red-400">✗ NÃO PONTUOU</span>}
          </div>
        </div>
      )}

      {jogo.finalizado && !aposta && (
        <div className="text-center py-3 text-muted text-xs font-display tracking-[2px] mt-3">
          VOCÊ NÃO APOSTOU
        </div>
      )}

      {fechado && !jogo.finalizado && !aposta && (
        <div className="text-center py-3 text-muted text-xs font-display tracking-[2px] mt-3">
          VOCÊ NÃO APOSTOU · AGUARDANDO RESULTADO
        </div>
      )}

      {/* Lista de palpites — nomes sempre, placares só após kickoff */}
      {todasApostas.length > 0 && (
        <details className="mt-4 border-t border-default pt-3 group">
          <summary className="cursor-pointer text-xs text-secondary font-display tracking-[2px] flex items-center justify-between list-none">
            <span className="flex items-center gap-2">
              {todasApostas.length} {todasApostas.length === 1 ? "PALPITE" : "PALPITES"}
              {!fechado && (
                <span className="flex items-center gap-1 text-[10px] bg-purple-400/15 text-purple-300 px-1.5 py-0.5 rounded-full normal-case">
                  <EyeOff size={9} /> placares ocultos
                </span>
              )}
            </span>
            <span className="transition group-open:rotate-180">▾</span>
          </summary>
          <div className="mt-3 flex flex-col gap-1.5">
            {todasApostas.map((a) => {
              const pts = jogo.finalizado ? pontosDe(a) : null;
              const isMe = a.user_id === userId;
              const placarVisivel = isMe || fechado || a.revelado === true;
              const golsA = a.gols_a;
              const golsB = a.gols_b;

              return (
                <div
                  key={a.user_id}
                  className={`grid grid-cols-[1fr_auto_auto] gap-3 text-sm py-1.5 px-2 rounded items-center ${
                    isMe ? "bg-[var(--gold)]/5" : ""
                  }`}
                >
                  <span className="font-medium truncate">
                    {a.profiles?.nome || "Anônimo"}
                    {isMe && <span className="text-[var(--gold)]/70 text-xs ml-1">(você)</span>}
                  </span>

                  {placarVisivel && golsA !== null && golsB !== null ? (
                    <span className="font-mono font-bold text-[var(--gold)]/90">
                      {golsA} × {golsB}
                    </span>
                  ) : (
                    <span className="font-mono text-muted flex items-center gap-1">
                      <EyeOff size={10} />
                      <span className="tracking-widest">? × ?</span>
                    </span>
                  )}

                  {pts !== null && (
                    <span
                      className={`font-display min-w-[30px] text-right font-bold ${
                        pts > 0 ? "text-green-400" : "text-faint"
                      }`}
                    >
                      +{pts}
                    </span>
                  )}
                  {pts === null && !placarVisivel && <span className="min-w-[30px]" />}
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}
