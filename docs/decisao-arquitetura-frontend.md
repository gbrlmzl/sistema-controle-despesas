# Decisão: o que fazer com o front-end depois da API sair do Next.js

> Documento de decisão. Depende do [plano da API Node/Express](plano-api-node-express.md) — em
> especial da escolha de **Escopo B** ali (Server Actions também migram, não só os Route
> Handlers). Se o escopo ficar em A, esta pergunta não tem uma resposta honesta ainda: o Next.js
> continuaria fazendo trabalho de back-end via Server Actions, e nenhuma das opções abaixo faria
> sentido comparar de verdade.

## 1. A pergunta

Uma vez que toda a lógica de servidor sair para uma API Express separada, o Next.js passa a ser
"só" um consumidor dessa API. Isso ainda justifica o peso de um framework full-stack (SSR, React
Server Components, roteamento por arquivos, o `src/proxy.ts` de proteção de rota), ou um SPA mais
simples (Vite + React Router, por exemplo) resolveria com menos complexidade?

## 2. As opções

| # | Opção | Repositório |
| :---- | :---- | :---- |
| **1** | Não separar nada — manter tudo como está hoje (Server Actions + Route Handlers no Next.js) | 1 repo |
| **2** | Manter Next.js como front-end, API Express **no mesmo repositório** (pasta própria, ex. `server/`), numa branch nova | 1 repo |
| **3** | Manter Next.js como front-end, API Express em **repositório separado** | 2 repos |
| **4** | Trocar Next.js por Vite (SPA puro) + API Express, **repositório separado** para cada | 2 repos |

A opção 1 é a linha de base "não fazer nada" — útil só como comparação, não é uma opção real dado
que o objetivo explícito é aprender Node/Express com uma API de verdade.

## 3. O que pesa na decisão (contexto específico deste projeto)

Antes da comparação, três fatos concretos sobre o estado atual do projeto que mudam o cálculo:

- **O projeto acabou de terminar uma migração grande e deliberada para TypeScript + Next.js 16**,
  incluindo separar `auth.config.ts`/`auth.ts` especificamente para funcionar no Edge Runtime e
  criar `src/proxy.ts` para proteção de rota — trabalho recente, específico do Next.js, e que
  seria descartado numa migração para Vite.
- **React Server Components não exigem abrir mão da API separada.** Um Server Component pode
  fazer `fetch()` para a API Express do mesmo jeito que hoje chama `lib/residence.ts` — a troca é
  só a fonte de dados. Ou seja, "ter uma API separada" e "manter SSR/RSC" não são mutuamente
  exclusivos — essa é a maior pegadinha desta decisão: a separação do back-end, por si, **não**
  obriga a virar SPA.
- **Não há evidência hoje de que o Next.js seja lento, pesado ou esteja atrapalhando.** A
  motivação pra considerar Vite é conceitual ("mais leve"), não um problema observado. Trocar de
  framework por uma hipótese não validada é o tipo de decisão mais cara de reverter se estiver
  errada.

## 4. Matriz comparativa

| Critério | 1 — Status quo | 2 — Mesmo repo | 3 — Repos separados (Next.js) | 4 — Vite + repos separados |
| :---- | :---- | :---- | :---- | :---- |
| Aproveita o trabalho recente de TS/Next 16/proxy | Sim (não muda) | Sim | Sim | **Não** — descarta RSC, proxy, parte da tipagem de página |
| Cumpre o objetivo de aprendizado (API real) | Não | Sim | Sim | Sim |
| Fricção de setup imediata | Nenhuma | Baixa (1 `docker-compose`, 1 histórico git) | Média (2 pipelines, 2 deploys) | Alta (2 pipelines, 2 deploys + reescrita de front-end) |
| Complexidade de CORS/cookies entre serviços | N/A | Baixa (mesma origem em dev, se servidos juntos) | Média (origens diferentes) | Média (origens diferentes) |
| Alinhamento com Etapa 3 do cronograma (deploy AWS ECS) | N/A | Precisa separar depois pra conteinerizar a API isoladamente | Direto — cada serviço já é uma imagem Docker própria | Direto |
| Reversibilidade se der errado | N/A | Alta (é só uma branch) | Média (2 repos pra desfazer) | Baixa (reescrita de UI teria que ser refeita) |
| Valor de aprendizado adicional (fora do Node/Express) | Nenhum | Baixo | Médio (orquestração multi-repo) | Alto, mas **não é o objetivo declarado** desta fase |

