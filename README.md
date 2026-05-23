# 🏆 Bolão Copa 2026 — Setup 100% Nuvem

Plataforma de bolão da Copa do Mundo 2026. Login real, sincronização em nuvem, **resultados automáticos** via Football-Data.org, funciona como app no celular (PWA).

**⚡ Tudo feito pelo navegador.** Você não instala nada no seu computador. Não usa terminal. Não roda comandos. Só clica em botões em sites web.

**Stack:**
- **Frontend:** Next.js 14 (rodando no Vercel)
- **Backend + Banco + Login:** Supabase
- **Resultados:** Football-Data.org (Copa do Mundo grátis pra sempre)
- **Cron:** pg_cron do Supabase (a cada 1 minuto durante a Copa)

**Custo total: R$ 0**
**Tempo de setup:** ~45 minutos clicando em sites web

---

## 🔒 SOBRE PRIVACIDADE E SEGURANÇA

**Seu código fica PRIVADO.** O repositório no GitHub será marcado como privado (gratuito em conta pessoal), então:
- ✅ **Ninguém vê seu código** exceto você
- ✅ O Vercel acessa o repo via integração oficial (não precisa expor nada)
- ✅ Suas chaves (Football-Data token, Supabase service_role) ficam guardadas como **secrets** no Supabase e como **environment variables** no Vercel — nunca aparecem no código
- ✅ Apenas o **link público do site** é compartilhado com os amigos
- ✅ Os amigos não veem código, banco, chaves — só o app pronto

**Por que Vercel?** Recomendo Vercel sobre Netlify porque é da mesma empresa que criou o Next.js (framework que estamos usando), então a integração é nativa e mais rápida pra fazer deploy.

---

## 📋 RESUMO DO QUE VAMOS FAZER

| Passo | O quê | Onde | Tempo |
|-------|-------|------|-------|
| 1 | Criar contas | 4 sites diferentes | 5 min |
| 2 | Pegar token Football-Data | football-data.org | 2 min |
| 3 | Criar projeto Supabase + rodar SQL | supabase.com (web) | 10 min |
| 4 | Criar Edge Function (colando código) | supabase.com (web) | 5 min |
| 5 | Configurar secrets da Edge Function | supabase.com (web) | 2 min |
| 6 | Ativar cron automático (SQL) | supabase.com (web) | 3 min |
| 7 | Subir código pro GitHub | github.com (web) | 5 min |
| 8 | Deploy no Vercel | vercel.com (web) | 5 min |
| 9 | Te marcar como admin (SQL) | supabase.com (web) | 1 min |

**Nada do seu computador. Tudo no navegador.**

---

## ⚙️ PASSO 1 — Criar contas (5 min)

Você precisa de contas grátis em 4 sites. **Use o mesmo email em todos** pra facilitar:

1. **GitHub:** https://github.com/signup
2. **Vercel:** https://vercel.com/signup → escolha **"Continue with GitHub"**
3. **Supabase:** https://supabase.com/dashboard/sign-up → **"Continue with GitHub"**
4. **Football-Data.org:** https://www.football-data.org/client/register → email + senha simples

✅ Pronto, você já tem tudo que precisa.

---

## 🔑 PASSO 2 — Pegar token da Football-Data.org (2 min)

1. Faça login em https://www.football-data.org/client/login
2. Clique em **"Account"** (canto superior direito)
3. Você verá seu **API Token** (algo como `abc123def456...`)
4. **Copie e guarde** em um bloco de notas — vai precisar nos próximos passos

✅ Você não precisa cadastrar cartão. Token é grátis pra sempre.

---

## 🗄️ PASSO 3 — Criar projeto Supabase (10 min)

### 3.1. Criar projeto

1. Vá em https://supabase.com/dashboard
2. Clique em **"New Project"**
3. Preencha:
   - **Name:** `bolao-copa-2026`
   - **Database Password:** crie uma senha forte → **GUARDE EM ALGUM LUGAR**
   - **Region:** `South America (São Paulo)`
