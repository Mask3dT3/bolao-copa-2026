import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export const dynamic = "force-dynamic";

type RankRow = {
  id: string;
  nome: string;
  total_pontos: number;
  placares_exatos: number;
  acertos_resultado: number;
};

type RankComPos = RankRow & { posicao: number };

// Ordena e calcula a posição (ranking DENSO):
// - empate em pontos => mesmo lugar (1º, 1º, 2º...)
// - ordem entre empatados: placares exatos > acertos de resultado > alfabético
function ordenarRanking(rows: RankRow[]): RankComPos[] {
  const ordenado = [...rows].sort((a, b) => {
    const pa = a.total_pontos ?? 0;
    const pb = b.total_pontos ?? 0;
    if (pb !== pa) return pb - pa;
    const ea = a.placares_exatos ?? 0;
    const eb = b.placares_exatos ?? 0;
    if (eb !== ea) return eb - ea;
    const ra = a.acertos_resultado ?? 0;
    const rb = b.acertos_resultado ?? 0;
    if (rb !== ra) return rb - ra;
    return (a.nome || "").localeCompare(b.nome || "", "pt-BR");
  });

  let posicao = 0;
  let distintos = 0;
  let ultimoPontos: number | null = null;
  return ordenado.map((u) => {
    const pts = u.total_pontos ?? 0;
    if (ultimoPontos === null || pts !== ultimoPontos) {
      distintos += 1;
      posicao = distintos;
      ultimoPontos = pts;
    }
    return { ...u, posicao };
  });
}

const MEDALHAS: Record
  number,
  { emoji: string; nome: string; borda: string; texto: string }
> = {
  1: { emoji: "🥇", nome: "1º LUGAR", borda: "border-yellow-400/40", texto: "text-yellow-400" },
  2: { emoji: "🥈", nome: "2º LUGAR", borda: "border-gray-400/40", texto: "text-gray-300" },
  3: { emoji: "🥉", nome: "3º LUGAR", borda: "border-orange-500/40", texto: "text-orange-400" },
};

