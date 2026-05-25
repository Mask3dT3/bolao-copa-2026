"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import {
  Calendar, Trophy, BarChart3, Award, Settings, LogOut, User,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import CentralNotificacoes from "./CentralNotificacoes";

type Props = { nome: string; isAdmin: boolean; userId: string };

export default function Header({ nome, isAdmin, userId }: Props) {
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
    { href: "/estatisticas", label: "STATS", icon: BarChart3 },
    { href: "/regras", label: "REGRAS", icon: Award },
  ];

  if (isAdmin) {
    tabs.push({ href: "/admin", label: "ADMIN", icon: Settings });
  }

  return (
    <header className="sticky top-0 z-40 glass">
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <div className="flex justify-between items-center">
          <Link href="/jogos" className="group">
            <div className="title-stadium text-4xl leading-none">COPA 2026</div>
            <div className="font-display text-[11px] tracking-[6px] text-muted mt-1">
              BOLÃO DOS AMIGOS
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <CentralNotificacoes userId={userId} />
            <ThemeToggle />
            <Link
              href="/perfil"
              className="hidden sm:flex items-center gap-2 bg-[var(--gold)]/10 border border-[var(--gold)]/30 hover:border-[var(--gold)]/60 rounded-full px-3 py-1.5 text-sm font-medium transition"
              title="Editar perfil"
            >
              <User size={14} className="text-[var(--gold)]" />
              <span
                className="max-w-[120px] truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {nome}
              </span>
            </Link>
            <button
              onClick={sair}
              className="w-10 h-10 rounded-full border border-default hover:border-strong flex items-center justify-center"
              title="Sair"
            >
              <LogOut size={14} className="text-secondary" />
            </button>
          </div>
        </div>

        {/* Desktop tabs */}
        <nav className="hidden md:flex gap-1 mt-5 overflow-x-auto">
          {tabs.map(({ href, label, icon: Icon }) => {
            const ativa = path === href;
            const isAdminTab = href === "/admin";
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-3 font-display text-sm tracking-[2px] whitespace-nowrap border-b-2 transition ${
                  ativa
                    ? isAdminTab
                      ? "text-red-400 border-red-400"
                      : "text-[var(--gold)] border-[var(--gold)]"
                    : "text-muted border-transparent hover:text-secondary hover:border-default"
                }`}
              >
                <Icon size={16} /> {label}
              </Link>
            );
          })}
        </nav>

        <div className="md:hidden h-3" />
      </div>
    </header>
  );
}
