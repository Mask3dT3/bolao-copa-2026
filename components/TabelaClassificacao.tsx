"use client";

import { LinhaClassificacao } from "@/lib/classificacao";
import { getBandeiraCircularUrl } from "@/lib/bandeiras";
import { Sparkles } from "lucide-react";

type Props = {
  classificacao: LinhaClassificacao[];
  simulado?: boolean; // Se está mostrando "como ficaria com palpites"
  titulo?: string;
};

export default function TabelaClassificacao({
  classificacao,
  simulado = false,
  titulo,
}: Props) {
  if (classificacao.length === 0) {
    return (
      <div className="text-center py-8 text-muted text-sm">
        Sem jogos suficientes pra calcular.
      </div>
    );
  }

  return (
    <div className="scorecard rounded-2xl overflow-hidden">
      {titulo && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-default">
          <div className="font-display text-sm tracking-[2px]">{titulo}</div>
          {simulado && (
            <span className="flex items-center gap-1 text-[10px] font-display tracking-[1.5px] bg-purple-400/15 text-purple-300 px-2 py-0.5 rounded-full">
              <Sparkles size={10} /> SIMULADO
            </span>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-display tracking-[2px] text-muted border-b border-default">
              <th className="text-left px-3 py-2 w-8">#</th>
              <th className="text-left px-2 py-2">TIME</th>
              <th className="text-center px-1.5 py-2 w-8" title="Jogos">J</th>
              <th className="text-center px-1.5 py-2 w-8" title="Vitórias">V</th>
              <th className="text-center px-1.5 py-2 w-8" title="Empates">E</th>
              <th className="text-center px-1.5 py-2 w-8" title="Derrotas">D</th>
              <th className="text-center px-1.5 py-2 w-10 hidden sm:table-cell" title="Saldo de gols">SG</th>
              <th className="text-center px-1.5 py-2 w-10 hidden sm:table-cell" title="Gols pró">GP</th>
              <th className="text-right px-3 py-2 w-12">PTS</th>
            </tr>
          </thead>
          <tbody>
            {classificacao.map((linha, i) => {
              const url = getBandeiraCircularUrl(linha.time);
              const classifica = i < 2; // Top 2 classifica
              return (
                <tr
                  key={linha.time}
                  className={`border-b border-default last:border-b-0 ${
                    classifica ? "bg-green-400/[0.04]" : ""
                  }`}
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <span className={`font-mono text-xs font-bold ${classifica ? "text-green-400" : "text-muted"}`}>
                        {i + 1}
                      </span>
                      {classifica && (
                        <span className="w-1 h-4 rounded-full bg-green-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {url ? (
                        <img
                          src={url}
                          alt={linha.time}
                          className="w-6 h-6 rounded-full object-cover ring-1 ring-default flex-shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[var(--border-default)] flex items-center justify-center text-[9px] font-bold text-muted flex-shrink-0">
                          {linha.time.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium truncate">{linha.time}</span>
                      {linha.jogosSimulados > 0 && (
                        <Sparkles size={11} className="text-purple-300 flex-shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="text-center font-mono text-xs">{linha.jogos}</td>
                  <td className="text-center font-mono text-xs">{linha.vitorias}</td>
                  <td className="text-center font-mono text-xs">{linha.empates}</td>
                  <td className="text-center font-mono text-xs">{linha.derrotas}</td>
                  <td className="text-center font-mono text-xs hidden sm:table-cell">
                    {linha.saldo > 0 ? `+${linha.saldo}` : linha.saldo}
                  </td>
                  <td className="text-center font-mono text-xs hidden sm:table-cell">
                    {linha.golsPro}
                  </td>
                  <td className="text-right px-3 py-2">
                    <span className="font-score font-bold text-lg text-[var(--gold)]">
                      {linha.pontos}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {simulado && (
        <div className="px-4 py-2 border-t border-default text-[11px] text-muted bg-purple-400/[0.03]">
          ✨ Times com ícone roxo têm jogos baseados no <strong>seu palpite</strong> (não no resultado real).
        </div>
      )}
    </div>
  );
}
