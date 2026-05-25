"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { Trophy, Mail, Lock, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setErro("Confirme seu email antes de entrar. Cheque sua caixa de entrada.");
      } else if (error.message.includes("Invalid login")) {
        setErro("Email ou senha incorretos.");
      } else {
        setErro(error.message);
      }
      setCarregando(false);
    } else {
      router.push("/jogos");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative">
      {/* Decoração de fundo */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-60 h-60 bg-green-400/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md scorecard rounded-2xl p-8 relative">
        <div className="text-center mb-8">
          <div className="inline-block relative">
            <Trophy size={64} className="text-yellow-400 mx-auto drop-shadow-[0_0_24px_rgba(255,215,0,0.4)]" />
          </div>
          <div className="font-display text-5xl tracking-[6px] text-yellow-400 mt-4 leading-none">
            COPA 2026
          </div>
          <div className="font-display text-sm tracking-[6px] text-secondary mt-1">
            BOLÃO DOS AMIGOS
          </div>
        </div>

        <form onSubmit={entrar} className="space-y-4">
          <div>
            <label className="font-display text-xs tracking-[3px] text-yellow-400 block mb-2 flex items-center gap-1.5">
              <Mail size={12} /> EMAIL
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-yellow-400/20 rounded-lg text-white outline-none focus:border-yellow-400/60 transition"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="font-display text-xs tracking-[3px] text-yellow-400 block mb-2 flex items-center gap-1.5">
              <Lock size={12} /> SENHA
            </label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-yellow-400/20 rounded-lg text-white outline-none focus:border-yellow-400/60 transition"
              placeholder="••••••"
            />
          </div>

          {erro && (
            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-3 py-2.5 rounded-lg">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-black font-display tracking-[3px] text-base font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 glow-gold"
          >
            {carregando ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                ENTRANDO...
              </>
            ) : (
              "ENTRAR"
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-secondary">
          Não tem conta?{" "}
          <Link href="/cadastro" className="text-yellow-400 hover:underline font-medium">
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
}