export default async function PaginaRanking() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, is_admin")
    .eq("id", user.id)
    .single();

  const { data: rankingRaw } = await supabase.from("ranking").select("*");
  const { count: jogosFinalizados } = await supabase
    .from("jogos")
    .select("*", { count: "exact", head: true })
    .eq("finalizado", true);

  const ranking = ordenarRanking((rankingRaw as RankRow[]) || []);
  const temPontos = ranking.some((u) => (u.total_pontos ?? 0) > 0);
  const podio = ranking.filter((u) => u.posicao <= 3 && (u.total_pontos ?? 0) > 0);

  // Agrupa o pódio por lugar (1, 2, 3) — cada lugar pode ter vários nomes em caso de empate
  const tiers = [1, 2, 3]
    .map((pos) => ({ pos, membros: podio.filter((u) => u.posicao === pos) }))
    .filter((t) => t.membros.length > 0);

  return (
    <>
      <Header nome={profile?.nome || "Você"} isAdmin={!!profile?.is_admin} userId={user.id} />
      <main className="max-w-4xl mx-auto px-4 py-5 pb-24">
        <div className="flex justify-between items-baseline mb-6 py-3 border-b border-yellow-400/20">
          <div>
            <div className="font-display text-4xl tracking-[4px] text-yellow-400 leading-none">
              RANKING
            </div>
            <div className="text-xs font-display tracking-[2px] opacity-60 mt-1">
              CLASSIFICAÇÃO GERAL
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl text-secondary">{jogosFinalizados || 0}</div>
            <div className="text-[10px] font-display tracking-[2px] opacity-60">
              {jogosFinalizados === 1 ? "JOGO" : "JOGOS"} ENCERRADOS
            </div>
          </div>
        </div>

        {/* Critérios — pontuação e desempate */}
        <div className="scorecard rounded-2xl p-4 mb-6 stagger-item">
          <div className="font-display text-[11px] tracking-[2px] text-[var(--gold)] mb-3">
            COMO FUNCIONA A PONTUAÇÃO
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-[var(--gold)]/[0.08] border border-[var(--gold)]/20 px-2 py-2.5 text-center">
              <div className="font-score font-bold text-xl text-[var(--gold)] leading-none">+5</div>
              <div className="text-[11px] text-secondary mt-1">🎯 Placar exato</div>
            </div>
            <div className="rounded-xl bg-green-400/[0.07] border border-green-400/20 px-2 py-2.5 text-center">
              <div className="font-score font-bold text-xl text-green-400 leading-none">+3</div>
              <div className="text-[11px] text-secondary mt-1">✓ Acertou o resultado</div>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/5 px-2 py-2.5 text-center">
              <div className="font-score font-bold text-xl text-faint leading-none">0</div>
              <div className="text-[11px] text-muted mt-1">✗ Errou o jogo</div>
            </div>
          </div>
          <p className="text-[11px] text-muted leading-relaxed border-t border-default mt-3 pt-3">
            <span className="text-secondary font-semibold">Desempate:</span> mais 🎯 placares exatos,
            depois mais ✓ acertos de resultado, depois ordem alfabética. Quem empata em pontos divide
            o mesmo lugar.
          </p>
        </div>

        {/* Pódio — em níveis, suporta empates (vários no mesmo lugar) */}
        {(jogosFinalizados || 0) > 0 && temPontos && tiers.length > 0 && (
          <div className="mb-6 space-y-2.5 stagger-item">
            {tiers.map(({ pos, membros }) => {
              const m = MEDALHAS[pos];
              const empate = membros.length > 1;
              return (
                <div
                  key={pos}
                  className={`scorecard ${
                    pos === 1 ? "scorecard-finalizado glow-gold" : ""
                  } rounded-2xl p-4 border ${m.borda}`}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-2xl leading-none">{m.emoji}</span>
                    <span className={`font-display tracking-[2px] text-sm ${m.texto}`}>
                      {m.nome}
                    </span>
                    {empate && (
                      <span className="ml-auto text-[10px] font-display tracking-[1px] bg-white/10 px-2 py-0.5 rounded-full text-muted">
                        EMPATE · {membros.length}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {membros.map((u) => {
                      const isMe = u.id === user.id;
                      return (
                        <div
                          key={u.id}
                          className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl ${
                            isMe ? "bg-[var(--gold)]/[0.08]" : "bg-white/[0.03]"
                          }`}
                        >
                          <span className="font-semibold text-[15px] truncate">
                            {u.nome}
                            {isMe && (
                              <span className="text-[var(--gold)]/70 text-xs ml-1">(você)</span>
                            )}
                          </span>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex gap-2 text-[11px] opacity-70 font-mono">
                              <span title="Placares exatos">🎯 {u.placares_exatos}</span>
                              <span title="Acertos de resultado">✓ {u.acertos_resultado}</span>
                            </div>
                            <div className={`font-score font-bold text-2xl leading-none ${m.texto}`}>
                              {u.total_pontos}
                              <span className="text-[10px] text-muted ml-0.5 font-body font-normal">
                                pts
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tabela completa */}
        {ranking.length === 0 ? (
          <div className="text-center py-12 text-muted">Sem participantes ainda.</div>
        ) : (
          ranking.map((u) => {
            const isMe = u.id === user.id;
            const isFirst = u.posicao === 1 && (u.total_pontos ?? 0) > 0;
            return (
              <div
                key={u.id}
                className={`stagger-item grid grid-cols-[40px_1fr_auto_auto] items-center gap-3 px-4 py-3.5 mb-1.5 rounded-xl border ${
                  isFirst
                    ? "bg-gradient-to-r from-yellow-400/15 to-yellow-400/5 border-yellow-400/40"
                    : isMe
                    ? "bg-yellow-400/[0.07] border-yellow-400/20"
                    : "bg-white/[0.03] border-white/5"
                }`}
              >
                <div className="font-display text-xl text-yellow-400/90 font-bold">
                  {u.posicao}
                  <span className="text-[10px] text-muted">º</span>
                </div>
                <div className="font-semibold text-[15px] truncate">
                  {u.nome}
                  {isMe && <span className="text-yellow-400/60 text-xs ml-1">(você)</span>}
                </div>
                <div className="flex gap-3 text-xs opacity-70 font-mono">
                  <span title="Placares exatos" className="flex items-center gap-1">
                    🎯 {u.placares_exatos}
                  </span>
                  <span title="Acertos de resultado" className="flex items-center gap-1">
                    ✓ {u.acertos_resultado}
                  </span>
                </div>
                <div className="font-score text-3xl text-yellow-400 font-bold leading-none">
                  {u.total_pontos}
                  <span className="text-xs opacity-60 ml-0.5 font-body font-normal">pts</span>
                </div>
              </div>
            );
          })
        )}
      </main>
      <BottomNav isAdmin={!!profile?.is_admin} />
    </>
  );
}
