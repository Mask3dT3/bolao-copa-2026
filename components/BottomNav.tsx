"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Trophy, BarChart3, Award, User } from "lucide-react";

type Props = { isAdmin: boolean };

export default function BottomNav({ isAdmin }: Props) {
  const path = usePathname();

  const tabs = [
    { href: "/jogos", label: "Jogos", icon: Calendar },
    { href: "/ranking", label: "Ranking", icon: Trophy },
    { href: "/estatisticas", label: "Stats", icon: BarChart3 },
    { href: "/regras", label: "Regras", icon: Award },
    { href: "/perfil", label: "Perfil", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden glass">
      <div className="flex justify-around items-center px-2 py-2" style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}>
        {tabs.map(({ href, label, icon: Icon }) => {
          const ativa = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg min-w-[56px] transition ${
                ativa ? "text-[var(--gold)]" : "text-muted"
              }`}
            >
              <Icon size={20} strokeWidth={ativa ? 2.5 : 2} />
              <span className={`text-[10px] font-display tracking-wider ${ativa ? "font-bold" : ""}`}>
                {label.toUpperCase()}
              </span>
              {ativa && (
                <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
