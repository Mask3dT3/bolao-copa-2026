import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PerfilForm from "@/components/PerfilForm";

export const dynamic = "force-dynamic";

export default async function PaginaPerfil() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, email, is_admin")
    .eq("id", user.id)
    .single();

  return (
    <>
      <Header
        nome={profile?.nome || "Você"}
        isAdmin={!!profile?.is_admin}
        userId={user.id}
      />
      <main className="max-w-2xl mx-auto px-4 py-5 pb-24">
        <div className="mb-6">
          <div className="title-stadium text-4xl leading-none">PERFIL</div>
          <div className="text-xs font-display tracking-[2px] text-muted mt-1">
            COMO VOCÊ APARECE NO BOLÃO
          </div>
        </div>

        <PerfilForm
          userId={user.id}
          nomeInicial={profile?.nome || ""}
          email={profile?.email || user.email || ""}
        />
      </main>
      <BottomNav isAdmin={!!profile?.is_admin} />
    </>
  );
}
