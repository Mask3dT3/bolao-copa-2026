"use client";

// Gera cor consistente baseada no nome (hash simples)
function corPorNome(nome: string): { bg: string; texto: string } {
  if (!nome) return { bg: "#888", texto: "#fff" };

  // 12 paletas estilo Gmail
  const paletas = [
    { bg: "#1A73E8", texto: "#fff" }, // azul
    { bg: "#E84940", texto: "#fff" }, // vermelho
    { bg: "#F9AB00", texto: "#000" }, // amarelo
    { bg: "#1E8E3E", texto: "#fff" }, // verde
    { bg: "#9334E6", texto: "#fff" }, // roxo
    { bg: "#FA7B17", texto: "#fff" }, // laranja
    { bg: "#12B5CB", texto: "#fff" }, // ciano
    { bg: "#D01884", texto: "#fff" }, // rosa
    { bg: "#5F6368", texto: "#fff" }, // cinza
    { bg: "#34A853", texto: "#fff" }, // verde-claro
    { bg: "#4285F4", texto: "#fff" }, // azul-claro
    { bg: "#A142F4", texto: "#fff" }, // violeta
  ];

  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = (hash << 5) - hash + nome.charCodeAt(i);
    hash |= 0;
  }
  return paletas[Math.abs(hash) % paletas.length];
}

function iniciais(nome: string): string {
  if (!nome) return "?";
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

type Props = {
  nome: string;
  fotoUrl?: string | null;
  size?: number;
  className?: string;
  ring?: boolean;
};

export default function Avatar({
  nome,
  fotoUrl,
  size = 36,
  className = "",
  ring = true,
}: Props) {
  const { bg, texto } = corPorNome(nome);
  const letras = iniciais(nome);

  const baseClasses = `rounded-full flex-shrink-0 inline-flex items-center justify-center font-semibold overflow-hidden ${
    ring ? "ring-2 ring-[var(--gold)]/20" : ""
  } ${className}`;

  if (fotoUrl) {
    return (
      <img
        src={fotoUrl}
        alt={nome}
        style={{ width: size, height: size }}
        className={`${baseClasses} object-cover`}
        onError={(e) => {
          // Se a imagem falhar, esconde e mostra iniciais via re-render? Simples: troca pra div
          const img = e.target as HTMLImageElement;
          const div = document.createElement("div");
          div.style.cssText = `width:${size}px;height:${size}px;background:${bg};color:${texto};font-size:${Math.floor(
            size * 0.4
          )}px;font-weight:600`;
          div.className = baseClasses + " select-none";
          div.textContent = letras;
          img.parentNode?.replaceChild(div, img);
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        color: texto,
        fontSize: Math.floor(size * 0.4),
      }}
      className={`${baseClasses} select-none`}
      title={nome}
    >
      {letras}
    </div>
  );
}
