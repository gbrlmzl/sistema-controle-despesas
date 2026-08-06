# Plano de Migração: JavaScript → TypeScript

> Documento de planejamento. Nenhuma migração foi feita ainda — isto é o mapa antes de sair andando.

## 1. Contexto

O projeto (Next.js 16, App Router) é hoje uma base majoritariamente JavaScript com ilhas de
TypeScript já existentes. Levantamento feito em cima do código atual:

| Área | Arquivos `.js`/`.jsx` | Já é `.ts`/`.tsx` |
| :---- | ----: | ----: |
| `src/app/(auth)/**` (páginas, actions, componentes) | 68 | 0 |
| `src/app/api/**` (Route Handlers) | 4 | 0 |
| `src/app/` (raiz: layout, page, Inicio) | 3 | 0 |
| `src/lib/**` | 9 | 0 |
| `src/utils/**` | 5 | 0 |
| `src/hooks/**` | 4 | 0 |
| `src/components/**` | 7 | 0 |
| `src/auth.js`, `src/auth.config.js`, `src/proxy.js` | 3 | 0 |
| `src/schemas/**` | 0 | 3 |
| `src/generated/**` (Prisma Client) | 0 | gerado, já `.ts` |
| `src/deprecated/**` | 35 | 2 |
| **Total a migrar (excluindo `deprecated/`)** | **104** | — |

Ou seja: **104 arquivos** fora de `deprecated/`, que é código morto documentado (ver
[`src/deprecated/README.md`](../src/deprecated/README.md)) e **não deveria ser migrado** — é
candidato a exclusão, não a conversão (ver seção 8).

## 2. O que já está pronto (não é do zero)

- **`tsconfig.json` já existe e já está em modo estrito** (`"strict": true`, `"allowJs": true`).
  Isso significa que arquivo por arquivo pode virar `.ts`/`.tsx` a qualquer momento, coexistindo
  com o resto em `.js`, sem precisar de nenhuma mudança de configuração antes de começar.
- **O Prisma Client gerado já é 100% TypeScript** (`src/generated/models/*.ts`). Isso é a maior
  vantagem deste projeto especificamente: assim que `src/lib/*.js` virar `.ts`, os tipos de
  `Expense`, `Residence`, `User` etc. já existem prontos — não é preciso escrever nada à mão pra
  camada de dados.
- **3 schemas Zod já são `.ts`** (`src/schemas/despesas.ts`, `residencias.ts`, `usuarios.ts`) e já
  usam o padrão certo (`z.object` com validação centralizada). O padrão a seguir no resto do
  projeto é o mesmo: inferir tipos com `z.infer<typeof algumSchema>` em vez de redeclarar o shape.
- **O path alias `@/*` → `./src/*`** já está configurado tanto para JS quanto para TS — nenhuma
  mudança de import necessária durante a migração.

## 3. O que falta antes de começar (Fase 0)

1. **Fixar dependências explícitas.** Hoje `typescript` (5.9.2) e `@types/react` (19.2.7) só
   existem porque outra dependência os traz de carona — não estão no `package.json`. `@types/react-dom`
   **não existe** no projeto. Adicionar como `devDependencies` explícitas:
   ```bash
   npm install -D typescript @types/react @types/react-dom
   ```
   Sem isso, o projeto depende de uma resolução transitiva que pode sumir numa troca de versão do
   Next ou do Prisma sem aviso.

2. **Decidir o destino de `src/deprecated/`** antes de mexer em qualquer coisa: migrar (perder
   tempo com código morto), excluir do `tsconfig` via `"exclude"` (fica JS pra sempre, órfão), ou
   apagar de vez (recomendado — ver seção 8). Isso muda a conta de "quanto falta migrar".

3. **Aumentação de tipos do NextAuth.** `session.user` no projeto carrega campos que não existem
   no tipo padrão do NextAuth (`id`, `profilePic`, `provider` — ver `src/auth.config.js`). Sem
   declarar isso, todo arquivo que tocar `session.user.profilePic` vai dar erro de tipo. Criar
   `src/types/next-auth.d.ts`:
   ```ts
   import { DefaultSession } from "next-auth";

   declare module "next-auth" {
     interface Session {
       user: DefaultSession["user"] & {
         id: number;
         profilePic: string | null;
         provider: "credentials" | "google" | null;
       };
     }
   }

   declare module "next-auth/jwt" {
     interface JWT {
       dbId?: number;
       profilePic?: string | null;
       provider?: "credentials" | "google";
     }
   }
   ```
   Isso deveria ser feito **junto com** a conversão de `src/auth.js`/`auth.config.js` (fase 1),
   não depois.

