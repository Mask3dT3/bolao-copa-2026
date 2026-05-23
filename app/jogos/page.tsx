import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import CardJogo from "@/components/CardJogo";

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

  const { data: apostas } = await supabase
    .from("apostas")
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
      <Header nome={profile?.nome || "Você"} isAdmin={!!profile?.is_admin} />
      <main className="max-w-3xl mx-auto px-4 py-5 pb-12">
        {!jogos || jogos.length === 0 ? (
          <div className="text-center py-12 opacity-60">
            <p>Nenhum jogo cadastrado ainda.</p>
            {profile?.is_admin && (
              <p className="text-sm mt-2">
                Vá em <span className="text-yellow-400">ADMIN</span> pra importar os jogos da Copa.
              </p>
            )}
          </div>
        ) : (
          jogos.map((jogo) => (
            <CardJogo
              key={jogo.id}
              jogo={jogo}
              minhaAposta={minhasApostas[jogo.id] || null}
              todasApostas={apostasPorJogo[jogo.id] || []}
              userId={user.id}
            />
          ))
        )}
      </main>
    </>
  );
}
