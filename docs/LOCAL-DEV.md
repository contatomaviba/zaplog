Zaplog — Guia de Desenvolvimento Local

Pré‑requisitos
- Node.js: 20.x recomendado (22.x também funciona na maioria dos casos)
- npm: instalado com o Node
- Banco: URL Postgres em `DATABASE_URL` (Neon ou Postgres local)

Passo a passo rápido
- Copie o arquivo `.env.example` para `.env` e ajuste valores:
  - `DATABASE_URL`: conexão Postgres (ex.: Neon) ou local
  - `JWT_SECRET`: chave segura para assinar tokens
  - `PORT`: porta do servidor (padrão 5000)
  - `CLIENT_ORIGIN` (opcional): origem adicional liberada no CORS
- Instale dependências: `npm ci`
- (Opcional) Crie o schema no banco: `npm run db:push`
- (Opcional) Gere um usuário de teste: `npm run seed`
- Rode em desenvolvimento: `npm run dev`

URLs locais
- App (Vite): http://localhost:5173
- API: http://localhost:5000
- Healthcheck: http://localhost:5000/api/ping
- Seed (dev): GET http://localhost:5000/api/debug/seed

Observações de ambiente
- CORS já permite `http://localhost:5173` e pode aceitar `CLIENT_ORIGIN` do `.env`.
- `drizzle-kit push` aplica o schema no banco apontado por `DATABASE_URL`. Use um banco de desenvolvimento.
- Caso o `db:push` falhe com Node 22.x, use Node 20.x (compatibilidade do CLI)

Postgres local com Docker (opcional)
- docker run --name zaplog-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=zaplog -p 5432:5432 -d postgres:16
- Em seguida ajuste `DATABASE_URL` em `.env` para:
  - `postgresql://postgres:postgres@localhost:5432/zaplog`

Atalhos úteis (Windows)
- Script PowerShell para carregar env e iniciar: `scripts/dev.ps1`
  - Carrega variáveis do `.env`
  - `-DbPush` aplica o schema no banco antes de subir
  - `-Clean` força `npm ci` antes de iniciar

Exemplos
- Apenas iniciar: `pwsh ./scripts/dev.ps1`
- Reinstalar deps e aplicar schema: `pwsh ./scripts/dev.ps1 -Clean -DbPush`
