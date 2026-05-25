import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Target, Check, Lock, Trophy, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PaginaRegras() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("nome, is_admin").eq("id", user.id).single();

  const regras = [
    { icon: Target, color: "text-yellow-400", titulo: "PLACAR EXATO", valor: "5 PTS",
      desc: "Acertou o número exato de gols dos dois times." },
    { icon: Check, color: "text-green-400", titulo: "ACERTOU O RESULTADO", valor: "3 PTS",
      desc: "Acertou quem ganhou (ou empate), mas não o placar exato." },
    { icon: Lock, color: "text-muted", titulo: "FECHAMENTO",
      desc: "Apostas ficam bloqueadas no momento do início de cada jogo. Você pode editar quantas vezes quiser antes disso." },
    { icon: Trophy, color: "text-yellow-400", titulo: "PRÊMIO",
      desc: "Valor fixo combinado entre os amigos antes do início da Copa. Quem fizer mais pontos no fim leva (ou divide entre os top 3, vocês decidem)." },
  ];

  return (
    <>
      <Header nome={profile?.nome || "Você"} isAdmin={!!profile?.is_admin} userId={user.id} />
      <main className="max-w-4xl mx-auto px-4 py-5 pb-24">
        <div className="mb-6">
          <div className="font-display text-4xl tracking-[4px] text-yellow-400 leading-none">
            COMO FUNCIONA
          </div>
          <div className="text-xs font-display tracking-[2px] opacity-60 mt-1">
            REGRAS DO BOLÃO
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {regras.map((r, i) => (
            <div
              key={i}
              className="stagger-item flex gap-4 p-5 scorecard rounded-xl"
            >
              <div className="flex-shrink-0 mt-1">
                <r.icon size={24} className={r.color} />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <div className="font-display text-base tracking-[2px]">{r.titulo}</div>
                  {r.valor && (
                    <div className="font-display text-2xl text-yellow-400">{r.valor}</div>
                  )}
                </div>
                <div className="text-sm opacity-70 mt-2 leading-relaxed">{r.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="stagger-item mt-4 p-4 bg-green-400/[0.05] border border-green-400/30 rounded-xl flex items-start gap-3">
          <Zap size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed opacity-90">
            <strong className="text-green-400 font-display tracking-wide">SINCRONIZAÇÃO AUTOMÁTICA:</strong>{" "}
            os placares são puxados em tempo real da Football-Data.org (fonte profissional).
            Atualização a cada minuto durante os jogos — os pontos são creditados sozinhos.
          </div>
        </div>
      </main>
      <BottomNav isAdmin={!!profile?.is_admin} />
    </>
  );
}