4. Clique em **"Create new project"** e aguarde ~2 minutos

### 3.2. Pegar as credenciais

1. Quando o projeto carregar, clique em **Project Settings** (engrenagem ⚙ no canto inferior esquerdo)
2. No menu, clique em **API**
3. Você vai ver 3 informações importantes. **Copie e guarde** em seu bloco de notas:

   | O que copiar | Onde está |
   |---|---|
   | **Project URL** | Tipo `https://abcxyz.supabase.co` |
   | **anon public** key | Primeira chave da seção "Project API keys" |
   | **service_role** key ⚠️ | Segunda chave, marcada como "Reveal" / "SECRET" |

   ⚠️ **NUNCA compartilhe a service_role**. É a chave master do banco.

### 3.3. Criar as tabelas (rodar SQL)

1. No menu lateral esquerdo, clique em **SQL Editor**
2. Clique em **"New query"**
3. Abra o arquivo `supabase/schema.sql` deste projeto (no seu computador, com Notepad/Bloco de notas mesmo)
4. **Selecione tudo (Ctrl+A) → Copia (Ctrl+C)**
5. Cole no SQL Editor do Supabase (Ctrl+V)
6. Clique no botão verde **"Run"** (canto inferior direito)
7. Deve aparecer **✅ "Success. No rows returned"**

✅ Banco criado com todas as tabelas: profiles, jogos, apostas, ranking.

---

## ⚡ PASSO 4 — Criar a Edge Function pelo navegador (5 min)

A Edge Function é o robô que vai buscar resultados da Football-Data automaticamente.

1. No menu lateral do Supabase, clique em **Edge Functions**
2. Clique no botão **"Deploy a new function"**
3. Selecione **"Via Editor"** (NÃO escolha templates)
4. Em **Function name**, digite: `atualiza-jogos` (exatamente assim, com hífen)
5. **Apague todo o código de exemplo** que aparece no editor
6. Abra o arquivo `supabase/EDGE-FUNCTION-CODE.ts` deste projeto (no Bloco de notas)
7. Role pra baixo até depois dos comentários e **copie todo o código TypeScript** (a partir de `import { createClient }...`)
8. **Cole** no editor web do Supabase
9. Clique em **"Deploy function"** (canto superior direito)
10. Espere ~30 segundos. Vai aparecer ✅ "Function deployed successfully"

✅ A função está rodando na nuvem do Supabase. Próximo passo: configurar as chaves dela.

---

## 🔐 PASSO 5 — Configurar secrets da Edge Function (2 min)

A função precisa saber qual seu token da Football-Data:

1. Ainda na página **Edge Functions** do Supabase
2. Clique na função **atualiza-jogos** (que você acabou de criar)
3. Clique na aba **"Secrets"** (ou "Manage" → "Secrets" dependendo da versão)
4. Clique em **"Add new secret"**
5. Preencha:
   - **Name:** `FOOTBALL_DATA_TOKEN`
   - **Value:** cole o token que você pegou no passo 2
6. Clique em **Save**

> Nota: as variáveis `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` o Supabase já adiciona automaticamente, você não precisa criar.

### Testar a função

1. Volte pra aba **"Details"** da função
2. Lá tem um botão de **teste** (ou "Invoke")
3. Clique em **Send Request** (com método `POST` e body vazio `{}`)
4. Deve retornar JSON com `inseridos: 104` ou número parecido

🎉 **Todos os 104 jogos da Copa foram importados automaticamente!**

> Se retornar `inseridos: 0`, é porque a Football-Data ainda não populou todos os fixtures. Tente de novo em alguns dias. A função tá funcionando, só não tem dados ainda.

---

## ⏰ PASSO 6 — Ativar o cron automático (3 min)

Agora vamos fazer o Supabase chamar essa função **automaticamente a cada minuto**.