4. **Confirmar que CSS Modules tipam de graça.** O pacote `next` já inclui declaração ambiente
   para `*.module.css` (via `next-env.d.ts` → `next/image-types/global`). Ainda assim, validar
   isso convertendo **um único arquivo simples primeiro** (sugestão: `src/utils/dinheiro.js`, sem
   CSS envolvido, e depois um componente pequeno com `.module.css`, ex.: `Snackbar.jsx`) antes de
   migrar em lote — se algo não tipar sozinho, é mais barato descobrir em 1 arquivo do que em 60.

5. **Não mude a política de `strict` no meio do caminho.** Já está `true` no `tsconfig.json`.
   Resistir à tentação de desligar (`strict: false`) pra "migrar mais rápido" — isso só empurra o
   trabalho de tipagem pra depois, quando já não há mais lembrete visual (arquivo `.js`) de que
   algo não foi tipado. Onde um tipo for genuinamente difícil de inferir de primeira, preferir um
   `any` explícito e visível com comentário `// TODO(ts): tipar direito` a desligar strict.

## 4. Estratégia: incremental, de baixo pra cima

Nada de big-bang. Como `allowJs` já convive com `.ts`, a migração é arquivo por arquivo (ou
pasta por pasta), sempre subindo na cadeia de dependência: primeiro o que não depende de nada,
por último o que depende de tudo. Cada arquivo convertido imediatamente propaga tipo pra quem o
importa, então a ordem abaixo importa — inverter a ordem cria trabalho duplicado (tipar um
consumidor antes de tipar o que ele consome força a re-tipar depois).

### Fase 1 — Núcleo sem dependências internas (14 arquivos)

`src/utils/*.js` (5) → `src/lib/*.js` (9, nesta ordem: `prisma.js` primeiro, por ser a base de
todos os outros).

Maior ganho por arquivo convertido desta fase inteira: **`src/lib/*.js`**, porque cada função ali
já consulta o Prisma Client tipado — o retorno de `listarDespesasDaCompetencia`,
`buscarResidenciaDoMembro` etc. passa a ser inferido automaticamente, sem anotação manual.

### Fase 2 — Autenticação (3 arquivos, criticidade alta)

`src/auth.config.js` → `src/auth.js` → `src/proxy.js`, nesta ordem exata (é a ordem de
dependência real: `auth.js` importa `auth.config.js`, `proxy.js` importa `auth.config.js`).
Junto: criar o `next-auth.d.ts` da seção 3. Testar login + as rotas protegidas de novo depois
(mesmo roteiro de verificação já usado quando o `proxy.js` foi criado).

### Fase 3 — Server Actions (23 arquivos)

Todas as `*Action.js` dentro de `src/app/(auth)/**`. Antes de converter, definir um tipo
reutilizável em vez de repetir `{ success: boolean; message: string }` em 23 arquivos:

```ts
// src/types/actions.ts
export type ActionState<T = undefined> = T extends undefined
  ? { success: boolean; message: string }
  : { success: boolean; message: string; data?: T };
```

Padrão a aplicar em toda action: o `FormData` bruto (`Object.fromEntries(formData.entries())`)
continua sem tipo — é assim mesmo, é a natureza de dado externo. O que muda é validar esse objeto
com o schema Zod já existente e usar `z.infer<typeof despesaSchema>` como o tipo de verdade dali
pra frente, nunca redeclarar o shape à mão.

### Fase 4 — Hooks (4 arquivos)

`useProfile.jsx`, `useAlertas.jsx`, `useNotificacoes.jsx`, `useResidencias.jsx`. **Atenção:** os
três últimos têm avisos pré-existentes do ESLint (`react-hooks/set-state-in-effect`, achados numa
sessão anterior — ver memória do projeto) — como o arquivo já vai estar aberto pra converter,
aproveitar pra corrigir os avisos junto, em vez de "converter tipo por tipo e deixar o resto
igual".

### Fase 5 — Componentes compartilhados (7 arquivos)