## 5. Análise de cada opção

### Opção 2 — mesmo repositório, branch nova (recomendada para agora)

**Prós:** menor fricção possível para validar a ideia rápido; um único `docker-compose` sobe os
dois serviços; um único histórico git facilita comparar "como era antes" vs "como ficou depois"
lado a lado; reversível com custo baixo (descartar a branch, ou manter as duas branches vivas por
um tempo).

**Contras:** mistura, no mesmo repositório, dois projetos com ciclos de vida potencialmente
diferentes (deploys separados no futuro ainda vão exigir separar CI/CD por pasta); não é a
estrutura final se a intenção de longo prazo for repositórios independentes.

**Quando escolher:** agora, enquanto a API ainda não está validada e o objetivo principal é
aprender e ter algo testável — não gastar esforço de organização antes de saber se o resultado
final vale a separação de repositório.

### Opção 3 — repositórios separados, Next.js mantido

**Prós:** ciclo de deploy independente por serviço (relevante pra Etapa 3 do cronograma —
conteinerizar e subir no ECS fica mais natural com a API isolada); histórico git limpo por
domínio; força a API a ter uma "interface pública" bem definida desde o início (sem atalhos de
importar código do outro projeto).

**Contras:** overhead de coordenação (duas PRs pra uma mudança que toca os dois lados, ex.:
adicionar um campo novo); precisa resolver CORS e cookies cross-origin desde o primeiro dia, não
só em produção.

**Quando escolher:** depois que a Opção 2 tiver rodado por um tempo e a API estiver estável — é a
evolução natural, não o ponto de partida.

### Opção 4 — Vite + repositórios separados (não recomendada agora)

**Prós:** stack mais simples de fato (sem SSR, sem RSC, sem Edge Runtime pra entender); pode ser
mais rápido de iterar no front puro; é uma stack genuinamente mais leve se o objetivo for só SPA.

**Contras:** joga fora trabalho recente e deliberado (a migração de auth pro Edge Runtime e o
`src/proxy.ts` não existiriam mais); perde SSR/SEO (não é um problema hoje, mas é uma capacidade
que some); é a opção de maior esforço total combinada com a de menor aproveitamento do que já foi
feito; **resolve um problema que ainda não foi observado** — é otimização prematura de stack.

**Quando reconsiderar:** só depois de ter vivido um tempo com a Opção 2 ou 3 e sentido, na
prática, que o SSR/RSC do Next.js não está sendo usado pra nada (ex.: todas as páginas viraram
`'use client'` fazendo fetch, o roteamento por arquivos não está sendo aproveitado, o time de
build/dev do Next.js está incomodando). Só nesse ponto trocar de framework passa de hipótese pra
decisão embasada.

## 6. Recomendação e sequenciamento

1. **Agora:** Opção 2 — Express dentro do mesmo repositório, branch nova, seguindo o
   [plano da API](plano-api-node-express.md). Mede-se o custo real de mudar de arquitetura sem
   pagar o preço de organizar dois repositórios antes da hora.
2. **Depois que a API estiver com Escopo B completo e testada:** reavaliar se vale migrar para a
   Opção 3 (repos separados) — principalmente motivado pela Etapa 3 do cronograma (deploy AWS
   ECS), não pela arquitetura em si.
3. **Só reconsiderar a Opção 4 (Vite)** se, depois de um tempo real de uso da Opção 2/3, o
   Next.js parecer estar pagando um "aluguel" que não está sendo usado — com evidência concreta,
   não como decisão antecipada.

## 7. Sinais para revisitar esta decisão

- Se, na Fase 6 do plano da API (integração no front-end), a maioria das páginas acabar virando
  `'use client'` fazendo só `fetch()` — sinal de que o RSC não está sendo aproveitado, favorece
  reconsiderar a Opção 4.
- Se o tempo de build/dev do Next.js virar um incômodo real no dia a dia — favorece Opção 4.
- Se surgir a necessidade de outro consumidor da API (ex.: um app mobile) — reforça a Opção 3
  (API já é um serviço independente por definição) e enfraquece ainda mais o motivo de continuar
  com Next.js só por causa de SSR de uma única aplicação web.
- Se o incômodo real acabar sendo só "gerenciar dois repositórios", não a stack do front-end em
  si — a resposta é voltar pra Opção 2, não ir para a Opção 4.