1. No Supabase, volte em **SQL Editor** → **New query**
2. Abra o arquivo `supabase/02-setup-cron.sql` deste projeto
3. **ANTES de colar**, edite estas duas linhas no arquivo (use o Bloco de notas):
   - Linha com `v_url`: troque `SEU-PROJETO` pela sua URL do Supabase
     Exemplo: se sua URL é `https://abcxyz.supabase.co`, fica:
     ```
     v_url TEXT := 'https://abcxyz.supabase.co/functions/v1/atualiza-jogos';
     ```
   - Linha com `v_key`: cole sua **anon public key** (não a service_role!)
     ```
     v_key TEXT := 'eyJhbGc...sua-anon-key-aqui';
     ```
4. Copie o SQL editado e cole no SQL Editor
5. Clique em **Run**
6. Vai aparecer uma linha mostrando `jobname: atualiza-jogos-cron, active: true`

✅ Cron ativo. **A partir de agora, o sistema busca novos resultados a cada 1 minuto, automaticamente, pra sempre.**

### Verificar que está funcionando

Depois de 2-3 minutos, rode no SQL Editor:
```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
```

Deve mostrar execuções recentes com status `succeeded`.

---

## 🚀 PASSO 7 — Subir código pro GitHub (5 min)

> 🔒 **PRIVACIDADE GARANTIDA:** seu código vai num repositório **PRIVADO**.
> Ninguém além de você consegue ver. Vercel deploya repositórios privados normalmente no plano grátis.

### 7.1. Criar o repositório PRIVADO

1. Acesse https://github.com/new
2. Preencha:
   - **Repository name:** `bolao-copa-2026`
   - 🔒 **MARQUE A OPÇÃO "Private"** (essencial — sem isso o código fica público!)
   - **NÃO** marque "Add a README file" ou outras opções
3. Clique **"Create repository"**

✅ Repositório criado, completamente invisível pra qualquer pessoa exceto você.

### 7.2. Subir os arquivos pelo navegador (sem usar terminal!)

1. Na página do repositório recém-criado, clique em **"uploading an existing file"** (link no meio da página)
2. **Importante:** antes de subir, faça isso:
   - Descompacte o ZIP `bolao-copa-2026.zip` em uma pasta no seu computador
   - **Apague a pasta `supabase`** dentro dela (esses arquivos foram só pra você executar os passos anteriores, não precisam ir pro repositório)
3. Arraste **todos os arquivos restantes** (e subpastas) pra área de upload do GitHub
4. Aguarde subir (alguns segundos)
5. No campo **"Commit changes"**, escreva: `primeiro commit`
6. Clique no botão verde **"Commit changes"**

✅ Código no GitHub.

---

## 🌐 PASSO 8 — Deploy no Vercel (5 min)

1. Vá em https://vercel.com/new
2. Se for sua primeira vez, autorize o Vercel a acessar seu GitHub
3. Você verá uma lista dos seus repositórios. Clique em **"Import"** ao lado de `bolao-copa-2026`
4. Na tela de configuração, role pra baixo até **"Environment Variables"**
5. Adicione **DUAS** variáveis (clicando em "Add" pra cada):

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Sua URL do Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sua anon public key |

6. Clique no botão **"Deploy"** (azul, no final)
7. Aguarde ~2 minutos

✅ Vai aparecer **"Congratulations!"** e um link tipo `https://bolao-copa-2026.vercel.app`. **Esse é o link que você manda pros seus amigos!**

---

## 👑 PASSO 9 — Te marcar como admin (1 min)

1. Abra seu link do Vercel (`https://...vercel.app`)
2. Clique em **"Criar conta"**, cadastre-se com seu email e senha
3. Volte no Supabase → **SQL Editor** → **New query**
4. Cole isto, **trocando pelo seu email**:
   ```sql
   UPDATE profiles SET is_admin = true WHERE email = 'seuemail@exemplo.com';
   ```
5. Clique em **Run**
6. Volte ao site, recarregue (F5) — agora você vê a aba **"ADMIN"** em vermelho

