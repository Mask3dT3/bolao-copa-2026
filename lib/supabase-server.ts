import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options?: any };

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Impede o Next de cachear as respostas do Supabase (o fetch padrão cacheia).
      // Sem isto, listas como "N PALPITES" ficam congeladas numa leitura antiga.
      global: {
        fetch: (url: any, options: any = {}) =>
          fetch(url, { ...options, cache: "no-store" }),
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component pode chamar mas não tem permissão pra setar
          }
        },
      },
    }
  );
}
