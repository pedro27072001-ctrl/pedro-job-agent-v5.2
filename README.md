# Pedro Job Agent V5 — Supabase + Vercel + IA

Versão cloud-first para Android: você edita pelo Acode/GitHub e usa o painel pelo navegador. Não precisa de Termux, Python ou servidor local.

## Arquitetura
- Frontend: HTML/CSS/JS mobile-first em `web/index.html`.
- Banco + autenticação: Supabase (Postgres + Auth + RLS).
- Backend: Vercel Functions em `api/`.
- IA: OpenAI Responses API, chamada somente pelo backend da Vercel.
- Importação de vaga: endpoint restrito a alguns domínios públicos; se falhar, cole a descrição manualmente.

## Segurança
- A chave OpenAI NUNCA vai no HTML/GitHub. Ela fica somente em Environment Variables da Vercel.
- A chave pública do Supabase pode ficar no frontend; o banco usa RLS para restringir os registros ao usuário autenticado.
- Não envie `.env` para o GitHub.
- O agente não faz login em LinkedIn/Indeed, não contorna CAPTCHA e não envia candidatura sem aprovação humana.

## Configuração pelo celular

### 1. Supabase
1. Abra o Supabase e crie um projeto.
2. Vá em SQL Editor.
3. Cole todo o conteúdo de `supabase/schema.sql` e execute.
4. Vá em Project Settings / API e copie a URL do projeto e a Publishable/anon key.
5. Em Authentication, configure o Site URL depois que tiver a URL da Vercel. Para confirmação por e-mail, mantenha o fluxo de confirmação habilitado; para testes, pode desabilitar a confirmação.

### 2. GitHub
1. Crie um repositório vazio chamado `pedro-job-agent-v5`.
2. Extraia este ZIP.
3. No Acode, abra a pasta.
4. Edite `web/index.html`.
5. Troque `COLE_AQUI_SUA_SUPABASE_URL` pela URL do Supabase.
6. Troque `COLE_AQUI_SUA_SUPABASE_PUBLISHABLE_KEY` pela chave pública do Supabase.
7. Salve e envie a pasta ao GitHub. Não envie chaves secretas da OpenAI.

### 3. Vercel
1. Entre na Vercel e importe o repositório GitHub.
2. Não precisa configurar build command.
3. Em Settings → Environment Variables, crie:
   - `OPENAI_API_KEY` = sua chave da OpenAI
   - `OPENAI_MODEL` = `gpt-5` (ou outro modelo disponível na sua conta)
4. Salve e faça Redeploy.
5. Abra a URL gerada pela Vercel.

### 4. Voltar ao Supabase
Depois de receber a URL da Vercel, em Authentication → URL Configuration, coloque essa URL como Site URL e adicione-a aos Redirect URLs, se necessário.

### 5. Primeiro uso
1. Crie sua conta no painel.
2. Abra Meu perfil e confira o JSON.
3. Vá em Nova vaga.
4. Cole a URL ou a descrição da vaga.
5. Salve + analise.
6. Revise score, gaps, red flags e requisitos não comprovados.
7. Se quiser seguir, altere para APROVADA.
8. A candidatura final deve ser enviada por você no site da empresa/ATS.

## Se a importação de URL falhar
Isso é normal em páginas que exigem login, bloqueiam bots ou renderizam o conteúdo somente no navegador. Cole a descrição completa da vaga no campo de descrição. O restante do fluxo funciona normalmente.

## Teste rápido
Depois do deploy, abra `https://SEU-DOMINIO.vercel.app/api/health`. Deve retornar JSON com `ok: true`.

## Limites desta V5
- Não envia candidatura automaticamente.
- Não usa credenciais de terceiros.
- Não tenta contornar CAPTCHA, bloqueios ou controles de acesso.
- O objetivo é automatizar triagem, análise ATS, preparação de materiais e organização do histórico.
- 
