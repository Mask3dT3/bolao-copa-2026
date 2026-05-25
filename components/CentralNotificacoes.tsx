"use client";

import { useEffect, useState } from "react";
import { Bell, Trophy, Clock, X } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

type Notificacao = {
  id: number;
  tipo: "jogo_iminente" | "pontuou" | "sem_palpite";
  titulo: string;
  descricao: string;
  jogo_id?: number;
  lida: boolean;
  timestamp: number;
};

export default function CentralNotificacoes({ userId }: { userId: string }) {
  const [aberta, setAberta] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    gerarNotificacoes();
    // Recarrega a cada 5 minutos
    const intervalo = setInterval(gerarNotificacoes, 5 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, [userId]);

  async function gerarNotificacoes() {
    setCarregando(true);
    const supabase = createClient();

    const novas: Notificacao[] = [];
    const agora = Date.now();

    // 1. Jogos nas próximas 24h sem palpite
    const { data: jogos } = await supabase
      .from("jogos")
      .select("*")
      .eq("finalizado", false)
      .gte("data_jogo", new Date().toISOString())
      .lte("data_jogo", new Date(Date.now() + 86400000).toISOString())
      .order("data_jogo");

    const { data: minhasApostas } = await supabase
      .from("apostas")
      .select("jogo_id")
      .eq("user_id", userId);

    const jogoIdsApostados = new Set((minhasApostas || []).map((a) => a.jogo_id));

    (jogos || []).forEach((jogo) => {
      const dataJogo = new Date(jogo.data_jogo);
      const horasAte = (dataJogo.getTime() - agora) / 3600000;

      if (!jogoIdsApostados.has(jogo.id)) {
        novas.push({
          id: jogo.id * 1000,
          tipo: "sem_palpite",
          titulo: `Sem palpite: ${jogo.time_a} × ${jogo.time_b}`,
          descricao: horasAte < 1
            ? `Em menos de 1h — apostas fecham no início!`
            : `Em ${Math.round(horasAte)}h — ${dataJogo.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
          jogo_id: jogo.id,
          lida: false,
          timestamp: dataJogo.getTime(),
        });
      } else if (horasAte < 1) {
        novas.push({
          id: jogo.id * 1000 + 1,
          tipo: "jogo_iminente",
          titulo: `Jogo começando: ${jogo.time_a} × ${jogo.time_b}`,
          descricao: `Em ${Math.round(horasAte * 60)} min`,
          jogo_id: jogo.id,
          lida: false,
          timestamp: dataJogo.getTime(),
        });
      }
    });

    // 2. Apostas que pontuaram recentemente (últimas 48h)
    const { data: apostasPontuadas } = await supabase
      .from("apostas")
      .select("*, jogos!inner(time_a, time_b, gols_a, gols_b, data_jogo, finalizado)")
      .eq("user_id", userId)
      .gt("pontos", 0)
      .gte("jogos.data_jogo", new Date(Date.now() - 172800000).toISOString())
      .eq("jogos.finalizado", true)
      .order("jogos(data_jogo)", { ascending: false });

    (apostasPontuadas || []).forEach((a: any) => {
      novas.push({
        id: a.id * 100,
        tipo: "pontuou",
        titulo: `+${a.pontos} pontos: ${a.jogos.time_a} × ${a.jogos.time_b}`,
        descricao: a.pontos === 5
          ? `🎯 Placar exato (${a.jogos.gols_a}×${a.jogos.gols_b})`
          : `✓ Acertou o resultado`,
        jogo_id: a.jogo_id,
        lida: false,
        timestamp: new Date(a.jogos.data_jogo).getTime(),
      });
    });

    // Lê IDs lidos do localStorage
    const idsLidos = JSON.parse(localStorage.getItem("notif-lidas") || "[]");

    // Ordena por timestamp desc
    novas.sort((a, b) => b.timestamp - a.timestamp);

    setNotificacoes(
      novas.map((n) => ({ ...n, lida: idsLidos.includes(n.id) }))
    );
    setCarregando(false);
  }

  function marcarTodasLidas() {
    const ids = notificacoes.map((n) => n.id);
    localStorage.setItem("notif-lidas", JSON.stringify(ids));
    setNotificacoes((n) => n.map((x) => ({ ...x, lida: true })));
  }

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  const icones = {
    jogo_iminente: <Clock size={16} className="text-orange-400" />,
    pontuou: <Trophy size={16} className="text-[var(--gold)]" />,
    sem_palpite: <AlertIcon />,
  };

  return (
    <>
      <button
        onClick={() => setAberta(true)}
        className="relative w-10 h-10 rounded-full border border-default hover:border-strong flex items-center justify-center"
        title="Notificações"
      >
        <Bell size={16} className="text-[var(--gold)]" />
        {naoLidas > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-400 text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center pulse-glow">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </button>

      {aberta && (
        <div
          className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
          onClick={() => setAberta(false)}
        >
          <div
            className="
              absolute scorecard rounded-2xl overflow-hidden flex flex-col shadow-2xl
              max-sm:bottom-4 max-sm:left-4 max-sm:right-4 max-sm:top-20
              sm:top-20 sm:right-4 sm:w-96 sm:max-h-[70vh]
            "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-default flex-shrink-0">
              <div className="font-display text-lg tracking-wider text-primary">NOTIFICAÇÕES</div>
              <div className="flex items-center gap-2">
                {naoLidas > 0 && (
                  <button
                    onClick={marcarTodasLidas}
                    className="text-xs text-[var(--gold)] hover:underline"
                  >
                    Marcar lidas
                  </button>
                )}
                <button
                  onClick={() => setAberta(false)}
                  className="text-muted hover:text-primary"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {carregando ? (
                <div className="p-8 text-center text-muted text-sm">Carregando...</div>
              ) : notificacoes.length === 0 ? (
                <div className="p-8 text-center text-muted text-sm">
                  <Bell size={32} className="mx-auto text-faint mb-2" />
                  Nenhuma notificação no momento.
                </div>
              ) : (
                notificacoes.map((n) => (
                  <a
                    key={n.id}
                    href={n.jogo_id ? `/jogos` : "#"}
                    onClick={() => setAberta(false)}
                    className={`block px-4 py-3 border-b border-default last:border-b-0 hover:bg-[var(--border-default)] transition ${
                      !n.lida ? "bg-[var(--gold)]/[0.05]" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">{icones[n.tipo]}</div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm leading-tight text-primary ${
                            !n.lida ? "font-semibold" : ""
                          }`}
                        >
                          {n.titulo}
                        </div>
                        <div className="text-xs text-secondary mt-0.5">
                          {n.descricao}
                        </div>
                      </div>
                      {!n.lida && (
                        <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" className="text-warning" />
      <path d="M8 4v5M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-warning" />
    </svg>
  );
}
