import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Avatar from "@/components/Avatar";

export const dynamic = "force-dynamic";

export default async function PaginaRanking() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("nome, foto_url, is_admin").eq("id", user.id).single();

  const { data: ranking } = await supabase.from("ranking").select("*");

  const userIds = (ranking || []).map((r: any) => r.id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, foto_url")
    .in("id", userIds.length > 0 ? userIds : ["x"]);

  const fotoPorId = new Map<string, string | null>();
  (profiles || []).forEach((p: any) => fotoPorId.set(p.id, p.foto_url));

  const { count: jogosFinalizados } = await supabase
    .from("jogos").select("*", { count: "exact", head: true }).eq("finalizado", true);

  return (
    <>
      <Header
        nome={profile?.nome || "Você"}
        isAdmin={!!profile?.is_admin}
        userId={user.id}
        fotoUrl={profile?.foto_url}
      />
      <main className="max-w-4xl mx-auto px-4 py-5 pb-24">
        <div className="flex justify-between items-baseline mb-6 py-3 border-b border-[var(--gold)]/20">
          <div>
            <div className="title-stadium text-4xl leading-none">RANKING</div>
            <div className="text-xs font-display tracking-[2px] text-muted mt-1">
              CLASSIFICAÇÃO GERAL
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl" style={{ color: "var(--text-primary)" }}>
              {jogosFinalizados || 0}
            </div>
            <div className="text-[10px] font-display tracking-[2px] text-muted">
              {jogosFinalizados === 1 ? "JOGO" : "JOGOS"} ENCERRADOS
            </div>
          </div>
        </div>

        {ranking && ranking.length >= 3 && (jogosFinalizados || 0) > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6 items-end stagger-item">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Avatar nome={ranking[1].nome} fotoUrl={fotoPorId.get(ranking[1].id)} size={56} />
              </div>
              <div className="scorecard rounded-xl p-3 pt-6 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-400 text-black text-xs font-bold rounded-full px-2 py-0.5">2º</div>
                <div className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                  {ranking[1].nome}
                </div>
                <div className="font-score text-2xl text-gray-300 mt-1">{ranking[1].total_pontos}</div>
                <div className="text-[10px] text-muted">pts</div>
              </div>
            </div>
            <div className="text-center transform -translate-y-3">
              <div className="flex justify-center mb-2">
                <Avatar nome={ranking[0].nome} fotoUrl={fotoPorId.get(ranking[0].id)} size={64} />
              </div>
              <div className="scorecard scorecard-finalizado rounded-xl p-3 pt-7 relative glow-gold">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--gold)] text-black text-xs font-bold rounded-full px-3 py-0.5">1º</div>
                <div className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                  {ranking[0].nome}
                </div>
                <div className="font-score text-3xl text-[var(--gold)] mt-1">{ranking[0].total_pontos}</div>
                <div className="text-[10px] text-muted">pts</div>
              </div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Avatar nome={ranking[2].nome} fotoUrl={fotoPorId.get(ranking[2].id)} size={56} />
              </div>
              <div className="scorecard rounded-xl p-3 pt-6 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-700 text-white text-xs font-bold rounded-full px-2 py-0.5">3º</div>
                <div className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                  {ranking[2].nome}
                </div>
                <div className="font-score text-2xl text-orange-400 mt-1">{ranking[2].total_pontos}</div>
                <div className="text-[10px] text-muted">pts</div>
              </div>
            </div>
          </div>
        )}

        {!ranking || ranking.length === 0 ? (
          <div className="text-center py-12 text-muted">Sem participantes ainda.</div>
        ) : (
          ranking.map((u: any, i: number) => {
            const isMe = u.id === user.id;
            const isFirst = i === 0 && u.total_pontos > 0;
            return (
              <div
                key={u.id}
                className={`stagger-item grid grid-cols-[40px_auto_1fr_auto_auto] items-center gap-3 px-4 py-3.5 mb-1.5 rounded-xl border ${
                  isFirst
                    ? "bg-gradient-to-r from-[var(--gold)]/15 to-[var(--gold)]/5 border-[var(--gold)]/40"
                    : isMe
                    ? "bg-[var(--gold)]/[0.07] border-[var(--gold)]/20"
                    : "bg-white/[0.03] border-default"
                }`}
              >
                <div className="font-display text-xl text-[var(--gold)] font-bold">
                  {i + 1}<span className="text-[10px] text-muted">º</span>
                </div>
                <Avatar nome={u.nome} fotoUrl={fotoPorId.get(u.id)} size={36} />
                <div className="font-semibold text-[15px] truncate" style={{ color: "var(--text-primary)" }}>
                  {u.nome}
                  {isMe && <span className="text-[var(--gold)]/70 text-xs ml-1">(você)</span>}
                </div>
                <div className="flex gap-3 text-xs text-muted font-mono">
                  <span title="Placares exatos" className="flex items-center gap-1">
                    🎯 {u.placares_exatos}
                  </span>
                  <span title="Acertos de resultado" className="flex items-center gap-1">
                    ✓ {u.acertos_resultado}
                  </span>
                </div>
                <div className="font-score text-3xl text-[var(--gold)] font-bold leading-none">
                  {u.total_pontos}
                  <span className="text-xs text-muted ml-0.5 font-body font-normal">pts</span>
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
