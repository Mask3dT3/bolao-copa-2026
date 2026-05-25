// ============================================
// Calculadora de classificação por grupo
// ============================================

export type JogoGrupo = {
  id: number;
  time_a: string;
  time_b: string;
  gols_a: number | null;
  gols_b: number | null;
  finalizado: boolean;
  fase: string;
  data_jogo: string;
};

export type PalpiteUsuario = {
  jogo_id: number;
  gols_a: number;
  gols_b: number;
};

export type LinhaClassificacao = {
  time: string;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  saldo: number;
  pontos: number;
  // Indica fonte: real (jogo finalizado) ou palpite
  jogosReais: number;
  jogosSimulados: number;
};

/**
 * Calcula a classificação de um grupo combinando:
 * - Resultados REAIS de jogos finalizados
 * - PALPITES do usuário pra jogos ainda não finalizados (opcional)
 *
 * Se palpites = null, calcula só com jogos finalizados (classificação real parcial).
 * Se palpites = array, simula a classificação considerando palpites.
 */
export function calcularClassificacao(
  jogos: JogoGrupo[],
  palpites: PalpiteUsuario[] | null = null
): LinhaClassificacao[] {
  // Mapa time → estatísticas
  const stats = new Map<string, LinhaClassificacao>();

  function getStats(time: string): LinhaClassificacao {
    if (!stats.has(time)) {
      stats.set(time, {
        time,
        jogos: 0,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        golsPro: 0,
        golsContra: 0,
        saldo: 0,
        pontos: 0,
        jogosReais: 0,
        jogosSimulados: 0,
      });
    }
    return stats.get(time)!;
  }

  // Index dos palpites por jogo_id
  const palpitesPorJogo = new Map<number, PalpiteUsuario>();
  if (palpites) {
    for (const p of palpites) palpitesPorJogo.set(p.jogo_id, p);
  }

  for (const jogo of jogos) {
    let golsA: number | null = null;
    let golsB: number | null = null;
    let simulado = false;

    if (jogo.finalizado && jogo.gols_a !== null && jogo.gols_b !== null) {
      golsA = jogo.gols_a;
      golsB = jogo.gols_b;
    } else if (palpites) {
      const palpite = palpitesPorJogo.get(jogo.id);
      if (palpite) {
        golsA = palpite.gols_a;
        golsB = palpite.gols_b;
        simulado = true;
      }
    }

    if (golsA === null || golsB === null) continue; // Sem resultado nem palpite

    const a = getStats(jogo.time_a);
    const b = getStats(jogo.time_b);

    a.jogos++;
    b.jogos++;
    a.golsPro += golsA;
    a.golsContra += golsB;
    b.golsPro += golsB;
    b.golsContra += golsA;

    if (simulado) {
      a.jogosSimulados++;
      b.jogosSimulados++;
    } else {
      a.jogosReais++;
      b.jogosReais++;
    }

    if (golsA > golsB) {
      a.vitorias++;
      b.derrotas++;
      a.pontos += 3;
    } else if (golsA < golsB) {
      b.vitorias++;
      a.derrotas++;
      b.pontos += 3;
    } else {
      a.empates++;
      b.empates++;
      a.pontos++;
      b.pontos++;
    }
  }

  // Calcula saldo
  for (const s of stats.values()) {
    s.saldo = s.golsPro - s.golsContra;
  }

  // Ordena: pontos > saldo > gols pró > nome (estável)
  return Array.from(stats.values()).sort((x, y) => {
    if (y.pontos !== x.pontos) return y.pontos - x.pontos;
    if (y.saldo !== x.saldo) return y.saldo - x.saldo;
    if (y.golsPro !== x.golsPro) return y.golsPro - x.golsPro;
    return x.time.localeCompare(y.time);
  });
}

/**
 * Agrupa jogos por fase de grupo (ex: "Grupo A", "Grupo B"...)
 * Retorna mapa { "Grupo A": [jogo1, jogo2, ...], ... }
 * Jogos que não são de grupo (mata-mata) ficam em "Mata-mata"
 */
export function agruparJogos(jogos: JogoGrupo[]): Record<string, JogoGrupo[]> {
  const grupos: Record<string, JogoGrupo[]> = {};

  for (const jogo of jogos) {
    const ehGrupo = /^Grupo\s+[A-L]$/i.test(jogo.fase);
    const chave = ehGrupo ? jogo.fase : "Mata-mata";
    if (!grupos[chave]) grupos[chave] = [];
    grupos[chave].push(jogo);
  }

  // Ordena os jogos dentro de cada grupo por data
  for (const k of Object.keys(grupos)) {
    grupos[k].sort(
      (a, b) => new Date(a.data_jogo).getTime() - new Date(b.data_jogo).getTime()
    );
  }

  return grupos;
}

/**
 * Lista os grupos em ordem alfabética (A, B, C...), com "Mata-mata" no final
 */
export function listarGrupos(jogos: JogoGrupo[]): string[] {
  const grupos = agruparJogos(jogos);
  const nomes = Object.keys(grupos);
  const deGrupo = nomes.filter((n) => n !== "Mata-mata").sort();
  const mata = nomes.includes("Mata-mata") ? ["Mata-mata"] : [];
  return [...deGrupo, ...mata];
}