`src/components/ui/*.jsx`, `src/components/providers/*.jsx`, `src/components/residencias/*.jsx`.

### Fase 6 — Páginas e features (68 + 4 + 3 = 75 arquivos, a maior fase)

Pasta por pasta dentro de `src/app/(auth)/app/residences/[code]/`, cada uma já é uma feature
fechada (`expenses/`, `expenses/recurring/`, `expenses/new/`, `members/`, `settings/`,
`reports/`), e depois o resto (`login/`, `cadastro/`, `profile/`, `alerts/`). Junto:
`src/app/api/**` (4 Route Handlers) e a raiz (`layout.js`, `page.js`, `Inicio.jsx`).

Ponto que vai se repetir em quase toda página de `[code]/`: os params de rota dinâmica chegam
como Promise desde a versão do Next usada aqui —

```ts
export default async function Pagina({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  // ...
}
```

— então vale escrever esse tipo uma vez (`type ParamsResidencia = { params: Promise<{ code: string }> }`
em algum lugar compartilhado, ex. `src/types/routes.ts`) em vez de repetir inline 15 vezes.

### Fase 7 — `next.config.mjs` → `next.config.ts` (opcional, cosmético)

Next 16 aceita `next.config.ts` nativamente. Baixo risco, baixo ganho — fazer por último, se
sobrar apetite.

## 5. Padrões específicos deste projeto (referência rápida)

| Situação | O que fazer |
| :---- | :---- |
| Retorno de função em `src/lib/*.ts` | Deixar o TypeScript inferir do Prisma Client gerado; não redeclarar `Expense`, `ExpenseCategory` etc. — importar de `src/generated/models`. |
| Dado validado por Zod | Usar `z.infer<typeof schema>`, nunca duplicar o shape numa `interface` à parte. |
| `FormData` de Server Action | Continua não tipado até passar pelo `safeParse` do Zod — é esperado, não é "furo" de tipagem. |
| `session.user.*` customizado | Só existe depois do `next-auth.d.ts` da seção 3. |
| `params` de rota dinâmica | `Promise<{ code: string }>`, sempre — é `await`ado em toda página hoje. |
| CSS Modules | `import styles from './X.module.css'` já tipado pelo pacote `next`; não precisa de `.d.ts` próprio. |
| `src/generated/**` | Nunca editar nem re-tipar — é saída do `prisma generate`. |

## 6. Definição de "fase pronta"

Cada fase (não cada arquivo) é considerada concluída quando, nessa ordem:

1. `npx tsc --noEmit` passa sem erros novos (comparar contra o baseline antes da fase).
2. `npm run build` passa.
3. Para fases que tocam autenticação ou rotas (Fase 2 e qualquer página em `[code]/`), reverificar
   manualmente no navegador — mesmo roteiro já usado nas mudanças anteriores de auth: anônimo
   redireciona, sessão errada é bloqueada, etc.

## 7. Tamanho do trabalho (visão geral)

| Fase | Arquivos | Risco |
| :---- | ----: | :---- |
| 0 — Preparação | 0 (config) | Baixo |
| 1 — `utils/` + `lib/` | 14 | Baixo |
| 2 — Auth (`auth.config`, `auth`, `proxy`) | 3 | **Alto** (é a camada de segurança) |
| 3 — Server Actions | 23 | Médio |
| 4 — Hooks | 4 | Médio (mexe em código com avisos de lint conhecidos) |
| 5 — Componentes compartilhados | 7 | Baixo |
| 6 — Páginas e features | 75 | Médio (volume alto, mas mecânico) |
| 7 — `next.config.ts` | 1 | Baixo, opcional |
| **Total migrado** | **~127** | |
| `src/deprecated/` | 35 | Fora do escopo — ver seção 8 |

## 8. O que fica de fora, de propósito

- **`src/deprecated/`** (35 arquivos): é a V1 do sistema, já documentada como morta e inalcançável
  por nenhuma rota (ver seu próprio `README.md`). Migrar isso seria trabalho jogado fora. A
  recomendação é **excluir a pasta do repositório** antes ou depois da migração — não convertê-la.
- **`src/generated/`**: já é TypeScript, gerado automaticamente a cada `prisma generate`. Nunca é
  tocado manualmente, migrado ou não.
- **`docs/*.md`**: fora do escopo por definição — são documentos, não código.
