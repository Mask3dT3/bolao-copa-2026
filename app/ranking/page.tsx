import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Trophy, Medal, Target } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PaginaRanking() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("nome, is_admin").eq("id", user.id).single();

  const { data: ranking } = await supabase.from("ranking").select("*");
  const { count: jogosFinalizados } = await supabase
    .from("jogos").select("*", { count: "exact", head: true }).eq("finalizado", true);

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

        {/* Pódio Top 3 */}
        {ranking && ranking.length >= 3 && (jogosFinalizados || 0) > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6 items-end stagger-item">
            {/* 2º */}
            <div className="text-center">
              <div className="text-3xl mb-2">🥈</div>
              <div className="scorecard rounded-xl p-3 pt-6 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-400 text-black text-xs font-bold rounded-full px-2 py-0.5">2º</div>
                <div className="font-semibold text-sm truncate">{ranking[1].nome}</div>
                <div className="font-score text-2xl text-gray-300 mt-1">{ranking[1].total_pontos}</div>
                <div className="text-[10px] text-muted">pts</div>
              </div>
            </div>
            {/* 1º */}
            <div className="text-center transform -translate-y-3">
              <div className="text-4xl mb-2 animate-pulse">🏆</div>
              <div className="scorecard scorecard-finalizado rounded-xl p-3 pt-7 relative glow-gold">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold rounded-full px-3 py-0.5">1º</div>
                <div className="font-semibold text-sm truncate">{ranking[0].nome}</div>
                <div className="font-score text-3xl text-yellow-400 mt-1">{ranking[0].total_pontos}</div>
                <div className="text-[10px] text-muted">pts</div>
              </div>
            </div>
            {/* 3º */}
            <div className="text-center">
              <div className="text-3xl mb-2">🥉</div>
              <div className="scorecard rounded-xl p-3 pt-6 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-700 text-white text-xs font-bold rounded-full px-2 py-0.5">3º</div>
                <div className="font-semibold text-sm truncate">{ranking[2].nome}</div>
                <div className="font-score text-2xl text-orange-400 mt-1">{ranking[2].total_pontos}</div>
                <div className="text-[10px] text-muted">pts</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabela completa */}
        {!ranking || ranking.length === 0 ? (
          <div className="text-center py-12 text-muted">Sem participantes ainda.</div>
        ) : (
          ranking.map((u: any, i: number) => {
            const isMe = u.id === user.id;
            const isFirst = i === 0 && u.total_pontos > 0;
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
                  {i + 1}<span className="text-[10px] text-muted">º</span>
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
