import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";

export const dynamic = "force-dynamic";

export default async function PaginaRanking() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, is_admin")
    .eq("id", user.id)
    .single();

  const { data: ranking } = await supabase
    .from("ranking")
    .select("*");

  const { count: jogosFinalizados } = await supabase
    .from("jogos")
    .select("*", { count: "exact", head: true })
    .eq("finalizado", true);

  return (
    <>
      <Header nome={profile?.nome || "Você"} isAdmin={!!profile?.is_admin} />
      <main className="max-w-3xl mx-auto px-4 py-5 pb-12">
        <div className="flex justify-between items-baseline mb-5 py-3 border-b border-yellow-400/20">
          <div className="font-display text-3xl tracking-[4px] text-yellow-400">
            RANKING GERAL
          </div>
          <div className="text-xs font-display tracking-[2px] opacity-60">
            {jogosFinalizados || 0} {jogosFinalizados === 1 ? "JOGO FINALIZADO" : "JOGOS FINALIZADOS"}
          </div>
        </div>

        {!ranking || ranking.length === 0 ? (
          <div className="text-center py-12 opacity-50">Sem participantes ainda.</div>
        ) : (
          ranking.map((u: any, i: number) => {
            const isMe = u.id === user.id;
            const isFirst = i === 0 && u.total_pontos > 0;
            return (
              <div
                key={u.id}
                className={`grid grid-cols-[50px_1fr_auto_auto] items-center gap-3 px-4 py-3.5 mb-1.5 rounded border ${
                  isFirst
                    ? "bg-gradient-to-r from-yellow-400/15 to-yellow-400/5 border-yellow-400/40"
                    : isMe
                    ? "bg-yellow-400/[0.07] border-yellow-400/20"
                    : "bg-white/[0.03] border-white/5"
                }`}
              >
                <div className="font-display text-2xl text-yellow-400">
                  {isFirst ? "🏆" : `${i + 1}º`}
                </div>
                <div className="font-semibold text-[15px]">
                  {u.nome} {isMe && <span className="text-yellow-400/60 text-xs ml-1">(você)</span>}
                </div>
                <div className="flex gap-2 text-xs opacity-70 font-mono">
                  <span>🎯 {u.placares_exatos}</span>
                  <span>✓ {u.acertos_resultado}</span>
                </div>
                <div className="font-display text-3xl text-yellow-400">
                  {u.total_pontos}
                  <span className="text-xs opacity-60 ml-1">pts</span>
                </div>
              </div>
            );
          })
        )}
      </main>
    </>
  );
}
