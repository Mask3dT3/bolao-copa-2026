import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Target, Check, X, TrendingUp, Award, Flame, AlertCircle } from "lucide-react";
import { getBandeiraCircularUrl } from "@/lib/bandeiras";

export const dynamic = "force-dynamic";

export default async function PaginaEstatisticas() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("nome, foto_url, is_admin").eq("id", user.id).single();

  const { data: apostas } = await supabase
    .from("apostas")
    .select("*, jogos(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const apostasFinalizadas = (apostas || []).filter((a: any) => a.jogos?.finalizado);
  const apostasPendentes = (apostas || []).filter((a: any) => !a.jogos?.finalizado);

  const totalPontos = apostasFinalizadas.reduce((s: number, a: any) => s + (a.pontos || 0), 0);
  const placaresExatos = apostasFinalizadas.filter((a: any) => a.pontos === 5).length;
  const acertosResultado = apostasFinalizadas.filter((a: any) => a.pontos === 3).length;
  const erros = apostasFinalizadas.filter((a: any) => a.pontos === 0).length;
  const taxaAcerto = apostasFinalizadas.length > 0
    ? Math.round(((placaresExatos + acertosResultado) / apostasFinalizadas.length) * 100)
    : 0;
  const mediaPontos = apostasFinalizadas.length > 0
    ? (totalPontos / apostasFinalizadas.length).toFixed(1)
    : "0";

  let sequenciaAtual = 0;
  for (const a of apostasFinalizadas) {
    if ((a.pontos || 0) > 0) sequenciaAtual++;
    else break;
  }

  return (
    <>
      <Header
        nome={profile?.nome || "Você"}
        isAdmin={!!profile?.is_admin}
        userId={user.id}
        fotoUrl={profile?.foto_url}
      />
      <main className="max-w-4xl mx-auto px-4 py-5 pb-24">
        <div className="mb-6">
          <div className="title-stadium text-4xl leading-none">ESTATÍSTICAS</div>
          <div className="text-xs font-display tracking-[2px] text-muted mt-1">
            SEU DESEMPENHO NO BOLÃO
          </div>
        </div>

        {apostasFinalizadas.length === 0 ? (
          <div className="scorecard rounded-xl p-8 text-center stagger-item">
            <AlertCircle size={32} className="mx-auto text-[var(--gold)]/60 mb-3" />
            <p style={{ color: "var(--text-secondary)" }}>Sem estatísticas ainda.</p>
            <p className="text-sm text-muted mt-1">
              {apostasPendentes.length > 0
                ? `Você tem ${apostasPendentes.length} ${apostasPendentes.length === 1 ? "palpite pendente" : "palpites pendentes"}.`
                : "Faça seus palpites na aba Jogos!"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="stagger-item scorecard rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1 text-[var(--gold)]">
                  <Award size={16} />
                  <span className="text-[10px] font-display tracking-[2px] text-muted">PONTOS</span>
                </div>
                <div className="font-score text-3xl text-[var(--gold)] font-bold">{totalPontos}</div>
              </div>

              <div className="stagger-item scorecard rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1 text-green-400">
                  <TrendingUp size={16} />
                  <span className="text-[10px] font-display tracking-[2px] text-muted">% ACERTO</span>
                </div>
                <div className="font-score text-3xl text-green-400 font-bold">{taxaAcerto}%</div>
              </div>

              <div className="stagger-item scorecard rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1 text-orange-400">
                  <Flame size={16} />
                  <span className="text-[10px] font-display tracking-[2px] text-muted">SEQUÊNCIA</span>
                </div>
                <div className="font-score text-3xl text-orange-400 font-bold">{sequenciaAtual}</div>
              </div>

              <div className="stagger-item scorecard rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1" style={{ color: "var(--text-primary)" }}>
                  <Target size={16} />
                  <span className="text-[10px] font-display tracking-[2px] text-muted">MÉDIA/JOGO</span>
                </div>
                <div className="font-score text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{mediaPontos}</div>
              </div>
            </div>

            <div className="scorecard rounded-xl p-5 mb-6 stagger-item">
              <div className="font-display text-sm tracking-[2px] text-muted mb-4">
                BREAKDOWN
              </div>
              <div className="space-y-3">
                <BarStat
                  icon={<Target size={16} className="text-[var(--gold)]" />}
                  label="Placar exato"
                  valor={placaresExatos}
                  total={apostasFinalizadas.length}
                  cor="bg-[var(--gold)]"
                  pontos={`+${placaresExatos * 5} pts`}
                />
                <BarStat
                  icon={<Check size={16} className="text-green-400" />}
                  label="Só resultado"
                  valor={acertosResultado}
                  total={apostasFinalizadas.length}
                  cor="bg-green-400"
                  pontos={`+${acertosResultado * 3} pts`}
                />
                <BarStat
                  icon={<X size={16} className="text-red-400/70" />}
                  label="Sem pontuar"
                  valor={erros}
                  total={apostasFinalizadas.length}
                  cor="bg-red-400/70"
                  pontos="0 pts"
                />
              </div>
            </div>

            <div className="font-display text-sm tracking-[2px] text-muted mb-3">
              ÚLTIMOS 10 PALPITES
            </div>
            <div className="space-y-2">
              {apostasFinalizadas.slice(0, 10).map((a: any) => {
                const j = a.jogos;
                const data = new Date(j.data_jogo);
                return (
                  <div
                    key={a.id}
                    className="stagger-item scorecard rounded-lg p-3 flex items-center gap-3"
                  >
                    <Mini time={j.time_a} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>
                        {j.time_a} <span className="text-muted">×</span> {j.time_b}
                      </div>
                      <div className="text-[10px] text-muted font-mono">
                        {data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} · {j.fase}
                      </div>
                    </div>
                    <Mini time={j.time_b} />
                    <div className="text-right">
                      <div className="font-mono text-sm text-[var(--gold)]/80">
                        {a.gols_a}-{a.gols_b}
                      </div>
                      <div className="font-mono text-[10px] text-muted">
                        real: {j.gols_a}-{j.gols_b}
                      </div>
                    </div>
                    <div
                      className={`font-display text-xl font-bold min-w-[40px] text-right ${
                        a.pontos === 5
                          ? "text-[var(--gold)]"
                          : a.pontos === 3
                          ? "text-green-400"
                          : "text-faint"
                      }`}
                    >
                      +{a.pontos}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
      <BottomNav isAdmin={!!profile?.is_admin} />
    </>
  );
}

function BarStat({
  icon, label, valor, total, cor, pontos,
}: {
  icon: React.ReactNode; label: string; valor: number; total: number; cor: string; pontos: string;
}) {
  const pct = total > 0 ? (valor / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-primary)" }}>
          {icon}
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted font-mono">{valor}/{total}</span>
          <span className="font-display tracking-wider" style={{ color: "var(--text-secondary)" }}>{pontos}</span>
        </div>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full ${cor} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Mini({ time }: { time: string }) {
  const url = getBandeiraCircularUrl(time);
  if (!url) {
    return (
      <div className="w-7 h-7 rounded-full bg-[var(--border-default)] flex items-center justify-center text-[9px] font-bold text-muted flex-shrink-0">
        {time.substring(0, 2).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={time}
      className="w-7 h-7 rounded-full object-cover ring-1 ring-default flex-shrink-0"
    />
  );
}
