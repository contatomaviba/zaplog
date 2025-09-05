Zaplog

Como rodar localmente
- Veja `docs/LOCAL-DEV.md` para o passo a passo (Node 20+, `.env`, db push e seed).

Scripts principais
- `npm run dev`: inicia API (Express) e web (Vite)
- `npm run build`: build de client e server em `dist/`
- `npm run start`: inicia server em produção a partir de `dist/`
- `npm run db:push`: aplica schema (Drizzle ORM)
- `npm run seed`: cria usuário demo no banco

Pastas
- `client/`: app React + Vite
- `server/`: API Express + Drizzle ORM
- `shared/`: tipos e schema (Zod/Drizzle) compartilhados
- `docs/`: documentação de projeto

