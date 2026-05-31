import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import AdminPanel from "@/components/AdminPanel";

export const dynamic = "force-dynamic";

export default async function PaginaAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("nome, foto_url, is_admin").eq("id", user.id).single();

  if (!profile?.is_admin) redirect("/jogos");

  const { data: jogos } = await supabase
    .from("jogos").select("*").order("data_jogo", { ascending: true });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/atualiza-jogos`;

  return (
    <>
      <Header
        nome={profile.nome}
        isAdmin={true}
        userId={user.id}
        fotoUrl={profile.foto_url}
      />
      <main className="max-w-4xl mx-auto px-4 py-5 pb-24">
        <AdminPanel jogos={jogos || []} edgeFunctionUrl={edgeFunctionUrl} />
      </main>
      <BottomNav isAdmin={true} />
    </>
  );
}
