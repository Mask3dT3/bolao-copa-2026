"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { RefreshCw, Edit2, Check, X, Zap } from "lucide-react";

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
};

export default function AdminPanel({
  jogos,
  edgeFunctionUrl,
}: {
  jogos: Jogo[];
  edgeFunctionUrl: string;
}) {
  const router = useRouter();
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
        setMsg(
          `✅ ${data.inseridos || 0} novos · ${data.atualizados || 0} atualizados · ${data.total_api || 0} jogos na API`
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
      })
      .eq("id", jogoId);

    if (!error) {
      setEditando(null);
      setGolsA("");
      setGolsB("");
      router.refresh();
    } else {
      setMsg(`❌ ${error.message}`);
    }
  }

  async function limparResultado(jogoId: number) {
    const supabase = createClient();
    await supabase
      .from("jogos")
      .update({ gols_a: null, gols_b: null, finalizado: false })
      .eq("id", jogoId);
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
        <p className="text-sm opacity-80 leading-relaxed">
          Os jogos são puxados automaticamente da{" "}
          <strong className="text-green-400">Football-Data.org</strong> a cada minuto via
          Edge Function. Você não precisa fazer nada — quando um jogo terminar,
          o resultado aparece e os pontos são calculados automaticamente.
        </p>
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded p-4 mb-5">
        <div className="font-display text-sm tracking-[2px] opacity-70 mb-3">
          AÇÕES MANUAIS
        </div>
        <button
          onClick={forcarAtualizacao}
          disabled={carregando}
          className="flex items-center gap-2 bg-yellow-400 text-black font-display tracking-[2px] text-sm px-4 py-3 rounded disabled:opacity-50"
        >
          <RefreshCw size={14} className={carregando ? "animate-spin" : ""} />
          {carregando ? "ATUALIZANDO..." : "FORÇAR ATUALIZAÇÃO AGORA"}
        </button>
        {msg && (
          <div className="mt-3 text-sm bg-black/30 px-3 py-2 rounded border border-white/10">
            {msg}
          </div>
        )}
      </div>

      <div className="font-display text-sm tracking-[2px] opacity-70 mb-3">
        AJUSTE MANUAL DE RESULTADOS ({jogos.length} JOGOS)
      </div>
      <div className="text-xs opacity-60 mb-3">
        Use apenas se a API estiver com problema. Normalmente não é necessário.
      </div>

      {jogos.length === 0 && (
        <div className="text-center py-12 opacity-60">
          Nenhum jogo cadastrado ainda. Clique em "Forçar Atualização" pra trazer os jogos da Copa.
        </div>
      )}

      {jogos.map((j) => {
        const data = new Date(j.data_jogo);
        return (
          <div
            key={j.id}
            className="bg-white/[0.03] border border-white/10 rounded p-3 mb-2 flex items-center gap-3 text-sm flex-wrap"
          >
            <div className="flex-1 min-w-[200px]">
              <div className="font-semibold">
                {j.time_a} × {j.time_b}
              </div>
              <div className="text-xs opacity-60 font-mono">
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
                  className="w-14 py-1.5 bg-deep border border-yellow-400/40 rounded text-yellow-400 font-display text-lg text-center outline-none"
                />
                <span>×</span>
                <input
                  type="number"
                  min="0"
                  value={golsB}
                  onChange={(e) => setGolsB(e.target.value)}
                  className="w-14 py-1.5 bg-deep border border-yellow-400/40 rounded text-yellow-400 font-display text-lg text-center outline-none"
                />
                <button
                  onClick={() => salvarResultado(j.id)}
                  className="bg-green-400 text-black p-1.5 rounded"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => setEditando(null)}
                  className="bg-white/10 text-white p-1.5 rounded"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                {j.finalizado ? (
                  <div className="font-display text-2xl text-yellow-400">
                    {j.gols_a} × {j.gols_b}
                  </div>
                ) : (
                  <div className="opacity-40 text-sm">sem resultado</div>
                )}
                <button
                  onClick={() => {
                    setEditando(j.id);
                    setGolsA(j.gols_a?.toString() ?? "");
                    setGolsB(j.gols_b?.toString() ?? "");
                  }}
                  className="border border-yellow-400/30 text-yellow-400 p-1.5 rounded"
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
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
