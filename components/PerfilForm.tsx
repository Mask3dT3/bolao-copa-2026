"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { useToast } from "./ToastProvider";
import { User, Mail, Save, Lock, Loader2 } from "lucide-react";

type Props = {
  userId: string;
  nomeInicial: string;
  email: string;
};

export default function PerfilForm({ userId, nomeInicial, email }: Props) {
  const [nome, setNome] = useState(nomeInicial);
  const [salvando, setSalvando] = useState(false);
  const [trocandoSenha, setTrocandoSenha] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  async function salvarNome(e: React.FormEvent) {
    e.preventDefault();
    if (nome.trim().length < 2) {
      toast("error", "Nome muito curto", "Use no mínimo 2 caracteres");
      return;
    }
    setSalvando(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ nome: nome.trim() })
      .eq("id", userId);

    if (error) {
      toast("error", "Não consegui salvar", error.message);
    } else {
      toast("success", "Nome atualizado", "Aparece já no ranking!");
      router.refresh();
    }
    setSalvando(false);
  }

  async function trocarSenha(e: React.FormEvent) {
    e.preventDefault();
    if (novaSenha.length < 8) {
      toast("error", "Senha curta", "Mínimo 8 caracteres");
      return;
    }
    if (!/\d/.test(novaSenha) || !/[a-zA-Z]/.test(novaSenha)) {
      toast("error", "Senha fraca", "Precisa de letra e número");
      return;
    }
    if (novaSenha !== confirmaSenha) {
      toast("error", "Senhas diferentes", "Confirma a senha de novo");
      return;
    }
    setTrocandoSenha(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: novaSenha });

    if (error) {
      toast("error", "Não consegui trocar", error.message);
    } else {
      toast("success", "Senha atualizada", "Use a nova senha no próximo login");
      setNovaSenha("");
      setConfirmaSenha("");
    }
    setTrocandoSenha(false);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={salvarNome} className="scorecard rounded-2xl p-5 space-y-4 stagger-item">
        <div>
          <label className="font-display text-xs tracking-[3px] text-[var(--gold)] flex items-center gap-2 mb-2">
            <User size={12} /> NOME DE EXIBIÇÃO
          </label>
          <input
            type="text"
            required
            minLength={2}
            maxLength={40}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-4 py-3 rounded-lg outline-none focus:border-[var(--gold)]/60 transition border"
            placeholder="Como aparece no ranking"
          />
          <div className="text-xs text-muted mt-2">
            É esse nome que seus amigos veem no ranking e nas apostas. Pode mudar quando quiser.
          </div>
        </div>

        <button
          type="submit"
          disabled={salvando || nome.trim() === nomeInicial}
          className="w-full py-3 bg-[var(--gold)] hover:opacity-90 text-black font-display tracking-[3px] text-sm font-bold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {salvando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {salvando ? "SALVANDO..." : "SALVAR NOME"}
        </button>
      </form>

      <div className="scorecard rounded-2xl p-5 stagger-item">
        <label className="font-display text-xs tracking-[3px] text-[var(--gold)] flex items-center gap-2 mb-2">
          <Mail size={12} /> EMAIL DA CONTA
        </label>
        <div className="px-4 py-3 rounded-lg border border-default bg-[var(--bg-input)] text-secondary text-sm">
          {email}
        </div>
        <div className="text-xs text-muted mt-2">
          Email não pode ser alterado. Ele só é usado pra login — nunca aparece pros outros.
        </div>
      </div>

      <form onSubmit={trocarSenha} className="scorecard rounded-2xl p-5 space-y-3 stagger-item">
        <div>
          <label className="font-display text-xs tracking-[3px] text-[var(--gold)] flex items-center gap-2 mb-2">
            <Lock size={12} /> TROCAR SENHA
          </label>
          <input
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            className="w-full px-4 py-3 rounded-lg outline-none focus:border-[var(--gold)]/60 transition border mb-2"
            placeholder="Nova senha (mín 8 chars, letra + número)"
            autoComplete="new-password"
          />
          <input
            type="password"
            value={confirmaSenha}
            onChange={(e) => setConfirmaSenha(e.target.value)}
            className="w-full px-4 py-3 rounded-lg outline-none focus:border-[var(--gold)]/60 transition border"
            placeholder="Confirma a nova senha"
            autoComplete="new-password"
          />
        </div>
        <button
          type="submit"
          disabled={trocandoSenha || !novaSenha}
          className="w-full py-3 border border-[var(--gold)]/40 hover:border-[var(--gold)] text-[var(--gold)] font-display tracking-[3px] text-sm font-bold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {trocandoSenha ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
          {trocandoSenha ? "ATUALIZANDO..." : "TROCAR SENHA"}
        </button>
      </form>
    </div>
  );
}