---

## 📱 PASSO EXTRA — Instalar como app no celular

Cada amigo faz isso:

**Android (Chrome):**
- Abre o link no Chrome → Menu (⋮) → **"Instalar app"**

**iPhone (Safari):**
- Abre o link no Safari → Compartilhar (□↑) → **"Adicionar à Tela de Início"**

✅ Vira ícone como app nativo.

---

## 🎮 COMO OS AMIGOS USAM

1. Acessam seu link Vercel
2. Criar conta com email + senha
3. Veem a lista de 104 jogos da Copa (já importados automaticamente)
4. Antes do jogo começar: clica → escolhe placar → confirma
5. **Quando o jogo termina:** em até 1 minuto, o resultado aparece e os pontos são calculados sozinhos
6. **Ranking:** acumulado até a final

**Pontuação:**
- 🎯 Placar exato: **5 pontos**
- ✓ Acertou resultado (vencedor/empate): **3 pontos**

---

## ✅ O QUE FUNCIONA SOZINHO (você nunca precisa mexer)

- ✅ Importação dos jogos (Edge Function busca automaticamente)
- ✅ Atualização de resultados (cron a cada 1 minuto)
- ✅ Cálculo de pontos (trigger SQL no banco, instantâneo)
- ✅ Ranking ao vivo
- ✅ Fechamento de apostas no kickoff (regra de segurança no banco)
- ✅ Jogos do mata-mata aparecem sozinhos conforme times se classificam

---

## 🆘 PROBLEMAS COMUNS

**Vercel deu erro de build:**
→ Confirme que adicionou as 2 environment variables. Volte em Settings → Environment Variables.

**Login no app dá erro "Email not confirmed":**
→ Supabase → Authentication → Settings → desmarque **"Enable email confirmations"**

**A função retorna 0 jogos:**
→ A Football-Data demora alguns dias após sorteios pra publicar todos os fixtures. Aguarde e teste de novo. A função está funcionando, só está sem dados.

**Edge Function dá erro 401 ou "FOOTBALL_DATA_TOKEN não configurado":**
→ Volte no passo 5 e confira que adicionou o secret com nome **exatamente** `FOOTBALL_DATA_TOKEN` (caps lock incluído).

**Cron não está rodando:**
→ Rode no SQL Editor:
```sql
SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'atualiza-jogos-cron';
```
Se não aparecer nada, refaça o passo 6 (confira que substituiu os valores corretamente).

**Quero ver os logs da função:**
→ Supabase Dashboard → Edge Functions → atualiza-jogos → aba **"Logs"**

---

## 💰 LIMITES (você NÃO vai estourar nada)

- **Supabase free:** 500MB banco · 50k usuários ativos/mês · 500k invocations Edge Function/mês
  - Cron a cada minuto × 30 dias = 43k invocations → muito longe do limite
- **Vercel free:** 100GB tráfego/mês
- **Football-Data free:** 10 requests/minuto → cron usa 1/min
- **Custo: R$ 0/mês, pra sempre**

---

## 🔧 ARQUITETURA EM 1 PARÁGRAFO

A cada minuto, o **pg_cron do Supabase** dispara uma chamada HTTP pra **Edge Function** `atualiza-jogos` (rodando no Deno na infra do Supabase), que busca a competição "WC" na **Football-Data.org**, compara com os jogos do banco, insere os novos e atualiza os que mudaram. Quando um jogo é marcado como `finalizado=true`, um **trigger SQL** roda automaticamente e calcula os pontos de todas as apostas (5 placar exato, 3 só resultado). O frontend **Next.js no Vercel** consulta o banco via Supabase JS e renderiza pra cada usuário. As regras de quem pode apostar/quando estão como **Row Level Security** no banco, então o banco recusa qualquer tentativa de apostar após o kickoff. **Nada roda no seu computador. Tudo na nuvem.**

---

## 📝 LICENÇA

Use, modifique, compartilhe. É seu.
