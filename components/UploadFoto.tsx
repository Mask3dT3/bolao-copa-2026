"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { useToast } from "./ToastProvider";
import Avatar from "./Avatar";
import { Upload, Trash2, Loader2 } from "lucide-react";

type Props = {
  userId: string;
  nome: string;
  fotoUrl: string | null;
};

export default function UploadFoto({ userId, nome, fotoUrl }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [fotoAtual, setFotoAtual] = useState(fotoUrl);

  async function subirFoto(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      toast("error", "Arquivo grande demais", "Máximo 2MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast("error", "Arquivo inválido", "Só imagens (jpg, png, webp, gif)");
      return;
    }

    setEnviando(true);
    const supabase = createClient();

    // Caminho: userId/avatar.ext (sempre sobrescreve o anterior do usuário)
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const caminho = `${userId}/avatar.${ext}`;

    // Remove fotos antigas do usuário (de outros formatos)
    const { data: listaAntiga } = await supabase.storage
      .from("avatars")
      .list(userId);
    if (listaAntiga && listaAntiga.length > 0) {
      const paraRemover = listaAntiga.map((f) => `${userId}/${f.name}`);
      await supabase.storage.from("avatars").remove(paraRemover);
    }

    // Upload nova
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(caminho, file, { upsert: true, cacheControl: "3600" });

    if (uploadError) {
      toast("error", "Erro ao subir", uploadError.message);
      setEnviando(false);
      return;
    }

    // Pega URL pública (com timestamp pra invalidar cache)
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(caminho);
    const urlPublica = `${urlData.publicUrl}?t=${Date.now()}`;

    // Salva no profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ foto_url: urlPublica })
      .eq("id", userId);

    if (updateError) {
      toast("error", "Erro ao salvar", updateError.message);
    } else {
      setFotoAtual(urlPublica);
      toast("success", "Foto atualizada!", "Aparece já em todo o app");
      router.refresh();
    }
    setEnviando(false);
  }

  async function removerFoto() {
    if (!confirm("Remover sua foto de perfil?")) return;
    setEnviando(true);
    const supabase = createClient();

    // Remove do storage
    const { data: lista } = await supabase.storage.from("avatars").list(userId);
    if (lista && lista.length > 0) {
      const paraRemover = lista.map((f) => `${userId}/${f.name}`);
      await supabase.storage.from("avatars").remove(paraRemover);
    }

    // Limpa do profile
    const { error } = await supabase
      .from("profiles")
      .update({ foto_url: null })
      .eq("id", userId);

    if (error) {
      toast("error", "Erro ao remover", error.message);
    } else {
      setFotoAtual(null);
      toast("success", "Foto removida");
      router.refresh();
    }
    setEnviando(false);
  }

  return (
    <div className="scorecard rounded-2xl p-5 stagger-item">
      <label className="font-display text-xs tracking-[3px] text-[var(--gold)] mb-3 block">
        FOTO DE PERFIL
      </label>

      <div className="flex items-center gap-4">
        <Avatar nome={nome} fotoUrl={fotoAtual} size={72} />

        <div className="flex flex-col gap-2 flex-1">
          <button
            onClick={() => inputRef.current?.click()}
            disabled={enviando}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[var(--gold)] hover:opacity-90 text-black font-display tracking-[2px] text-xs font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enviando ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Upload size={14} />
            )}
            {enviando ? "ENVIANDO..." : fotoAtual ? "TROCAR FOTO" : "ESCOLHER FOTO"}
          </button>

          {fotoAtual && (
            <button
              onClick={removerFoto}
              disabled={enviando}
              className="flex items-center justify-center gap-2 py-2 px-4 border border-red-400/40 hover:border-red-400 text-red-400 text-xs font-display tracking-[2px] rounded-lg disabled:opacity-50"
            >
              <Trash2 size={12} /> REMOVER
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) subirFoto(file);
        }}
      />

      <p className="text-xs text-muted mt-3">
        Max 2MB · JPG, PNG, WEBP ou GIF. Aparece no ranking, nos seus palpites e no header.
      </p>
    </div>
  );
}
