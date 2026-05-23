import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { Target, Check, Lock, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PaginaRegras() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, is_admin")
    .eq("id", user.id)
    .single();

  const regras = [
    {
      icon: <Target size={20} className="text-yellow-400" />,
      titulo: "PLACAR EXATO",
      valor: "+5 pontos",
      desc: "Acertou o número exato de gols dos dois times.",
    },
    {
      icon: <Check size={20} className="text-green-400" />,
      titulo: "ACERTOU O RESULTADO",
      valor: "+3 pontos",
      desc: "Acertou quem ganhou (ou empate), mas não o placar exato.",
    },
    {
      icon: <Lock size={20} className="text-white/40" />,
      titulo: "FECHAMENTO",
      desc: "Apostas ficam bloqueadas no momento do início de cada jogo. Você pode editar quantas vezes quiser antes disso.",
    },
    {
      icon: <Trophy size={20} className="text-yellow-400" />,
      titulo: "PRÊMIO",
      desc: "Valor fixo combinado entre os amigos antes do início da Copa. Quem fizer mais pontos no fim leva (ou divide entre os top 3, vocês decidem).",
    },
  ];

  return (
    <>
      <Header nome={profile?.nome || "Você"} isAdmin={!!profile?.is_admin} />
      <main className="max-w-3xl mx-auto px-4 py-5 pb-12">
        <div className="font-display text-3xl tracking-[4px] text-yellow-400 mb-5">
          COMO FUNCIONA
        </div>

        <div className="flex flex-col gap-3">
          {regras.map((r, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 bg-white/[0.03] border border-white/8 rounded"
            >
              <div className="flex-shrink-0">{r.icon}</div>
              <div>
                <div className="font-display text-base tracking-[2px]">{r.titulo}</div>
                {r.valor && (
                  <div className="font-display text-2xl text-yellow-400 mt-1">
                    {r.valor}
                  </div>
                )}
                <div className="text-sm opacity-70 mt-1.5 leading-relaxed">
                  {r.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-green-400/[0.05] border border-green-400/30 rounded text-sm leading-relaxed opacity-90">
          <strong>RESULTADOS AUTOMÁTICOS:</strong> Os placares são puxados em tempo real
          da Football-Data.org (fonte profissional usada por milhares de apps de futebol).
          Atualização a cada minuto durante os jogos — você não precisa fazer nada,
          os pontos são creditados sozinhos.
        </div>
      </main>
    </>
  );
}
