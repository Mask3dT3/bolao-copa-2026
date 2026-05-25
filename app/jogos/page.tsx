import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ListaJogos from "@/components/ListaJogos";

export const dynamic = "force-dynamic";

export default async function PaginaJogos() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, is_admin")
    .eq("id", user.id)
    .single();

  const { data: jogos } = await supabase
    .from("jogos")
    .select("*")
    .order("data_jogo", { ascending: true });

  // IMPORTANTE: usa a view apostas_publicas (que esconde placares antes do kickoff)
  // em vez da tabela apostas diretamente. Aqui também precisamos do nome de quem apostou.
  const { data: apostas } = await supabase
    .from("apostas_publicas")
    .select("*, profiles(nome)");

  const apostasPorJogo: Record<number, any[]> = {};
  const minhasApostas: Record<number, any> = {};

  (apostas || []).forEach((a) => {
    if (!apostasPorJogo[a.jogo_id]) apostasPorJogo[a.jogo_id] = [];
    apostasPorJogo[a.jogo_id].push(a);
    if (a.user_id === user.id) minhasApostas[a.jogo_id] = a;
  });

  return (
    <>
      <Header nome={profile?.nome || "Você"} isAdmin={!!profile?.is_admin} userId={user.id} />
      <main className="max-w-4xl mx-auto px-4 py-5 pb-24">
        {!jogos || jogos.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <p className="text-4xl mb-3">⚽</p>
            <p>Nenhum jogo carregado ainda.</p>
            {profile?.is_admin && (
              <p className="text-sm mt-2">
                Vá em <span className="text-[var(--gold)]">ADMIN</span> e clique em "Forçar atualização".
              </p>
            )}
          </div>
        ) : (
          <ListaJogos
            jogos={jogos as any}
            apostasPorJogo={apostasPorJogo}
            minhasApostas={minhasApostas}
            userId={user.id}
          />
        )}
      </main>
      <BottomNav isAdmin={!!profile?.is_admin} />
    </>
  );
}
