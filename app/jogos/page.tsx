import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ListaJogos from "@/components/ListaJogos";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PaginaJogos() {
  noStore(); // desliga o cache de dados do Next: os palpites são sempre lidos frescos
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, foto_url, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const { data: jogos } = await supabase
    .from("jogos")
    .select("*")
    .order("data_jogo", { ascending: true });

  // Palpites de TODOS — via view pública, que oculta os placares dos jogos que ainda não
  // começaram (pra ninguém copiar). Serve só pra montar a lista "N PALPITES" de cada jogo.
  // A view agora vem de uma função (traz nome/foto_url como colunas), então lemos "*"
  // sem embed — o embed de profiles não funciona em view baseada em função no PostgREST.
  const { data: apostasPublicas } = await supabase
    .from("apostas_publicas")
    .select("*");

  // MEUS palpites SEMPRE, lidos direto da tabela `apostas`. A RLS já libera o dono a ver os
  // próprios (auth.uid() = user_id), inclusive em jogos futuros — que é justamente o que a
  // view esconde. Sem isto, ao recarregar a página o seu próprio palpite some da tela e
  // parece que "não salvou" (mesmo já estando gravado no banco).
  const { data: apostasMinhas } = await supabase
    .from("apostas")
    .select("*")
    .eq("user_id", user.id);

  const apostasPorJogo: Record<number, any[]> = {};
  const minhasApostas: Record<number, any> = {};

  (apostasPublicas || []).forEach((a) => {
    const row = { ...a, profiles: { nome: a.nome, foto_url: a.foto_url } };
    if (!apostasPorJogo[a.jogo_id]) apostasPorJogo[a.jogo_id] = [];
    apostasPorJogo[a.jogo_id].push(row);
  });

  // Injeta os meus palpites (com o placar real) por cima do que veio da view, garantindo
  // que eu sempre veja o meu — tanto no card "SEU PALPITE" quanto na lista do jogo.
  (apostasMinhas || []).forEach((a) => {
    const meu = { ...a, profiles: { nome: profile?.nome || "Você" } };
    minhasApostas[a.jogo_id] = meu;
    const lista = apostasPorJogo[a.jogo_id] || (apostasPorJogo[a.jogo_id] = []);
    const idx = lista.findIndex((x) => x.user_id === a.user_id);
    if (idx >= 0) lista[idx] = meu;
    else lista.push(meu);
  });

  return (
    <>
      <Header
        nome={profile?.nome || "Você"}
        isAdmin={!!profile?.is_admin}
        userId={user.id}
        fotoUrl={profile?.foto_url}
      />
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
