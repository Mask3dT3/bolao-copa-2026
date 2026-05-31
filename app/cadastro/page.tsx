"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { Mail, Lock, User, Loader2, Check, X } from "lucide-react";
import LogoBolao from "@/components/LogoBolao";

function avaliarSenha(senha: string) {
  const tamanho = senha.length >= 8;
  const temNumero = /\d/.test(senha);
  const temLetra = /[a-zA-Z]/.test(senha);
  return { tamanho, temNumero, temLetra, valido: tamanho && temNumero && temLetra };
}

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  const validacao = avaliarSenha(senha);

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!validacao.valido) {
      setErro("Senha não atende aos requisitos.");
      return;
    }

    if (nome.trim().length < 2) {
      setErro("Nome muito curto.");
      return;
    }

    setCarregando(true);

    const supabase = createClient();

    // Cadastra e já entra direto (sem precisar confirmar email)
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome: nome.trim() } },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        setErro("Este email já está cadastrado. Faça login.");
      } else {
        setErro(error.message);
      }
      setCarregando(false);
      return;
    }

    // Tenta logar direto (funciona se confirmação de email estiver desativada no Supabase)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (signInError) {
      // Caso raro: aconteceria só se Supabase exigir confirmação
      setErro("Conta criada. Faça login pra começar.");
      setCarregando(false);
      setTimeout(() => router.push("/login"), 2000);
    } else {
      router.push("/jogos");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative">
      <div className="absolute top-10 left-10 w-40 h-40 bg-[var(--gold)]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-60 h-60 bg-green-400/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md scorecard rounded-2xl p-8 relative">
        <div className="mb-7">
          <LogoBolao tamanho="xl" />
          <div className="mt-6 text-center font-display text-2xl tracking-[4px] text-[var(--gold)]">
            CRIAR CONTA
          </div>
        </div>

        <form onSubmit={cadastrar} className="space-y-4">
          <div>
            <label className="font-display text-xs tracking-[3px] text-[var(--gold)] mb-2 flex items-center gap-1.5">
              <User size={12} /> NOME
            </label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={40}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-[var(--gold)]/20 rounded-lg outline-none focus:border-[var(--gold)]/60 transition"
              style={{ color: "var(--text-primary)" }}
              placeholder="Como aparece no ranking"
            />
          </div>

          <div>
            <label className="font-display text-xs tracking-[3px] text-[var(--gold)] mb-2 flex items-center gap-1.5">
              <Mail size={12} /> EMAIL
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-[var(--gold)]/20 rounded-lg outline-none focus:border-[var(--gold)]/60 transition"
              style={{ color: "var(--text-primary)" }}
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="font-display text-xs tracking-[3px] text-[var(--gold)] mb-2 flex items-center gap-1.5">
              <Lock size={12} /> SENHA
            </label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-[var(--gold)]/20 rounded-lg outline-none focus:border-[var(--gold)]/60 transition"
              style={{ color: "var(--text-primary)" }}
              placeholder="Mínimo 8 caracteres"
            />
            {senha && (
              <div className="mt-2 space-y-1 text-xs">
                <Requisito ok={validacao.tamanho} label="Mínimo 8 caracteres" />
                <Requisito ok={validacao.temLetra} label="Pelo menos uma letra" />
                <Requisito ok={validacao.temNumero} label="Pelo menos um número" />
              </div>
            )}
          </div>

          {erro && (
            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-3 py-2.5 rounded-lg">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando || !validacao.valido}
            className="w-full py-3.5 bg-[var(--gold)] hover:opacity-90 text-black font-display tracking-[3px] text-base font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 glow-gold"
          >
            {carregando ? (
              <>
                <Loader2 size={16} className="animate-spin" /> CRIANDO...
              </>
            ) : (
              "CRIAR CONTA"
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-secondary">
          Já tem conta?{" "}
          <Link href="/login" className="text-[var(--gold)] hover:underline font-medium">
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
}

function Requisito({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${ok ? "text-green-400" : "text-faint"}`}>
      {ok ? <Check size={11} /> : <X size={11} />} {label}
    </div>
  );
}
