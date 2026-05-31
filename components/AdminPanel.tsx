"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { useToast } from "./ToastProvider";
import { RefreshCw, Edit2, Check, X, Zap, ShieldCheck } from "lucide-react";

type Jogo = {
  id: number;
  external_id: string | null;
  fase: string;
  time_a: string;
  time_b: string;
  data_jogo: string;
  estadio: string | null;
  gols_a: number | null;
  gols_b: number | null;
  finalizado: boolean;
  resultado_manual?: boolean;
};

export default function AdminPanel({
  jogos,
  edgeFunctionUrl,
}: {
  jogos: Jogo[];
  edgeFunctionUrl: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [carregando, setCarregando] = useState(false);
  const [msg, setMsg] = useState("");
  const [editando, setEditando] = useState<number | null>(null);
  const [golsA, setGolsA] = useState("");
  const [golsB, setGolsB] = useState("");

  async function forcarAtualizacao() {
    setCarregando(true);
    setMsg("Chamando Football-Data.org via Edge Function...");

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch(edgeFunctionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (data.ok) {
        const preservados = data.preservados_manuais
          ? ` · ${data.preservados_manuais} manuais preservados`
          : "";
        setMsg(
          `✅ ${data.inseridos || 0} novos · ${data.atualizados || 0} atualizados${preservados}`
        );
        router.refresh();
      } else {
        setMsg(`❌ ${data.error || "Erro desconhecido"}`);
      }
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    }
    setCarregando(false);
  }

  async function salvarResultado(jogoId: number) {
    if (golsA === "" || golsB === "") return;

    const supabase = createClient();
    const { error } = await supabase
      .from("jogos")
      .update({
        gols_a: parseInt(golsA),
        gols_b: parseInt(golsB),
        finalizado: true,
        resultado_manual: true,
      })
      .eq("id", jogoId);

    if (!error) {
      setEditando(null);
      setGolsA("");
      setGolsB("");
      toast("success", "Resultado salvo", "Pontos foram recalculados");
      router.refresh();
    } else {
      toast("error", "Erro ao salvar", error.message);
    }
  }

  async function limparResultado(jogoId: number) {
    const supabase = createClient();
    await supabase
      .from("jogos")
      .update({
        gols_a: null,
        gols_b: null,
        finalizado: false,
        resultado_manual: false,
      })
      .eq("id", jogoId);
    toast("success", "Resultado limpo");
    router.refresh();
  }

  async function liberarParaAutomatico(jogoId: number) {
    const supabase = createClient();
    await supabase
      .from("jogos")
      .update({ resultado_manual: false })
      .eq("id", jogoId);
    toast("success", "Liberado", "A próxima sincronização vai puxar da API");
    router.refresh();
  }

  return (
    <div>
      <div className="font-display text-3xl tracking-[4px] text-red-400 mb-5">
        ⚙ PAINEL ADMIN
      </div>

      <div className="bg-green-400/5 border border-green-400/30 rounded p-4 mb-5">
        <div className="flex items-center gap-2 font-display text-sm tracking-[2px] text-green-400 mb-2">
          <Zap size={16} /> SINCRONIZAÇÃO AUTOMÁTICA ATIVA
        </div>
        <p className="text-sm text-secondary leading-relaxed">
          Jogos puxados da Football-Data.org a cada minuto.
          Quando você editar um resultado manualmente, ele fica <strong>protegido</strong> —
          o cron não sobrescreve.
        </p>
      </div>

      <div className="bg-white/[0.03] border border-default rounded p-4 mb-5">
        <div className="font-display text-sm tracking-[2px] text-muted mb-3">
          AÇÕES MANUAIS
        </div>
        <button
          onClick={forcarAtualizacao}
          disabled={carregando}
          className="flex items-center gap-2 bg-[var(--gold)] text-black font-display tracking-[2px] text-sm px-4 py-3 rounded disabled:opacity-50"
        >
          <RefreshCw size={14} className={carregando ? "animate-spin" : ""} />
          {carregando ? "ATUALIZANDO..." : "FORÇAR ATUALIZAÇÃO AGORA"}
        </button>
        {msg && (
          <div className="mt-3 text-sm bg-black/30 px-3 py-2 rounded border border-default" style={{ color: "var(--text-primary)" }}>
            {msg}
          </div>
        )}
      </div>

      <div className="font-display text-sm tracking-[2px] text-muted mb-3">
        AJUSTE MANUAL DE RESULTADOS ({jogos.length} JOGOS)
      </div>
      <div className="text-xs text-muted mb-3">
        Quando você salvar manualmente, o ícone 🛡️ aparece — significa que o cron não vai sobrescrever.
      </div>

      {jogos.length === 0 && (
        <div className="text-center py-12 text-muted">
          Nenhum jogo cadastrado ainda.
        </div>
      )}

      {jogos.map((j) => {
        const data = new Date(j.data_jogo);
        return (
          <div
            key={j.id}
            className="bg-white/[0.03] border border-default rounded p-3 mb-2 flex items-center gap-3 text-sm flex-wrap"
          >
            <div className="flex-1 min-w-[200px]">
              <div className="font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                {j.time_a} × {j.time_b}
                {j.resultado_manual && (
                  <span title="Resultado manual — protegido contra sobrescrita">
                    <ShieldCheck size={14} className="text-[var(--gold)]" />
                  </span>
                )}
              </div>
              <div className="text-xs text-muted font-mono">
                {data.toLocaleDateString("pt-BR")}{" "}
                {data.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                · {j.fase}
              </div>
            </div>

            {editando === j.id ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={golsA}
                  onChange={(e) => setGolsA(e.target.value)}
                  className="w-14 py-1.5 bg-black/30 border border-[var(--gold)]/40 rounded text-[var(--gold)] font-display text-lg text-center outline-none"
                />
                <span>×</span>
                <input
                  type="number"
                  min="0"
                  value={golsB}
                  onChange={(e) => setGolsB(e.target.value)}
                  className="w-14 py-1.5 bg-black/30 border border-[var(--gold)]/40 rounded text-[var(--gold)] font-display text-lg text-center outline-none"
                />
                <button
                  onClick={() => salvarResultado(j.id)}
                  className="bg-green-400 text-black p-1.5 rounded"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => setEditando(null)}
                  className="bg-white/10 p-1.5 rounded"
                  style={{ color: "var(--text-primary)" }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                {j.finalizado ? (
                  <div className="font-display text-2xl text-[var(--gold)]">
                    {j.gols_a} × {j.gols_b}
                  </div>
                ) : (
                  <div className="text-muted text-sm">sem resultado</div>
                )}
                <button
                  onClick={() => {
                    setEditando(j.id);
                    setGolsA(j.gols_a?.toString() ?? "");
                    setGolsB(j.gols_b?.toString() ?? "");
                  }}
                  className="border border-[var(--gold)]/30 text-[var(--gold)] p-1.5 rounded"
                  title="Editar manualmente"
                >
                  <Edit2 size={12} />
                </button>
                {j.finalizado && (
                  <button
                    onClick={() => limparResultado(j.id)}
                    className="border border-red-400/30 text-red-400 p-1.5 rounded text-xs"
                  >
                    LIMPAR
                  </button>
                )}
                {j.resultado_manual && (
                  <button
                    onClick={() => liberarParaAutomatico(j.id)}
                    className="border border-default text-muted hover:text-secondary text-[10px] px-2 py-1 rounded"
                    title="Permitir que o cron sobrescreva este resultado"
                  >
                    LIBERAR
                  </button>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
