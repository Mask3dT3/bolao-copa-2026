"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { Trophy } from "lucide-react";

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
      setErro("Email ou senha incorretos");
      setCarregando(false);
    } else {
      router.push("/jogos");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-white/[0.04] border border-yellow-400/20 rounded p-8 backdrop-blur-xl">
        <div className="text-center mb-8">
          <Trophy size={56} className="text-yellow-400 mx-auto" />
          <div className="font-display text-5xl tracking-[6px] text-yellow-400 mt-3 leading-none">
            COPA 2026
          </div>
          <div className="font-display text-sm tracking-[6px] text-white/60 mt-1">
            BOLÃO DOS AMIGOS
          </div>
        </div>

        <form onSubmit={entrar} className="space-y-3">
          <div>
            <label className="font-display text-xs tracking-[3px] text-yellow-400 block mb-2">
              EMAIL
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-yellow-400/20 rounded text-white outline-none focus:border-yellow-400/60"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="font-display text-xs tracking-[3px] text-yellow-400 block mb-2">
              SENHA
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-yellow-400/20 rounded text-white outline-none focus:border-yellow-400/60"
              placeholder="••••••"
            />
          </div>

          {erro && (
            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-3 py-2 rounded">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full py-3 bg-yellow-400 text-black font-display tracking-[3px] text-base font-bold rounded hover:bg-yellow-300 transition disabled:opacity-50"
          >
            {carregando ? "ENTRANDO..." : "ENTRAR"}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-white/60">
          Não tem conta?{" "}
          <Link href="/cadastro" className="text-yellow-400 hover:underline">
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
}
