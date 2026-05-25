"use client";

type Tamanho = "xl" | "md" | "sm";

type Props = {
  tamanho?: Tamanho;
  mostrarTagline?: boolean;
  className?: string;
};

export default function LogoBolao({
  tamanho = "md",
  mostrarTagline = false,
  className = "",
}: Props) {
  if (tamanho === "xl") return <LogoGrande mostrarTagline={mostrarTagline} className={className} />;
  if (tamanho === "sm") return <LogoPequeno className={className} />;
  return <LogoMedio className={className} />;
}

function LogoGrande({ mostrarTagline, className }: { mostrarTagline: boolean; className: string }) {
  return (
    <div className={`text-center ${className}`}>
      <div className="flex justify-center mb-3" aria-hidden>
        <Trofeu size={88} />
      </div>

      <div className="flex items-center justify-center gap-3 mb-4" aria-hidden>
        <span className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--gold)]/60" />
        <span
          className="font-bold text-xs tracking-[8px]"
          style={{ color: "var(--gold)" }}
        >
          ★ 2026 ★
        </span>
        <span className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--gold)]/60" />
      </div>

      <h1
        className="font-display leading-none"
        style={{
          fontSize: "clamp(48px, 11vw, 72px)",
          letterSpacing: "0.12em",
          color: "var(--gold)",
        }}
      >
        BOLÃO
      </h1>

      <div className="my-3 mx-auto h-px w-48 bg-[var(--gold)]/40" />

      <h2
        className="font-display leading-none"
        style={{
          fontSize: "clamp(40px, 9vw, 60px)",
          letterSpacing: "0.10em",
          color: "var(--gold)",
        }}
      >
        COPA 2026
      </h2>

      {mostrarTagline && (
        <>
          <div className="flex items-center justify-center gap-3 mt-5" aria-hidden>
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--gold)]/60" />
            <span className="h-px w-8 bg-[var(--gold)]/30" />
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--gold)]/60" />
          </div>
          <p
            className="mt-3 text-[10px] sm:text-[11px]"
            style={{ letterSpacing: "0.4em", color: "var(--text-secondary)" }}
          >
            PALPITES · RANKING · ESTRATÉGIA
          </p>
        </>
      )}
    </div>
  );
}

function LogoMedio({ className }: { className: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Trofeu size={36} />
      <div>
        <div
          className="font-display leading-none"
          style={{
            fontSize: "28px",
            letterSpacing: "0.10em",
            color: "var(--gold)",
          }}
        >
          BOLÃO COPA 2026
        </div>
        <div className="mt-1 h-px w-full bg-[var(--gold)]/30" />
      </div>
    </div>
  );
}

function LogoPequeno({ className }: { className: string }) {
  return <Trofeu size={28} className={className} />;
}

function Trofeu({ size = 64, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Troféu Bolão Copa 2026"
    >
      <defs>
        <linearGradient id={`goldGrad-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFE96B" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#D4A800" />
        </linearGradient>
        <linearGradient id={`goldGrad2-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
      </defs>

      {/* Alças */}
      <path
        d="M 24 32 Q 8 32 8 50 Q 8 66 22 66"
        fill="none"
        stroke={`url(#goldGrad-${size})`}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M 76 32 Q 92 32 92 50 Q 92 66 78 66"
        fill="none"
        stroke={`url(#goldGrad-${size})`}
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Taça */}
      <path
        d="M 24 22 L 24 56 Q 24 82 50 86 Q 76 82 76 56 L 76 22 Z"
        fill={`url(#goldGrad-${size})`}
      />

      {/* Linha decorativa */}
      <line x1="28" y1="35" x2="72" y2="35" stroke="#0a0e1a" strokeWidth="0.8" opacity="0.4" />

      {/* Bola estilizada no centro */}
      <circle cx="50" cy="46" r="9" fill="#0a0e1a" stroke="#FFD700" strokeWidth="0.5" />
      <polygon points="50,41 56,48 54,55 46,55 44,48" fill="#FFE96B" opacity="0.95" />

      {/* Pedestal */}
      <rect x="32" y="88" width="36" height="6" rx="1" fill={`url(#goldGrad2-${size})`} />
      <rect x="26" y="95" width="48" height="5" rx="1" fill={`url(#goldGrad2-${size})`} opacity="0.85" />
    </svg>
  );
}
