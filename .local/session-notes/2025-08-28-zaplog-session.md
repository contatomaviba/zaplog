Zaplog — Sessão de Trabalho (2025-08-28)

Resumo
- Objetivo: corrigir 404 nas rotas da API no Vercel e estabilizar o deploy.
- Resultado: rotas `/api/*` roteadas para um único handler Express; deploy preview e produção publicados; alias de produção atualizado.

Mudanças no repositório
- vercel.json: reescrita de `"/api/(.*)"` → `"/api/index.js"` para que o Express receba todas as subrotas (`/api/auth/*`, `/api/trips/*`, etc.).
- Removido `api/ping.js` (duplicava o endpoint `/api/ping` já servido pelo Express em `server/routes.ts`).
- Commit: 38331be — fix(api): route all /api to Express index handler and remove duplicate ping; verified with local vercel build

Build e artefatos locais
- `npx vercel build` e `npx vercel build --prod` concluídos com sucesso.
- Gerado: `.vercel/output/functions/api/index.js.func` (handler único via `api/index.js`).
- Estático: `.vercel/output/static` com `index.html` e `assets/` do Vite.
- `.vercel/output/config.json` contém a rota `^/api/(.*)$ → /api/index.js`.

Deploys
- Preview: https://zaplog-nt8y9bt9o-mavibas-projects.vercel.app
- Produção: https://zaplog-j0p3ukldg-mavibas-projects.vercel.app
- Alias: `zaplog-five.vercel.app` → produção (aponta para `zaplog-j0p3ukldg-mavibas-projects.vercel.app`).

Observações importantes
- 401 em scripts/CLI: O projeto está com Deployment Protection. Em navegador (logado no Vercel) as rotas funcionam; via CLI retornará 401 sem bypass.
- Para automação, usar bypass token (Project Settings → Deployment Protection → Protection Bypass for Automation) ou desativar proteção em produção.
- Variáveis de ambiente sensíveis: atualmente em `vercel.json`. Recomenda-se migrar para “Project Settings → Environment Variables” no Vercel e removê-las do arquivo.

Próximos passos sugeridos
1) Decidir política de proteção: manter proteção em Preview e desativar em Produção (recomendado).
2) Migrar `DATABASE_URL` e `JWT_SECRET` para o Vercel (Project Settings) e limpar do `vercel.json`.
3) Testar manualmente no navegador: `/api/ping`, `/api/debug/env`, `/api/auth/*`.
4) Se necessário, configurar domínio custom e HTTPS (Vercel Domains) e apontar alias.

Arquivos relevantes
- vercel.json — configuração de builds/rotas.
- api/index.js — wrapper `serverless-http` do Express.
- server/index.ts, server/routes.ts — aplicação e rotas Express.

Notas finais
- Objetivo principal (eliminar 404 na API) atendido ao consolidar o roteamento para `api/index.js`.
