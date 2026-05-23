"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Calendar, Trophy, Award, Settings, LogOut, User } from "lucide-react";

type Props = {
  nome: string;
  isAdmin: boolean;
};

export default function Header({ nome, isAdmin }: Props) {
  const path = usePathname();
  const router = useRouter();

  async function sair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const tabs = [
    { href: "/jogos", label: "JOGOS", icon: Calendar },
    { href: "/ranking", label: "RANKING", icon: Trophy },
    { href: "/regras", label: "REGRAS", icon: Award },
  ];

  if (isAdmin) {
    tabs.push({ href: "/admin", label: "ADMIN", icon: Settings });
  }

  return (
    <header className="sticky top-0 z-10 bg-black/40 border-b border-yellow-400/15 backdrop-blur-xl">
      <div className="max-w-3xl mx-auto px-4 pt-5">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-display text-3xl tracking-[4px] text-yellow-400 leading-none">
              COPA 2026
            </div>
            <div className="font-display text-xs tracking-[6px] text-white/60">
              BOLÃO DOS AMIGOS
            </div>
          </div>
          <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded px-3 py-1.5 text-sm font-semibold">
            <User size={14} />
            <span className="max-w-[100px] truncate">{nome}</span>
            <button onClick={sair} className="text-yellow-400 ml-1" title="Sair">
              <LogOut size={14} />
            </button>
          </div>
        </div>

        <nav className="flex gap-1 mt-4 overflow-x-auto">
          {tabs.map(({ href, label, icon: Icon }) => {
            const ativa = path === href;
            const isAdminTab = href === "/admin";
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3.5 py-3 font-display text-sm tracking-[2px] whitespace-nowrap border-b-2 transition ${
                  ativa
                    ? isAdminTab
                      ? "text-red-400 border-red-400"
                      : "text-yellow-400 border-yellow-400"
                    : "text-white/50 border-transparent hover:text-white/80"
                }`}
              >
                <Icon size={16} /> {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
