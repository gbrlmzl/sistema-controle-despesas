# 🕓 CRONOS — Sistema de Controle de Despesas

> _"O amigo que te ajuda a controlar suas despesas!"_

Aplicação web para **divisão de despesas mensais entre um grupo de pessoas**. O usuário cadastra as pessoas, lança as despesas de cada uma em um determinado mês/ano, e o sistema calcula automaticamente quem **paga** e quem **recebe** para que todos fiquem quites — no melhor estilo "rachar a conta".

---

## 📑 Índice

- [Funcionalidades](#-funcionalidades)
- [Stack & Tecnologias](#-stack--tecnologias)
- [Arquitetura](#-arquitetura)
- [Modelo de Dados](#-modelo-de-dados)
- [API REST](#-api-rest)
- [Autenticação](#-autenticação)
- [Frontend: páginas, componentes e hooks](#-frontend-páginas-componentes-e-hooks)
- [Convenções de código](#-convenções-de-código)
- [Como rodar](#-como-rodar)
- [Variáveis de ambiente](#-variáveis-de-ambiente)

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| **Autenticação** | Login por credenciais (email + senha com hash bcrypt) ou via **Google OAuth**. Cadastro de novo usuário. |
| **Cadastro de pessoas** | Registra de 2 a 9 pessoas (nome + email) vinculadas ao usuário autenticado. |
| **Cadastro de despesas** | Lança as despesas de cada pessoa para um mês/ano específico. Detecta se o mês já tem lançamentos e permite sobrescrever. |
| **Consulta de despesas** | Visualiza os lançamentos de um mês, com detalhamento por pessoa e navegação entre meses. |
| **Resumo de despesas** | Cálculo do rateio: total, valor por pessoa, e quem paga / quem recebe. |
| **Cálculo de acerto** | Divide o total igualmente e determina o saldo de cada pessoa (`saldo = médiaPorPessoa − totalGastoPessoa`). |
| **Compartilhamento** | Gera uma **imagem PNG** (via SVG → Canvas) do resumo/detalhes para compartilhar (Web Share API) ou baixar. |
| **Foto de perfil** | Escolha entre **20 avatares SVG pré-definidos**; login via Google traz a foto da conta Google. |
| **Alterar senha** | Troca de senha para contas de credenciais (valida senha atual). |
| **Formatar sistema** | Reseta os dados da conta (pessoas + despesas) via **soft delete**, preservando histórico para auditoria. |

---

## 🧰 Stack & Tecnologias

| Camada | Tecnologia |
|---|---|
| **Framework** | Next.js 15.4 (App Router) + React 19 |
| **Linguagem** | JavaScript (ES Modules) + TypeScript nos schemas de validação |
| **Autenticação** | NextAuth v5 (beta) — Credentials + Google Provider |
| **ORM / Banco** | Prisma 7 + PostgreSQL 16 (driver adapter `@prisma/adapter-pg`) |
| **Validação** | Zod 4 |
| **Hash de senha** | bcrypt |
| **Estilo** | **CSS Modules** + `modern-css-reset` + `next/font` (fontes do Google) |
| **Datas** | date-fns, react-datepicker |
| **Geração de imagem** | SVG + Canvas nativo (com `html2canvas` / `dom-to-image-more` como dependências auxiliares) |
| **Infra dev** | Docker + Docker Compose (Postgres + app) |

---

## 🏗️ Arquitetura

Aplicação **Next.js App Router** monolítica: o mesmo projeto serve o frontend (React Server/Client Components) e o backend (Route Handlers em `src/app/api`). O acesso a dados é centralizado no Prisma Client (`src/lib/prisma.js`, singleton).

### Estrutura de diretórios

```
src/
├── app/
│   ├── layout.js              # Root layout: fontes, reset, Navbar, SessionProvider
│   ├── page.js                # Landing page (Início)
│   ├── globals.css            # Variáveis CSS globais + reset de button/a
│   ├── (auth)/                # Route group das telas "de aplicação"
│   │   ├── app/               # Área protegida (redireciona p/ /login sem sessão)
│   │   │   ├── layout.js      # Guarda de rota (auth() + redirect) + footer
│   │   │   └── page.js        # Monta <ControleDespesas/>
│   │   ├── login/             # Tela de login (form + Google)
│   │   ├── cadastro/          # Cadastro de usuário (Server Action)
│   │   ├── profile/           # Perfil + galeria de avatares
│   │   │   └── settings/password/  # Troca de senha (Server Action)
│   │   └── (logout)/
│   └── api/                   # Backend (Route Handlers)
│       ├── auth/[...nextauth]/route.js   # Handlers do NextAuth
│       ├── expenses/route.js             # GET / POST despesas
│       ├── persons/route.js              # GET / POST pessoas
│       └── users/me/
│           ├── route.js                  # PATCH (avatar)
│           └── data/route.js             # DELETE (formatar sistema)
├── components/                # Componentes de UI e de feature
│   ├── ControleDespesas.jsx   # Orquestrador central (roteia entre telas via estado)
│   ├── ControleDespesasMenu.jsx
│   ├── cadastraPessoa/  cadastraDespesa/  consultarDespesas/
│   ├── resumoDespesas/  formatarSistema/  sistema/  shared/
│   ├── providers/SessionProvider.jsx
│   └── ui/                    # Navbar, Snackbar, Loading, LogoutButton
├── hooks/                     # Lógica de estado por feature (padrão "1 hook por fluxo")
├── lib/                       # prisma.js, user.js, avatars.js
├── schemas/                   # Schemas Zod (gastos, pessoas, usuarios)
├── utils/                     # compartilharDespesas.js (geração de imagem)
└── generated/                 # Prisma Client gerado (output custom)

prisma/
├── schema.prisma
└── migrations/                # Histórico de migrations versionadas
public/
├── avatars/                   # avatar-01.svg … avatar-20.svg
├── icons/  fonts/  assets/
```

### Fluxo de navegação interna

A área logada (`/app`) usa um **orquestrador por estado** em vez de sub-rotas: o componente [`ControleDespesas.jsx`](src/components/ControleDespesas.jsx) mantém `opcaoMenu` (via `useControleDespesas`) e renderiza condicionalmente a tela correspondente:

```
menu → { consultaDespesa | cadastraDespesa | resumoDespesa | sistema | cadastraPessoas | formatarSistema }
```

`useControleDespesas` é o hook "raiz": ao montar, busca pessoas (`GET /api/persons`) e despesas (`GET /api/expenses`), guarda em `listaPessoas` / `listaDespesas` e distribui para as telas filhas junto com as funções de atualização.

---

## 🗄️ Modelo de Dados

Definido em [`prisma/schema.prisma`](prisma/schema.prisma). PostgreSQL.

```
User ────< UserAuthProvider        (1 usuário → N provedores de auth)
  │
  └──────< Person ────< Expense    (1 usuário → N pessoas → N despesas)
```

| Model | Campos principais | Observações |
|---|---|---|
| **User** | `id`, `name`, `email` (único), `password?`, `profilePic?`, `createdAt` | `password` nulo para contas só-Google. `profilePic` guarda URL do Google **ou** caminho de avatar local (`/avatars/avatar-XX.svg`). |
| **UserAuthProvider** | `id`, `userId`, `provider`, `providerId`, `createdAt` | Único por `(provider, providerId)`. `provider` = `google` \| `local`. FK com `onDelete: Cascade`. |
| **Person** | `id`, `name`, `email`, `userId`, **`deletedAt?`** | Vinculada ao usuário. `deletedAt` = soft delete. |
| **Expense** | `id` (uuid), `name`, `value`, `month`, `year`, `personId`, **`deletedAt?`** | Vinculada à pessoa. `deletedAt` = soft delete. |

### Soft delete

Exclusões **não removem** registros: marcam `deletedAt = now()`. Todas as leituras filtram `deletedAt: null`. Isso mantém o histórico auditável (ex.: sobrescrita de um mês de despesas marca as antigas como deletadas e cria as novas).

---

## 🔌 API REST

Todas as rotas exigem sessão autenticada (via `auth()`) e retornam o envelope padronizado `{ success, message, data }`.

| Método | Rota | Descrição | Body / Query |
|---|---|---|---|
| `GET` | `/api/persons` | Lista pessoas ativas do usuário | — |
| `POST` | `/api/persons` | Cadastra pessoas | `{ listaPessoasACadastrar: [{nome, email}] }` (Zod: 2–9) |
| `GET` | `/api/expenses` | Lista despesas ativas (opcionalmente por mês/ano) | `?mes=&ano=` |
| `POST` | `/api/expenses` | Registra despesas de um mês (soft-delete das antigas + cria novas) | `{ lista, mes, ano }` (Zod) |
| `PATCH` | `/api/users/me` | Atualiza a foto de perfil | `{ avatar: "/avatars/avatar-XX.svg" }` (validado contra whitelist) |
| `DELETE` | `/api/users/me/data` | Formata o sistema (soft-delete de pessoas + despesas) | `{ textoConfirmacao: "FORMATAR SISTEMA" }` |
| `GET/POST` | `/api/auth/[...nextauth]` | Handlers do NextAuth | — |

**Segurança:** o e-mail do usuário vem sempre da **sessão** (nunca do body). O `PATCH` de avatar valida contra a whitelist `isValidAvatar()` para impedir gravação de valores arbitrários.

---

## 🔐 Autenticação

Configurada em [`src/auth.js`](src/auth.js) com **NextAuth v5**:

- **Credentials Provider** — valida email/senha via `findUserByCredentials` ([`src/lib/user.js`](src/lib/user.js)), comparando o hash bcrypt.
- **Google Provider** — no callback `signIn`, cria o usuário se não existir (com a foto do Google), ou vincula o provider Google a um usuário existente. A foto do Google **só** preenche `profilePic` se ele estiver nulo (não sobrescreve avatar escolhido pelo usuário).
- **Callbacks `jwt` / `session`** — propagam `dbId`, `profilePic` e `provider` para o token e a sessão. `update({ updateType: "profilePicture" })` recarrega a foto do banco após troca de avatar.

**Proteção de rota:** o layout [`(auth)/app/layout.js`](src/app/(auth)/app/layout.js) é um Server Component que chama `auth()` e faz `redirect("/login")` quando não há sessão.

**Registro e troca de senha** usam **Server Actions** (`'use server'`):
- [`cadastro/registerAction.js`](src/app/(auth)/cadastro/registerAction.js) — valida com Zod, checa duplicidade, cria `User` + `UserAuthProvider` (provider `local`).
- [`profile/settings/password/changePasswordAction.js`](src/app/(auth)/profile/settings/password/changePasswordAction.js) — confere a senha atual e grava a nova (hash bcrypt).

---

## 🖥️ Frontend: páginas, componentes e hooks

### Páginas (App Router)

| Rota | Arquivo | Tipo |
|---|---|---|
| `/` | `app/page.js` | Landing / Início |
| `/app` | `(auth)/app/page.js` | Área protegida (orquestrador) |
| `/login` | `(auth)/login/page.js` | Login |
| `/cadastro` | `(auth)/cadastro/page.js` | Cadastro de usuário |
| `/profile` | `(auth)/profile/page.js` | Perfil + avatares |
| `/profile/settings/password` | `(auth)/profile/settings/password/page.js` | Troca de senha |

### Componentes (por feature)

| Grupo | Componentes | Responsabilidade |
|---|---|---|
| **Orquestração** | `ControleDespesas`, `ControleDespesasMenu` | Roteamento interno da área logada |
| **cadastraPessoa/** | `CadastraPessoa`, `SeletorNumeroPessoas`, `PessoaInfo`, `ConfirmaPessoas`, `ExistemPessoasCadastradas`, `ResultadoCadastro` | Fluxo de cadastro de pessoas por etapas |
| **cadastraDespesa/** | `CadastraDespesa`, `DespesaInfo`, `ConfirmaDespesa`, `SobrescreveDespesa`, `ResumoPagamento`, `ResultadoCadastro`, `PessoasNaoCadastradas` | Fluxo de lançamento de despesas |
| **consultarDespesas/** | `ConsultarDespesas`, `DespesasResumo`, `DespesasDetalhes` | Consulta e detalhamento por mês |
| **resumoDespesas/** | `ResumoDespesas`, `DespesasInfoResumo`, `DespesasNaoCadastradas` | Rateio e resumo |
| **formatarSistema/** | `FormatarSistema`, `Aviso`, `Confirmacao`, `ResumoFormatacao` | Fluxo de reset de dados |
| **sistema/** | `Sistema` | Submenu "Sistema" (formatar etc.) |
| **shared/** | `SeletorData`, `DespesasNaoCadastradas` | Reuso entre fluxos |
| **ui/** | `Navbar`, `Snackbar`, `Loading`, `LogoutButton` | UI base |
| **providers/** | `SessionProvider` | Wrapper do `SessionProvider` do NextAuth |

### Hooks customizados

O projeto segue o padrão **"um hook por fluxo"** — toda a lógica de estado/negócio de uma feature fica em um hook, deixando o componente focado em renderização.

| Hook | Responsabilidade |
|---|---|
| [`useControleDespesas`](src/hooks/useControleDespesas.jsx) | Hook raiz: carrega pessoas e despesas do backend, mantém `opcaoMenu` e distribui dados/atualizadores |
| [`useCadastroPessoas`](src/hooks/useCadastroPessoas.jsx) | Etapas de cadastro de pessoas, validação de email, `POST /api/persons` |
| [`useCadastroDespesas`](src/hooks/useCadastroDespesas.jsx) | Etapas de lançamento, detecção/sobrescrita de mês, cálculo de acerto, `GET/POST /api/expenses` |
| [`useConsultarDespesas`](src/hooks/useConsultarDespesas.jsx) | Busca local por mês/ano, navegação entre meses, detalhamento por pessoa |
| [`useResumoDespesas`](src/hooks/useResumoDespesas.jsx) | Cálculo do rateio e compartilhamento do resumo |
| [`useFormatarSistema`](src/hooks/useFormatarSistema.jsx) | Fluxo de confirmação + `DELETE /api/users/me/data` |
| [`useProfile`](src/hooks/useProfile.jsx) | Galeria de avatares, seleção e `PATCH /api/users/me` |

### Utilitários

- [`utils/compartilharDespesas.js`](src/utils/compartilharDespesas.js) — gera imagens PNG (tabelas de detalhes, resumo e acerto) montando um **SVG** com a fonte Roboto Condensed embutida como data URL, rasterizando em `<canvas>` a 2x e compartilhando via **Web Share API** (com fallback para download).
- [`lib/avatars.js`](src/lib/avatars.js) — `AVATARS` (lista dos 20 caminhos) + `isValidAvatar()` (whitelist usada no front e no back).

---

## 📐 Convenções de código

- **CSS Modules** por componente (`*.module.css`), com algumas variáveis globais em `globals.css` e fontes injetadas via `next/font` como CSS vars (`--font-roboto`, `--font-poppins`, etc.).
- **Um hook por fluxo** — separa lógica de UI (ver TODO em `useCadastroPessoas` sobre separar responsabilidades).
- **Validação com Zod** em toda entrada de API e Server Action.
- **Envelope de resposta** padronizado nas rotas: `{ success, message, data }`.
- **Soft delete** em `Person` e `Expense` — nunca `delete` físico.
- Models e rotas em **inglês**; parte da UI, hooks e schemas ainda em **português** (dívida de padronização conhecida).

---

## 🚀 Como rodar

### Com Docker (recomendado)

O `docker-compose.yml` sobe o Postgres e o app. Na subida, o container roda automaticamente `npm install`, `prisma generate` e `prisma migrate deploy`.

```bash
docker compose up --build
```

App em `http://localhost:3000`, Postgres em `localhost:5432`.

> **Fluxo de dev (WSL + Windows):** o projeto é editado no Windows mas os containers rodam no WSL — arquivos novos criados no host podem não propagar ao container já em execução. O fluxo é: editar → `git commit` → `git pull` no WSL → `docker compose up`.

### Local (sem Docker)

```bash
npm install
npx prisma migrate dev     # aplica migrations e gera o client
npm run dev
```

### Scripts npm

| Script | Ação |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | ESLint |
| `npm run prisma:generate` | Gera o Prisma Client |
| `npm run prisma:migrate` | `prisma migrate dev` |
| `npm run prisma:studio` | Abre o Prisma Studio |

---

## 🔑 Variáveis de ambiente

| Arquivo | Variáveis |
|---|---|
| `.env` | `DATABASE_URL` (usado pelo Prisma). Opcional: `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` para o compose (senão usa defaults). |
| `.env.local` | `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_TRUST_HOST` |

> Dentro do Docker, `DATABASE_URL` aponta para o host `db` (`postgresql://…@db:5432/…`); fora do Docker, para `localhost:5432`. Arquivos `.env*` são ignorados pelo git.

---

_Projeto de [github.com/gbrlmzl](https://github.com/gbrlmzl)._
