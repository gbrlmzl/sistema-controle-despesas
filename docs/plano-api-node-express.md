# Plano: API Node.js + Express separada do Next.js

> Documento de planejamento. Nada foi implementado ainda. Objetivo duplo e explícito: (1)
> aprender Node.js "de verdade" com Express, sem a abstração do runtime do Next.js por baixo, e
> (2) ter uma API REST real para aplicar os cursos 3 e 4 do cronograma de testes (que assumem
> Express + Supertest).

## 1. Decisão de escopo — leia isto antes de começar

A ideia original ("remover as rotas de API do Next e criar um servidor Express com as mesmas
funcionalidades") admite duas leituras muito diferentes em tamanho, e a escolha entre elas muda
o resto deste plano (e é pré-requisito para a decisão do [documento de arquitetura de
frontend](decisao-arquitetura-frontend.md)):

| Escopo | O que migra | Tamanho |
| :---- | :---- | :---- |
| **A — Só os Route Handlers** | Os 4 endpoints hoje em `src/app/api/**` (notifications, residences, users/me, nextauth) | Pequeno (dias) |
| **B — Tudo que é servidor** | Os 4 Route Handlers **+** as 23 Server Actions de `src/app/(auth)/**` | Grande (semanas) |

**Por quê isso importa:** hoje, a maior parte da lógica de escrita do sistema não passa pelos 4
Route Handlers — passa pelas 23 Server Actions (`'use server'`), que são um mecanismo RPC do
próprio Next.js, não uma API REST. Se o escopo for só A, o Next.js continua sendo um framework
full-stack de verdade (as Server Actions continuam rodando no servidor Next.js), e a pergunta do
documento de arquitetura ("ainda compensa usar Next.js, ou um SPA mais leve resolve?") não tem uma
resposta honesta — Next.js ainda estaria fazendo trabalho de back-end de qualquer forma.

**Recomendação:** ir atrás do **Escopo B**, mas em fases incrementais (seção 6), migrando um
domínio por vez e trocando as chamadas de Server Action por `fetch()` no front-end conforme cada
domínio sai do Next.js. Isso dá o aprendizado completo de Node/Express, dá o "peso" de API real
que os cursos 3 e 4 esperam, e só então a pergunta de arquitetura do outro documento faz sentido
com evidência real na mão (você vai sentir, na prática, se o Next.js ainda está "pagando o
aluguel dele" uma vez que toda a busca de dados virar `fetch()`).

Se o tempo disponível for curto, o Escopo A ainda é um exercício válido — só não decida a
pergunta de arquitetura do outro documento com base nele; trate como "fase 1 de uma jornada maior
que pode parar aí por enquanto".

## 2. Inventário completo do que existe hoje

### 2.1 Route Handlers (`src/app/api/**`, 4 arquivos)

| Rota atual | Método | Endpoint REST proposto | Descrição |
| :---- | :---- | :---- | :---- |
| `api/auth/[...nextauth]` | GET/POST | *(substituído — ver seção 5)* | Handlers do NextAuth |
| `api/notifications` | GET | `GET /notifications?pagina=` | Lista notificações + não lidas |
| `api/notifications` | PATCH | `PATCH /notifications` | Marca como lida(s) |
| `api/residences` | GET | `GET /residences` | Lista residências + convites/solicitações do usuário |
| `api/users/me` | PATCH | `PATCH /users/me` | Troca o avatar |

### 2.2 Server Actions (`src/app/(auth)/**`, 23 arquivos) → endpoints REST propostos

**Auth / usuário**

| Action atual | Endpoint REST proposto |
| :---- | :---- |
| `loginAction` | `POST /auth/login` |
| `registerAction` | `POST /auth/register` |
| `changePasswordAction` | `PATCH /users/me/password` |
| `logoutAction` | `POST /auth/logout` |

**Residências (nível raiz)**

| Action atual | Endpoint REST proposto |
| :---- | :---- |
| `criarResidenciaAction` | `POST /residences` |
| `entrarResidenciaAction` | `POST /residences/join` |
| `cancelarSolicitacaoAction` | `DELETE /residences/join-requests/:id` |
| `responderConviteAction` | `POST /residences/invites/:id/respond` |

**Residências (dentro do contexto `[code]`)**

| Action atual | Endpoint REST proposto |
| :---- | :---- |
| *(painel)* | `GET /residences/:code` |
| `renomearResidenciaAction` | `PATCH /residences/:code` |
| `arquivarResidenciaAction` | `PATCH /residences/:code/archive` |
| `regenerarCodigoAction` | `POST /residences/:code/regenerate-code` |
| `sairDaResidenciaAction` | `POST /residences/:code/leave` |
| `removerMembroAction` | `DELETE /residences/:code/members/:userId` |
| `transferirPropriedadeAction` | `POST /residences/:code/members/:userId/transfer-ownership` |
| `responderSolicitacaoAction` | `POST /residences/:code/join-requests/:id/respond` |
| `cancelarConviteAction` | `DELETE /residences/:code/invites/:id` |
| `convidarUsuarioAction` | `POST /residences/:code/invites` |

**Despesas**

| Action atual | Endpoint REST proposto |
| :---- | :---- |
| *(consulta)* | `GET /residences/:code/expenses?mes=&ano=` |
| `cadastrarDespesaAction` | `POST /residences/:code/expenses` |
| `editarDespesaAction` | `PATCH /residences/:code/expenses/:expenseId` |
| `excluirDespesaAction` | `DELETE /residences/:code/expenses/:expenseId` |
| `fecharMesAction` | `POST /residences/:code/expenses/close-month` |
| `reabrirMesAction` | `POST /residences/:code/expenses/reopen-month` |
| *(recorrentes)* | `GET /residences/:code/expenses/recurring` |
| `pararRecorrenciaAction` | `PATCH /residences/:code/expenses/:expenseId/stop-recurrence` |

**Relatórios**

| Origem atual | Endpoint REST proposto |
| :---- | :---- |
| `src/lib/reports.ts` (consumido só pela página) | `GET /residences/:code/reports?mes=&ano=&aba=` |

## 3. O que é reaproveitável quase sem reescrever

Isto reduz bastante o trabalho real de escopo B, e vale citar explicitamente porque muda a
estimativa de tempo:

- **`src/lib/*.ts`** (residence, expenses, access, notifications, reports, user, username,
  avatars): já são funções puras que só importam o Prisma Client (`src/lib/prisma.ts`) e tipos do
  `src/generated/client`. Nenhuma delas importa nada do Next.js. Isso significa que a lógica de
  negócio inteira pode ser **copiada praticamente como está** para o projeto Express — o trabalho
  é escrever a camada de rotas/controllers em volta dela, não reescrever as regras.
- **`src/schemas/*.ts`** (despesas, residencias, usuarios): schemas Zod, também framework-agnostic.
  Reaproveitáveis 1:1.
- **`prisma/schema.prisma`**: o schema do banco não muda. O novo projeto Express só precisa do
  seu próprio `npx prisma generate` apontando pro mesmo banco (ou uma cópia dele em dev).
- **O que NÃO é reaproveitável direto**: qualquer coisa em `src/auth.ts`/`src/auth.config.ts`
  (é config do NextAuth, amarrada ao Next.js) e os componentes React (é lógica de apresentação,
  fica no front-end de qualquer forma).

## 4. Arquitetura proposta do servidor Express

Estrutura de pastas sugerida (camadas: rota → controller → serviço, com o "serviço" sendo em boa
parte o `src/lib/*.ts` já existente, só migrado):

```
server/
├── src/
│   ├── config/
│   │   ├── env.ts            # validação de env vars (zod, mesmo padrão já usado no projeto)
│   │   └── prisma.ts         # Prisma Client singleton (igual src/lib/prisma.ts atual)
│   ├── middlewares/
│   │   ├── auth.ts           # valida JWT, popula req.user
│   │   ├── errorHandler.ts   # middleware de erro central (última posição da chain)
│   │   └── validate.ts       # valida body/query com Zod antes do controller
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.service.ts     # login, register, JWT, Google OAuth
│   │   ├── residences/
│   │   │   ├── residences.routes.ts
│   │   │   ├── residences.controller.ts
│   │   │   └── residences.service.ts   # praticamente o lib/residence.ts + lib/access.ts atuais
│   │   ├── expenses/            # idem, a partir de lib/expenses.ts
│   │   ├── reports/             # idem, a partir de lib/reports.ts
│   │   ├── notifications/       # idem, a partir de lib/notifications.ts
│   │   └── users/                # avatar, troca de senha
│   ├── schemas/                  # cópia de src/schemas/*.ts do projeto Next
│   ├── app.ts                    # monta o Express, middlewares globais, rotas
│   └── server.ts                 # só sobe o servidor (app.listen)
├── tests/
│   ├── unit/                     # curso 3
│   └── integration/              # curso 4 (Supertest)
├── prisma/                       # schema.prisma (ou apontar pro mesmo do projeto Next, ver nota)
├── .env
└── package.json
```

**Nota sobre o Prisma schema:** enquanto os dois projetos (Next.js e Express) apontarem pro mesmo
banco PostgreSQL, dá pra manter um único `schema.prisma` (ex.: no repo do Express, que vira a
"fonte de verdade" do banco) e o Next.js deixa de rodar `prisma generate`/migrações — só consome
dados através da API. Isso é consistente com o Escopo B da seção 1 (Next.js deixa de tocar o
banco diretamente).

## 5. Autenticação — a parte de maior risco

O NextAuth (`src/auth.ts`/`auth.config.ts`) é acoplado ao Next.js. Duas opções reais:

**Opção A — reaproveitar via `@auth/express`.** O Auth.js (mesmo projeto por trás do NextAuth) tem
um pacote oficial para Express (`npm install @auth/express`, middleware `ExpressAuth`). Reduz
bastante o retrabalho — o `Provider` do Google, a config de sessão JWT, tudo migra quase igual.
**Risco:** menos aprendizado "de verdade" sobre auth em Node puro, que é justamente parte do
objetivo desta fase.

**Opção B — JWT + Passport.js na mão (recomendado para o objetivo de aprendizado).**
- Login com credenciais: reaproveita a comparação com `bcrypt` (já usada no projeto atual) +
  emite um JWT assinado (`jsonwebtoken`) guardado em cookie `httpOnly`.
- Login com Google: `passport-google-oauth20` implementa o fluxo OAuth2 (authorization code) —
  mesmo fluxo conceitual que o `GoogleProvider` do NextAuth já usa hoje, só que explícito em vez
  de abstraído.
- Middleware de rota protegida: substitui o `src/proxy.ts` atual — decodifica o JWT do cookie/
  header `Authorization`, popula `req.user`, retorna 401 se inválido/ausente.
- **Ponto de atenção real:** as permissões por papel (owner vs. membro comum) já existem hoje
  como checagens dentro das funções de `lib/residence.ts` (ex.: `contexto.isOwner`) — isso não
  muda, é regra de negócio, não de autenticação. Só o "quem é o usuário logado" muda de mecanismo.

**Recomendação:** Opção B para as rotas de credenciais/sessão (é o cerne do aprendizado e dos
cursos de JWT recomendados na seção 8) — considerar Opção A só se o tempo apertar e a prioridade
virar "ter a API funcionando" em vez de "aprender auth em Node".

## 6. Fases de implementação (incrementais, escopo B)

Cada fase termina com o domínio migrado rodando e testado (mesmo critério de "fase pronta" usado
na migração TypeScript: sem quebrar o que já funciona).

1. **Setup** — scaffold do projeto Express + TypeScript, Prisma Client, middleware de erro, rota
   de health-check (`GET /health`). Nenhuma regra de negócio ainda.
2. **Auth** — login, registro, Google OAuth, middleware de sessão. Testável isoladamente via
   Postman/Insomnia antes de tocar no front-end.
3. **Residências** — os 9 endpoints de residência + membros + pendências.
4. **Despesas + relatórios** — os 8 endpoints de despesas + o endpoint de relatórios (o mais
   complexo, agrega várias funções de `lib/reports.ts`).
5. **Notificações + usuário** — os 2 route handlers restantes.
6. **Integração no front-end** — troca das 23 chamadas de Server Action por `fetch()` (ver seção
   7), domínio por domínio, na mesma ordem das fases 2-5. Cada domínio migrado no front-end é uma
   oportunidade de confirmar que a API se comporta igual ao que ela substituiu.
7. **Testes** — aplicar os cursos 3 e 4: testes unitários dos `services/` (equivalente ao
   `lib/*.ts` atual) e testes de integração das rotas com Supertest.

## 7. O que muda no front-end Next.js

Isso é trabalho real, não trivial — vale nomear antes de começar:

- Todo `useActionState(algumaAction, ...)` + `<Form action={formAction}>` precisa virar um
  `fetch()` manual com estado de loading/erro próprio (ou introduzir uma lib de data-fetching
  client-side, ex. SWR/TanStack Query — o projeto hoje não usa nenhuma).
- `revalidatePath(...)` (usado em quase toda action para atualizar a UI após escrever) deixa de
  existir — o equivalente client-side é revalidar/refazer o fetch depois da mutação
  (`router.refresh()` já é usado em vários lugares hoje e continua funcionando se a página que
  busca dados também migrar para `fetch()` do lado do cliente, ou vira um `mutate()` de SWR/Query).
- Páginas que hoje são Server Components lendo o Prisma direto (ex.:
  `residences/[code]/page.tsx`) passam a fazer `fetch()` para a API Express — isso pode continuar
  sendo feito **no servidor** (dentro do próprio Server Component, com `fetch()` normal) sem virar
  Client Component. Ou seja: a migração da fonte de dados (Prisma → API HTTP) não obriga abrir mão
  do SSR do Next.js — essa é justamente a pergunta central do
  [documento de arquitetura de frontend](decisao-arquitetura-frontend.md).
- Sessão: o cookie de sessão precisa ser lido pelo Next.js (para saber se renderiza a página
  autenticada) e enviado/validado pela API Express. Se os dois rodarem em domínios diferentes em
  produção, isso implica configurar CORS com `credentials: true` e `SameSite` do cookie com
  cuidado.

## 8. Riscos e mitigação

| Risco | Mitigação |
| :---- | :---- |
| Auth reimplementada do zero introduz falha de segurança (ex.: JWT sem expiração, cookie sem `httpOnly`) | Seguir literalmente os cursos de JWT recomendados (seção 9) antes de escrever a versão final; revisar com checklist de segurança básica (expiração, `httpOnly`, `SameSite`, secret fora do código) |
| Escopo B parece grande demais e trava o projeto no meio | Seguir as fases da seção 6 estritamente — cada fase entrega algo testável; dá pra pausar em qualquer fase com o sistema ainda funcional (ex.: parar após a fase 3 e continuar depois) |
| Regressão de comportamento (endpoint novo não faz exatamente o que a Server Action fazia) | Os `lib/*.ts` sendo reaproveitados quase 1:1 (seção 3) reduz muito esse risco — a lógica não é reescrita, só a camada de transporte |
| CORS/cookies entre domínios em produção | Resolver isso cedo, na fase 1 (setup), com um teste manual simples de login cross-origin, antes de migrar os 23 domínios de negócio |

## 9. Cursos recomendados na Alura

Considerando que você já entende REST (Spring Boot) e já tem noção de JS/TS — o foco aqui é
**o runtime do Node.js e o ecossistema Express**, não fundamentos de API REST.

**1. Modelo mental do Node.js (o maior salto vindo de Java/Spring)**
- [JavaScript: entendendo promises e async/await](https://www.alura.com.br/curso-online-javascript-entendendo-promises-async-await)
  — Event Loop, Call Stack, Task Queue. Vindo de JVM (multi-thread), esse é o conceito que mais
  vale entender antes de escrever Express de verdade.

**2. Express — fundamentos e primeira API**
- [Node.js: continue seu projeto full stack criando uma API com Express](https://www.alura.com.br/curso-online-node-primeira-api-express)
  — roteamento, middlewares, primeira API do zero.
- [Formação em APIs com Node.js e Express](https://www.alura.com.br/formacao-node-js-express)
  — trilha mais completa: protocolo HTTP, validação de dados, tratamento de erros, busca/filtros,
  paginação. Recomendado como espinha dorsal, em vez de cursos avulsos equivalentes.

> Nota: alguns cursos de Express da Alura usam MongoDB ou MySQL como banco (ex.: o curso
> "Node.js: criando uma API Rest com Express e MongoDB"). Não é necessário fazê-los por causa do
> banco — o projeto já usa Prisma + PostgreSQL, e o Prisma Client funciona de forma idêntica fora
> do Next.js. Aproveite esses cursos só pela parte de Express/roteamento/middleware e ignore a
> parte específica de ORM/banco deles.

**3. Autenticação (a Opção B da seção 5)**
- [Node.js: criptografia e tokens JWT](https://www.alura.com.br/curso-online-node-jwt-autenticacao-tokens)
  — geração/validação de JWT (o `bcrypt` para hash de senha você já usa no projeto atual).
- [Node.js: criando API Rest com autenticação, perfis de usuários e permissões](https://www.alura.com.br/curso-online-node-js-api-rest-autenticacao-perfis-usuarios-permissoes)
  — middleware de autenticação, perfis e permissões nas rotas (mapeia direto pro seu conceito
  atual de owner vs. membro).
- Os dois acima também existem empacotados como
  [Formação Autenticação, testes e segurança em Node.js](https://www.alura.com.br/formacao-avancando-nodejs)
  (20h) — mais barato/coerente que fazer os dois separados se comprar por formação.

**4. Testes (já estava no seu cronograma original — cursos 3 e 4)**
- Node.js: testes unitários e de integração
- Node.js: implementando testes em uma API Rest

*(mantidos como já estavam no seu documento original — fazem sentido exatamente depois da API
estar de pé, nas fases 6-7 deste plano)*

## 10. Estimativa de tempo

Estimativa em dias de trabalho focado — o calendário real depende de quantas horas/semana você
consegue dedicar (a base de comparação é o ritmo que você levou pra fazer a migração TypeScript
completa, que foi rápido por ser um trabalho mecânico; isto aqui tem mais superfície nova).

| Etapa | Estimativa |
| :---- | :---- |
| Cursos (seção 9, ritmo part-time) | 2-3 semanas corridas |
| Fase 1 — Setup | 1-2 dias |
| Fase 2 — Auth | 3-5 dias (a mais arriscada) |
| Fase 3 — Residências | 2-3 dias |
| Fase 4 — Despesas + relatórios | 3-4 dias |
| Fase 5 — Notificações/usuário | 1 dia |
| Fase 6 — Integração no front-end | 4-6 dias (toca quase todo componente client do app) |
| Fase 7 — Testes (cursos 3-4 aplicados) | 3-5 dias |
| **Total de implementação (fases 1-7)** | **~3-4 semanas de trabalho focado**, em paralelo ou depois dos cursos |

## 11. Critério de "pronto"

1. `npm test` (unitário + integração) passa para todos os módulos migrados.
2. Cada domínio migrado tem paridade funcional confirmada manualmente contra o comportamento
   atual (mesmo roteiro de verificação já usado nas migrações anteriores do projeto: testar no
   navegador antes/depois).
3. O front-end Next.js não faz mais nenhuma chamada direta ao Prisma para os domínios já
   migrados — só `fetch()` para a API Express.
4. `src/deprecated/` continua fora de escopo (decisão já pendente, não relacionada a este plano).
