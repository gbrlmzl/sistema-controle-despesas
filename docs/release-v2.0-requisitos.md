# Release V2.0 — Atualização Geral

## Documento de Requisitos: Backlog, Estórias de Usuário e Cenários BDD

**Projeto:** Sistema de Controle de Despesas **Release:** V2.0 — Despesas colaborativas por residência **Autor:** Gabriel Mizael **Status do documento:** Rascunho — em preenchimento **Última atualização:** 03/08/2026

---

## Como usar este documento

Este documento tem dois públicos ao mesmo tempo:

1. **Pessoas** — para entender o comportamento esperado do software.  
2. **Claude / IA** — para gerar código a partir de uma especificação não ambígua.

Por isso cada funcionalidade é rastreável de ponta a ponta:

**Épico (EP) → Funcionalidade (FEAT) → Estória de Usuário (US) → Cenário BDD (CEN)**

Toda estória cita a funcionalidade de origem, e todo cenário cita a estória de origem. Ao pedir a implementação, basta referenciar o ID (ex.: *"implemente a US-006"*) que o contexto necessário está todo encadeado.

### Legenda de origem

| Marcador | Significado |
| :---- | :---- |
| 📄 | **Origem: Esboço** — extraído diretamente do esboço original da V2.0. |
| 💡 | **Sugestão do Claude** — proposto por mim, não estava no esboço. **Requer sua validação.** |
| ⬜ | **A definir** — lacuna reconhecida, aguardando decisão. Preencher antes de implementar. |

### Convenção de IDs

| Prefixo | Elemento | Exemplo |
| :---- | :---- | :---- |
| `EP-00` | Épico | EP-02 |
| `FEAT-000` | Funcionalidade | FEAT-004 |
| `US-000` | Estória de Usuário | US-006 |
| `RN-000` | Regra de Negócio | RN-003 |
| `CEN-000.0` | Cenário BDD | CEN-006.2 |

### Convenção de prioridade (MoSCoW)

| Valor | Significado |
| :---- | :---- |
| **Must** | Sem isso a release não existe. |
| **Should** | Importante, mas a release funciona sem. |
| **Could** | Desejável se sobrar tempo. |
| **Won't** | Fora do escopo desta release (fica registrado para o futuro). |

### Convenção de status

`Não iniciado` · `Em andamento` · `Em revisão` · `Concluído` · `Bloqueado`

---

## 0\. Contexto

### 0.1 Estado atual (V1.1)

O sistema opera em **modo de dono único**: um `User` autenticado cadastra `Person` (participantes que **não** possuem login próprio) e lança as `Expense` de cada participante, por mês e ano.

Modelo atual, de forma resumida:

User (login) ──1:N──\> Person (participante sem login) ──1:N──\> Expense (mês/ano)

**Limitação:** todas as despesas dependem de uma única pessoa operando o sistema, normalmente lançando tudo de uma vez.

### 0.2 Estado alvo (V2.0) 📄

Múltiplos usuários **com login próprio** compartilham uma **residência** e cada um lança as próprias despesas, de forma incremental, quando quiser.

User (login) ──N:M (via Membership)──\> Residence ──1:N──\> Expense

                      │

                      └── 1 Owner (criador)

### 0.3 Glossário

| Termo | Definição |
| :---- | :---- |
| **Residence** | Agrupamento de usuários que compartilham despesas. Equivale à "casa"/"residência" do esboço. Possui `id` (chave primária) e `code`. 📄 |
| **Code** | Código curto e único da residência, usado por outro usuário para solicitar entrada. 📄 |
| **Owner** | Usuário criador da residência. É o único que aceita/recusa solicitações de entrada. Cada residência tem exatamente um. 📄 |
| **Member** | Usuário que pertence a uma residência (inclui o Owner). 📄 |
| **Invite** | Convite enviado **pelo Owner** para um usuário entrar na residência. Fluxo de dentro para fora. 📄 |
| **JoinRequest** | Solicitação enviada **por um usuário** que digitou o código. Fluxo de fora para dentro. 📄 |
| **Expense** | Despesa lançada por um membro, vinculada à residência e a uma competência (mês/ano). 📄 |
| **Competência** | Par mês/ano ao qual a despesa se refere. 💡 |

### 0.4 Dependências técnicas identificadas

| \# | Dependência | Impacto | Origem |
| :---- | :---- | :---- | :---- |
| D-01 | ~~Não existe campo `username` no modelo `User` atual.~~ **Resolvida:** o campo `username` foi criado na FEAT-003 e o convite será feito por ele. | Bloqueava FEAT-014 | 💡 |
| D-02 | ~~`Expense` aponta para `Person`.~~ **Resolvida:** `Expense` passou a apontar para `Residence` e `User`, com categoria e valor em centavos. | Bloqueava EP-04 | 💡 |
| D-03 | ~~Definir o destino do modelo `Person`.~~ **Resolvida:** o model foi removido — cada usuário lança as próprias despesas. | Afetava EP-04 | ⬜ |

> ✅ **Decisão tomada (D-03):** o `Person` foi removido. Com cada usuário lançando as próprias despesas, ele deixou de ter função. As rotas de API da V1 que dependiam dele (`/api/persons`, `/api/expenses` e `/api/users/me/data`) foram removidas junto.

---

# 1\. Backlog de Funcionalidades

## EP-01 — Conta e Identidade

> Base de autenticação sobre a qual a colaboração se apoia.

| ID | Funcionalidade | Descrição | Prior. | Status | Origem |
| :---- | :---- | :---- | :---- | :---- | :---- |
| FEAT-001 | Cadastro de conta | Usuário cria conta para acessar o sistema. *(já existe na V1)* | Must | Concluído | 📄 |
| FEAT-002 | Login / Logout | Autenticação de sessão. *(já existe na V1)* | Must | Concluído | 📄 |
| FEAT-003 | Identificador público (`username`) | Campo único e público que permite um usuário ser encontrado e convidado por outro, sem expor o e-mail. | Must | Concluído | 💡 (ver D-01) |

## EP-02 — Gestão de Residências

| ID | Funcionalidade | Descrição | Prior. | Status | Origem |
| :---- | :---- | :---- | :---- | :---- | :---- |
| FEAT-004 | Menu principal `/app` | Tela inicial pós-login com as opções "Residências", "Criar residência" e "Entrar em residência". | Must | Concluído | 📄 |
| FEAT-005 | Criar residência | Criação com nome; sistema gera `id` e `code` único. Modal de sucesso com ações "Convidar" e "Confirmar". | Must | Concluído | 📄 |
| FEAT-006 | Listar minhas residências | Lista vertical das residências do usuário, com nome, criador, copiar código e acessar. Estado vazio tratado. | Must | Concluído | 📄 |
| FEAT-007 | Copiar código da residência | Botão que copia o `code` para a área de transferência. | Should | Concluído | 📄 |
| FEAT-008 | Painel da residência | Rota `/app/residences/{code}` com nome, código e acesso a "Consultar despesas" e "Cadastrar despesas". | Must | Concluído | 📄 |
| FEAT-009 | Sair da residência | Membro não-owner abandona a residência por vontade própria. | Should | Concluído | 💡 |
| FEAT-010 | Remover membro | Owner remove um membro da residência. | Could | Concluído | 💡 |
| FEAT-011 | Transferir propriedade | Owner transfere o papel de owner para outro membro (necessário antes de o owner sair). | Could | Concluído | 💡 |
| FEAT-012 | Editar / arquivar residência | Renomear ou arquivar uma residência inativa. | Could | Concluído | 💡 |

## EP-03 — Acesso: Convites e Solicitações

| ID | Funcionalidade | Descrição | Prior. | Status | Origem |
| :---- | :---- | :---- | :---- | :---- | :---- |
| FEAT-013 | Entrar em residência por código | Usuário digita o código; se a residência existir, gera uma solicitação de entrada ao owner. | Must | Concluído | 📄 |
| FEAT-014 | Convidar usuário por `username` | Owner convida um usuário pelo nome de usuário, a partir do modal de sucesso ou do painel. | Must | Concluído | 📄 |
| FEAT-015 | Aceitar / recusar convite recebido | Usuário convidado decide sobre o convite. | Must | Concluído | 📄 |
| FEAT-016 | Aceitar / recusar solicitação de entrada | Owner decide sobre as solicitações recebidas. | Must | Concluído | 📄 |
| FEAT-017 | Central de notificações | Sino na navbar com as notificações do usuário e tela dedicada com o histórico completo. O catálogo de tipos é extensível: atende convites e solicitações, mas também avisos de outras áreas do sistema (ex.: fechamento da conta do mês). | Should | Concluído | 💡 |
| FEAT-018 | Cancelar convite / solicitação | Quem originou pode cancelar enquanto estiver pendente. | Could | Concluído | 💡 |
| FEAT-019 | Regenerar código da residência | Owner gera novo código, invalidando o anterior (útil se o código vazou). | Could | Concluído | 💡 |
| FEAT-020 | Proteção contra tentativa em massa de códigos | Limite de tentativas de entrada por código, evitando descoberta por força bruta. | Should | Concluído | 💡 |

## EP-04 — Despesas Colaborativas

| ID | Funcionalidade | Descrição | Prior. | Status | Origem |
| :---- | :---- | :---- | :---- | :---- | :---- |
| FEAT-021 | Cadastrar despesa própria | Membro lança suas despesas na residência, de forma incremental, a qualquer momento do mês. | Must | Concluído | 📄 |
| FEAT-022 | Consultar despesas da residência | Consulta por competência, agrupada por membro, com total por membro e total geral. Inclui o fechamento do mês pelo owner. | Must | Concluído | 📄 |
| FEAT-023 | Editar / excluir despesa própria | Membro corrige ou remove um lançamento que fez (exclusão lógica via `deletedAt`). | Should | Concluído | 💡 |
| FEAT-024 | Categoria da despesa | Categoria obrigatória no cadastro, com cinco valores fixos: Alimentação, Contas domésticas, Assinaturas, Lazer e Outros. Pré-requisito dos relatórios. | Should | Concluído | 💡 (citado como intenção futura) |
| FEAT-025 | Despesa recorrente | Lançamento marcado como recorrente, recriado na competência seguinte quando o owner fecha o mês. Gerenciada numa tela dedicada (`/expenses/recurring`), acessada por um botão em `/expenses/new` — o cadastro comum não expõe mais a marcação de recorrência. | Could | Concluído | 💡 |

**Nota técnica sobre FEAT-025 (tela dedicada):** não existe um "molde" de despesa recorrente
independente do mês — a tela lista, cria e edita a própria `Expense` da competência aberta com
`isRecurring: true`, filtrada por autor (cada membro só gerencia as suas). "Excluir" nessa tela
não apaga o lançamento: apenas marca `isRecurring: false`, então a despesa do mês corrente
continua valendo e aparece normalmente em Consultar Despesas para edição/exclusão comum.

## EP-05 — Relatórios e Análise

> Bloco majoritariamente futuro; registrado agora porque **condiciona decisões de modelagem** tomadas na V2.0 (especialmente FEAT-024).

| ID | Funcionalidade | Descrição | Prior. | Status | Origem |
| :---- | :---- | :---- | :---- | :---- | :---- |
| FEAT-026 | Relatório por categoria | Quanto foi gasto em cada categoria numa competência, em duas abas: a da residência e a pessoal. | Must | Concluído | 💡 |
| FEAT-027 | Comparativo entre meses | Variação absoluta e percentual entre duas competências, no total e por categoria. | Should | Concluído | 💡 |
| FEAT-028 | Gráficos do relatório | Composição por categoria e evolução ao longo dos meses. | Should | Concluído | 💡 |
| FEAT-029 | Rateio entre membros | Divisão igual do total pelo número de membros, apontando quem paga e quem recebe. | Must | Concluído | 💡 |
| FEAT-033 | Exportar relatório em CSV | Baixar os lançamentos da competência em planilha, para uso fora do sistema. | Could | Concluído | 💡 |
| FEAT-034 | Compartilhar resumo como imagem | Gerar uma imagem do resumo do mês para enviar no grupo da casa. | Could | Concluído | 💡 |
| FEAT-035 | Média e variação por categoria | Comparar a competência atual com a média dos meses anteriores, sinalizando desvios relevantes. | Could | Concluído | 💡 |

## EP-06 — Administração e Auditoria

| ID | Funcionalidade | Descrição | Prior. | Status | Origem |
| :---- | :---- | :---- | :---- | :---- | :---- |
| FEAT-030 | Papel ADMIN | Papel de sistema com acesso à área administrativa. | Won't (V2.0) | Não iniciado | 💡 |
| FEAT-031 | Trilha de auditoria | Registro de eventos sensíveis (criação de residência, entrada/saída de membro, exclusão de despesa, edição de despesa). | Won't (V2.0) | Não iniciado | 💡 |
| FEAT-032 | Monitoramento de acessos | Visualização de logins e acessos para o ADMIN. | Won't (V2.0) | Não iniciado | 💡 |

---

# 2\. Estórias de Usuário

## 2.1 Personas

| Persona | Descrição |
| :---- | :---- |
| **Visitante** | Ainda não autenticado. |
| **Usuário autenticado** | Possui conta e sessão ativa. Pode ou não pertencer a alguma residência. |
| **Owner** | Usuário autenticado que criou a residência. Herda tudo do Membro e decide sobre entradas. |
| **Membro** | Usuário autenticado que pertence a uma residência. |
| **ADMIN** 💡 | Papel de sistema, com acesso à auditoria. Fora do escopo da V2.0. |

## 2.2 Template de estória

> Copie o bloco abaixo para criar novas estórias.

\#\#\# US-0XX — \<título curto e acionável\>

Vinculada a: FEAT-0XX | Prioridade: \<Must/Should/Could\> | Status: \<status\> | Origem: \<📄/💡/⬜\>

Como \<persona\>,

quero \<ação/capacidade\>,

para que \<benefício percebido\>.

Critérios de aceitação

\- \[ \] CA-1: ...

\- \[ \] CA-2: ...

Regras de negócio

\- RN-0XX: ...

Notas técnicas

\- Rota: ...

\- Entidades afetadas: ...

\- Validações: ...

Cenários BDD relacionados: CEN-0XX.1, CEN-0XX.2

---

## 2.3 Estórias — EP-02: Gestão de Residências

### US-001 — Ver o menu principal do aplicativo

**Vinculada a:** FEAT-004 | **Prioridade:** Must | **Status:** Concluído | **Origem:** 📄

> Como **usuário autenticado**, quero **ver um menu com as opções de residência ao entrar no app**, para que **eu saiba quais caminhos tenho disponíveis logo no primeiro acesso**.

**Critérios de aceitação**

- [ ] CA-1: Ao acessar `/app` autenticado, vejo as opções "Residências", "Criar residência" e "Entrar em residência".  
- [ ] CA-2: "Residências" me leva à lista de residências das quais participo.  
- [ ] CA-3: "Criar residência" me leva à tela de criação.  
- [ ] CA-4: "Entrar em residência" me leva à tela de entrada por código.  
- [ ] CA-5: Se eu não estiver autenticado, sou redirecionado para o login.

**Regras de negócio**

- **RN-001:** A rota `/app` exige sessão ativa.

**Notas técnicas**

- Rota: `/app`  
- ⬜ **A definir:** o menu deve destacar visualmente alguma opção quando o usuário ainda não pertence a nenhuma residência? Minha resposta: **Não, não deve destacar.**

**Cenários BDD relacionados:** CEN-001.1, CEN-001.2

---

### US-002 — Criar uma residência

**Vinculada a:** FEAT-005 | **Prioridade:** Must | **Status:** Concluído | **Origem:** 📄

> Como **usuário autenticado**, quero **criar uma residência informando um nome**, para que **eu possa reunir outras pessoas e compartilhar as despesas da casa**.

**Critérios de aceitação**

- [ ] CA-1: A tela de criação apresenta o campo "Nome da residência".  
- [ ] CA-2: Ao submeter um nome válido, a residência é criada com `id` (chave primária) e `code` único.  
- [ ] CA-3: O usuário que criou torna-se automaticamente o **Owner** e o primeiro membro.  
- [ ] CA-4: Após a criação, é exibido um modal de sucesso com a mensagem de confirmação.  
- [ ] CA-5: O modal oferece duas ações: **convidar usuários** (ícone) e **confirmar** (ícone).  
- [ ] CA-6: Ao clicar em "confirmar", o modal fecha e o usuário é levado ao painel da residência.  
- [ ] CA-7: Nome inválido bloqueia a criação e exibe mensagem de erro junto ao campo.

**Regras de negócio**

- **RN-002:** O `code` é único em todo o sistema, curto e gerado pelo sistema(nunca informado pelo usuário). 📄  
- **RN-003 ⬜:** Restrições do nome da residência\*\*:\*\* obrigatório; 3 a 40 caracteres; letras, números, espaços e acentos; sem espaços no início/fim; não pode ser só espaços.  
- **RN-004 ⬜:** Formato do `code`.**:** 6 caracteres alfanuméricos maiúsculos, excluindo caracteres ambíguos (`O`, `0`, `I`, `1`) para facilitar a leitura e a digitação manual.  
- **RN-005 ⬜:** Um usuário pode criar quantas residências?**:** sem limite na V2.0, mas registrar como ponto de atenção para abuso.  
- **RN-006 :** Nomes de residência **não** precisam ser únicos — a identificação é feita pelo `code`.

**Notas técnicas**

- Rota: `/app/residences (POST nessa rota deve criar a residência)`  
- Entidades: cria `Residence`, cria `Membership` do criador com papel `OWNER`.  
- Geração do `code`: deve tratar colisão (tentar novamente até obter um código livre).

**Cenários BDD relacionados:** CEN-002.1, CEN-002.2, CEN-002.3

---

### US-003 — Listar as residências das quais participo

**Vinculada a:** FEAT-006 | **Prioridade:** Must | **Status:** Concluído | **Origem:** 📄

> Como **membro**, quero **ver a lista das residências às quais pertenço**, para que **eu possa escolher em qual delas quero trabalhar**.

**Critérios de aceitação**

- [ ] CA-1: A lista é vertical, com um container por residência.  
- [ ] CA-2: Cada container exibe o **nome da residência** como título principal.  
- [ ] CA-3: Cada container exibe o **nome do criador** como título secundário, precedido de um ícone que remete a criador/administrador.  
- [ ] CA-4: Cada container possui o botão **copiar código** (ícone de copiar).  
- [ ] CA-5: Cada container possui o botão **ver residência** (ícone de seta para a direita), que navega para `/app/residences/{code}`.  
- [ ] CA-6: Se o usuário não pertence a nenhuma residência, é exibida a mensagem **"Você não está cadastrado em nenhuma residência"**.  
- [ ] CA-7: A lista inclui as residências que o próprio usuário criou.

**Regras de negócio**

- **RN-007:** A lista contém exclusivamente residências das quais o usuário é membro ativo. 📄  
- **RN-008 ⬜:** Ordenação da lista.**:** mais recentemente acessada primeiro; na falta desse dado, ordem de entrada na residência.

**Notas técnicas**

- Rota: `/app/residences`  
- ⬜ **A definir:** haverá paginação? **Sim:** 5 por página

**Cenários BDD relacionados:** CEN-003.1, CEN-003.2

---

### US-004 — Copiar o código da residência

**Vinculada a:** FEAT-007 | **Prioridade:** Should | **Status:** Concluído | **Origem:** 📄

> Como **membro**, quero **copiar o código da residência com um clique**, para que **eu possa compartilhá-lo rapidamente com quem quero convidar**.

**Critérios de aceitação**

- [ ] CA-1: Clicar no ícone de copiar coloca o `code` na área de transferência.  
- [ ] CA-2: Uma confirmação visual é exibida após a cópia (ex.: "Código copiado\!").  
- [ ] CA-3: Se o navegador negar acesso à área de transferência, o código é exibido para cópia manual.

**Cenários BDD relacionados:** CEN-004.1

---

### US-005 — Acessar o painel de uma residência

**Vinculada a:** FEAT-008 | **Prioridade:** Must | **Status:** Concluído | **Origem:** 📄

> Como **membro**, quero **abrir o painel de uma residência específica**, para que **eu possa consultar ou cadastrar despesas dela**.

**Critérios de aceitação**

- [ ] CA-1: A rota é `/app/residences/{code}`.  
- [ ] CA-2: O **nome da residência** é o título principal da tela.  
- [ ] CA-3: O **código** é o título secundário.  
- [ ] CA-4: A tela apresenta os botões "Consultar despesas" e "Cadastrar despesas".  
- [ ] CA-5: Se o usuário **não é membro** da residência, o acesso é negado.  
- [ ] CA-6: Se o código não corresponde a nenhuma residência, é exibida uma página de não encontrado.

**Regras de negócio**

- **RN-009 :** A rota é identificada pelo `code`, não pelo `id`. O `id` não deve ser exposto na URL.  
- **RN-010:** Um não-membro que acessa a URL diretamente deve receber a **mesma** resposta de "não encontrado" dada a um código inexistente — assim não é possível descobrir quais códigos existem testando URLs.

**Cenários BDD relacionados:** CEN-005.1, CEN-005.2, CEN-005.3

---

### ⬜ Proposta: o que exibir no painel da residência

> **Aguardando aprovação.** Com a lista de membros movida para `/app/residences/{code}/members`, o painel ficou com espaço livre. As opções abaixo são sugestões minhas 💡 — nenhuma foi implementada.

O painel é a primeira tela que alguém abre ao entrar na casa, então ele deveria responder *"como estamos este mês?"* sem exigir mais um clique.

| # | Proposta | O que mostraria | Dados necessários | Esforço |
| :---- | :---- | :---- | :---- | :---- |
| P-1 | **Resumo da competência aberta** | Total gasto no mês, quantidade de lançamentos e quanto cada membro já lançou, em barras proporcionais | Nenhum dado novo — já existe em `Expense` | Baixo |
| P-2 | **Atividade recente** | "Marina lançou Conta de luz (R$ 180,50) há 2 horas", com os últimos 5 eventos | `Expense.createdAt` + `createdBy` já existem | Baixo |
| P-3 | **Comparativo com o mês anterior** | Uma linha: "R$ 1.240 neste mês, 12% acima de julho" | Nenhum dado novo | Baixo |
| P-4 | **Situação do fechamento** | Há quanto tempo o mês está aberto e, para o owner, um aviso quando o mês do calendário já virou e ele ainda não fechou | `MonthClosure` já existe | Baixo |
| P-5 | **Gráfico por categoria** | Rosca ou barras com a divisão de gastos da competência aberta | Nenhum dado novo, mas exige biblioteca de gráficos | Médio |
| P-6 | **Saldo entre membros** | Quanto cada um deve ou tem a receber para equilibrar as contas | Depende da regra de rateio (FEAT-029) | Alto |

**Minha recomendação 💡:** começar por **P-1 e P-2**. Juntas elas ocupam bem o espaço, respondem à pergunta principal de quem abre o painel e **não exigem nenhum dado novo no banco** — é só leitura do que o EP-04 já grava. P-3 e P-4 são de uma linha cada e cabem no mesmo bloco.

**Um limite importante da P-2:** hoje só as **despesas** têm registro de autoria e data. Entradas e saídas de membros, mudanças de nome e fechamentos não deixam rastro consultável — isso é a trilha de auditoria da **FEAT-031**, que está fora do escopo da V2.0. Então a "atividade recente" nasceria cobrindo só lançamentos de despesa. Se você quiser um histórico completo de ações, a FEAT-031 precisa vir antes.

**P-5** eu deixaria para depois: ela é essencialmente a FEAT-026 (relatório por categoria) antecipada, e faz mais sentido nascer já na tela de relatórios, com o comparativo entre meses junto.

**P-6** depende da FEAT-029, que ainda não tem regra de rateio definida — não dá para estimar antes disso.

---

### US-013 — Sair de uma residência

**Vinculada a:** FEAT-009 | **Prioridade:** Should | **Status:** Concluído | **Origem:** 💡

> Como **membro**, quero **sair de uma residência da qual não faço mais parte**, para que **eu não continue vendo as despesas de uma casa onde não moro mais**.

**Critérios de aceitação**

- [ ] CA-1: O membro encontra a opção de sair nas configurações da residência.  
- [ ] CA-2: A saída exige uma confirmação explícita antes de ser efetivada.  
- [ ] CA-3: Após sair, a residência deixa de aparecer na lista do usuário.  
- [ ] CA-4: Após sair, o usuário perde o acesso à rota da residência.  
- [ ] CA-5: O owner não vê a opção de sair enquanto for o criador da residência.  
- [ ] CA-6: O usuário pode voltar a entrar depois, pelo fluxo normal de código ou convite.

**Regras de negócio**

- **RN-021 :** O owner não pode sair da própria residência. Para sair, precisa antes transferir a propriedade (FEAT-011). Isso preserva a RN-017 — toda residência tem exatamente um owner.  
- **RN-022 :** O que acontece com as despesas já lançadas por quem saiu?**:** as despesas permanecem na residência e deixam de ser editáveis., mas as despesas cadastradas no mês atual que ainda não fechou devem ser apagadas.  
- **RN-023 :** Sair é sempre decisão do próprio membro. Tirar outra pessoa da residência é a FEAT-010 e é ação exclusiva do owner.

**Notas técnicas**

- Entidades: remove o `Membership` do par usuário \+ residência.  
- ⬜ **RN-022 está implementada pela metade:** a remoção do vínculo já funciona, mas o descarte das despesas do mês em aberto ainda não pode ser aplicado, porque `Expense` não aponta para `Residence`/`User` (dependência D-02, EP-04). O mesmo vale para a RN-026, na US-014.

**Cenários BDD relacionados:** CEN-013.1, CEN-013.2, CEN-013.3

---

### US-014 — Remover um membro da residência

**Vinculada a:** FEAT-010 | **Prioridade:** Could | **Status:** Concluído | **Origem:** 💡

> Como **owner**, quero **remover um membro da minha residência**, para que **quem não mora mais na casa deixe de ter acesso às despesas dela**.

**Critérios de aceitação**

- [ ] CA-1: O owner visualiza a lista de membros da residência.  
- [ ] CA-2: Cada membro, exceto o próprio owner, apresenta a opção de remover.  
- [ ] CA-3: A remoção exige confirmação explícita, com o nome do membro na mensagem.  
- [ ] CA-4: Após a remoção, o ex-membro perde o acesso e a residência some da lista dele.  
- [ ] CA-5: O owner não consegue remover a si mesmo.  
- [ ] CA-6: Um membro comum não vê nem consegue executar a ação de remover.  
- [ ] CA-7: O membro removido é notificado.

**Regras de negócio**

- **RN-024 :** Apenas o owner remove membros — mesma autoridade que decide entradas (RN-017).  
- **RN-025:** O membro removido pode solicitar entrada de novo?**:** sim, mas passando pela aprovação normal do owner, que pode recusar. Bloquear para sempre exigiria uma lista de banidos que não se justifica nesta release.  
- **RN-026:** As despesas do membro removido seguem a mesma regra da RN-022.

**Cenários BDD relacionados:** CEN-014.1, CEN-014.2, CEN-014.3, CEN-014.4

---

### US-015 — Transferir a propriedade da residência

**Vinculada a:** FEAT-011 | **Prioridade:** Could | **Status:** Concluído | **Origem:** 💡

> Como **owner**, quero **transferir a propriedade da residência para outro membro**, para que **a casa continue tendo um responsável quando eu deixar de ser o dono**.

**Critérios de aceitação**

- [ ] CA-1: O owner escolhe o novo dono entre os membros atuais da residência.  
- [ ] CA-2: A transferência exige confirmação explícita, com o nome do novo dono.  
- [ ] CA-3: Após a transferência, o membro escolhido passa a ser o owner.  
- [ ] CA-4: Após a transferência, o antigo owner permanece na residência como membro comum.  
- [ ] CA-5: A residência continua com exatamente um owner.  
- [ ] CA-6: Um membro comum não consegue transferir a propriedade.  
- [ ] CA-7: O novo owner é notificado. 💡

**Regras de negócio**

- **RN-027:** O destino da transferência precisa ser um membro ativo da residência — não é possível transferir para alguém de fora.  
- **RN-028 :** A transferência exige aceite do destinatário?**:** não. Owner e membros são pessoas da mesma casa, e um aceite pendente deixaria a residência temporariamente sem dono definido.  
- **RN-029:** Depois de transferir, o antigo owner passa a poder sair da residência (RN-021).

**Notas técnicas**

- Entidades: altera `Residence.ownerId` e o `role` de dois `Membership` na mesma transação, para nunca existir zero ou dois owners.

**Cenários BDD relacionados:** CEN-015.1, CEN-015.2, CEN-015.3, CEN-015.4

---

### US-019 — Renomear a residência

**Vinculada a:** FEAT-012 | **Prioridade:** Could | **Status:** Concluído | **Origem:** 💡

> Como **owner**, quero **alterar o nome da residência**, para que **eu possa corrigir um erro de digitação ou refletir uma mudança de casa**.

**Critérios de aceitação**

- [ ] CA-1: Apenas o owner enxerga a opção de renomear.  
- [ ] CA-2: O campo vem preenchido com o nome atual.  
- [ ] CA-3: O novo nome passa pelas mesmas validações da criação (RN-003).  
- [ ] CA-4: Após salvar, o novo nome aparece na lista e no painel para todos os membros.  
- [ ] CA-5: Um nome inválido bloqueia a alteração e mantém o nome anterior.  
- [ ] CA-6: O código da residência não muda ao renomear.

**Regras de negócio**

- **RN-030:** Renomear não altera o `code`. Códigos já compartilhados continuam válidos.  
- **RN-031:** Apenas o owner renomeia.

**Cenários BDD relacionados:** CEN-019.1, CEN-019.2, CEN-019.3

---

### US-020 — Arquivar uma residência

**Vinculada a:** FEAT-012 | **Prioridade:** Could | **Status:** Concluído | **Origem:** 💡

> Como **owner**, quero **arquivar uma residência que não está mais em uso**, para que **ela saia do meu dia a dia sem que eu perca o histórico de despesas**.  
>   
> ✅ **Comportamento definido.** As perguntas Q-7 a Q-12 foram respondidas seguindo as sugestões propostas, e os critérios de aceitação abaixo refletem o que foi implementado.

**Decisões tomadas (Q-7 a Q-12):**

| \# | Pergunta | Sugestão do Claude 💡 |
| :---- | :---- | :---- |
| Q-7 | A residência arquivada some da lista ou aparece separada? | Aparece em uma seção "Arquivadas", recolhida. Sumir passa a impressão de que os dados foram perdidos. |
| Q-8 | Os membros ainda conseguem abrir o painel? | Sim, em modo somente leitura. |
| Q-9 | É possível lançar despesas em residência arquivada? | Não. É justamente o que "arquivar" significa. |
| Q-10 | É possível desarquivar? | Sim, e apenas o owner pode. |
| Q-11 | Convites e solicitações continuam funcionando? | Não. Arquivar congela a entrada de novos membros. |
| Q-12 | Quem pode arquivar? | Apenas o owner. |

**Critérios de aceitação**

- [ ] CA-1: Apenas o owner enxerga as opções de arquivar e desarquivar (Q-12).  
- [ ] CA-2: O arquivamento exige confirmação explícita, avisando que a residência ficará somente leitura.  
- [ ] CA-3: Após arquivar, a residência sai da lista principal e passa a aparecer na seção "Arquivadas" (Q-7).  
- [ ] CA-4: A seção "Arquivadas" vem recolhida e exibe a quantidade de residências arquivadas.  
- [ ] CA-5: Todos os membros continuam conseguindo abrir o painel de uma residência arquivada (Q-8).  
- [ ] CA-6: O painel de uma residência arquivada exibe um selo indicando o estado somente leitura.  
- [ ] CA-7: Não é possível cadastrar despesas em uma residência arquivada (Q-9).  
- [ ] CA-8: Enquanto arquivada, o owner não consegue renomear, remover membros nem transferir a propriedade.  
- [ ] CA-9: O owner consegue desarquivar, e a residência volta para a lista principal (Q-10).  
- [ ] CA-10: Um membro comum não consegue arquivar nem desarquivar, mesmo acionando a ação diretamente.  
- [ ] CA-11 💡: Um membro **consegue** sair de uma residência arquivada. *Sem isso ele ficaria preso nela para sempre, já que o owner não pode removê-lo enquanto ela estiver arquivada.*  
- [ ] CA-12 ⬜: Convites e solicitações de entrada ficam bloqueados enquanto a residência estiver arquivada (Q-11). *Só poderá ser testado depois das FEAT-013 e FEAT-014.*

**Regras de negócio**

- **RN-032:** Residência arquivada é somente leitura: não aceita novas despesas, renomeação, remoção de membros nem transferência de propriedade. A única ação de escrita permitida é desarquivar (owner) ou sair da residência (membro).  
- **RN-033 :** Apenas o owner arquiva e desarquiva.

**Cenários BDD relacionados:** CEN-020.1, CEN-020.2 *(rascunho — ver seção 3.15)*

---

## 2.4 Estórias — EP-03: Convites e Solicitações

### US-006 — Solicitar entrada em uma residência por código

**Vinculada a:** FEAT-013 | **Prioridade:** Must | **Status:** Concluído | **Origem:** 📄

> Como **usuário autenticado**, quero **informar o código de uma residência para pedir para entrar**, para que **eu possa participar da casa em que moro e lançar minhas despesas**.

**Critérios de aceitação**

- [ ] CA-1: A tela apresenta um campo para inserir o código da residência.  
- [ ] CA-2: Se a residência existe, uma **solicitação de entrada** é enviada ao Owner.  
- [ ] CA-3: O usuário recebe confirmação de que a solicitação foi enviada e fica aguardando resposta.  
- [ ] CA-4: Se o código não existe, é exibida mensagem de erro e nenhuma solicitação é criada.  
- [ ] CA-5: Se o usuário já é membro daquela residência, o sistema informa isso e não cria solicitação.  
- [ ] CA-6: Se já existe uma solicitação pendente do usuário para aquela residência, o sistema não cria uma duplicada.

**Regras de negócio**

- **RN-011:** A entrada **nunca** é automática — depende sempre da aprovação do Owner. 📄  
- **RN-012 :** O código deve ser tratado sem diferenciar maiúsculas de minúsculas e ignorando espaços nas pontas, para tolerar erros de digitação e colagem.  
- **RN-013 :** Uma solicitação recusada pode ser refeita, mas sujeita a um intervalo mínimo de uma hora, para evitar insistência abusiva.

**Notas técnicas**

- Rota: `/app/residences/join`  
- Entidades: cria `JoinRequest` com status `PENDING`.  
- Ver **FEAT-020** (proteção contra tentativa em massa de códigos).

**Cenários BDD relacionados:** CEN-006.1, CEN-006.2, CEN-006.3, CEN-006.4

---

### US-007 — Convidar um usuário para a residência

**Vinculada a:** FEAT-014 | **Prioridade:** Must | **Status:** Concluído | **Origem:** 📄 | **Depende de:** D-01 / FEAT-003

> Como **owner**, quero **convidar um usuário pelo nome de usuário**, para que **ele entre na residência sem precisar que eu passe o código por fora do app**.

**Critérios de aceitação**

- [ ] CA-1: O modal de sucesso da criação oferece a ação "convidar usuários".  
- [ ] CA-2: A ação abre um modal com um campo para informar o **nome de usuário**.  
- [ ] CA-3: Ao confirmar, o usuário informado recebe uma notificação de convite.  
- [ ] CA-4: Se o nome de usuário não existe, é exibida mensagem de erro e nenhum convite é criado.  
- [ ] CA-5: Se o usuário já é membro, o sistema informa e não cria o convite.  
- [ ] CA-6: Se já existe convite pendente para aquele usuário, não é criado outro.  
- [ ] CA-7: O convite também pode ser enviado a partir do painel da residência, não só logo após a criação.

**Regras de negócio**

- **RN-014:** Apenas o Owner pode convidar. 📄  
- **RN-015 :** Convite expira?**:** sim, em 7 dias, para não deixar convites pendentes indefinidamente.

**Cenários BDD relacionados:** CEN-007.1, CEN-007.2

---

### US-008 — Responder a um convite recebido

**Vinculada a:** FEAT-015 | **Prioridade:** Must | **Status:** Concluído | **Origem:** 📄

> Como **usuário autenticado convidado**, quero **aceitar ou recusar um convite de residência**, para que **eu só participe das casas que realmente me dizem respeito**.

**Critérios de aceitação**

- [ ] CA-1: O usuário convidado visualiza o convite recebido, com o nome da residência e quem convidou.  
- [ ] CA-2: Ao **aceitar**, o usuário passa a ser membro e a residência aparece na sua lista.  
- [ ] CA-3: Ao **recusar**, nenhum vínculo é criado e o convite deixa de estar pendente.  
- [ ] CA-4: Um convite já respondido não pode ser respondido novamente.

**Regras de negócio**

- **RN-016 :** Aceitar convite dispensa aprovação do Owner — ele já manifestou a intenção ao convidar.

**Cenários BDD relacionados:** CEN-008.1, CEN-008.2

---

### US-009 — Responder a uma solicitação de entrada

**Vinculada a:** FEAT-016 | **Prioridade:** Must | **Status:** Concluído | **Origem:** 📄

> Como **owner**, quero **aceitar ou recusar as solicitações de entrada na minha residência**, para que **somente pessoas autorizadas vejam as despesas da casa**.

**Critérios de aceitação**

- [ ] CA-1: O Owner visualiza as solicitações pendentes com o nome do solicitante.  
- [ ] CA-2: Ao **aceitar**, o solicitante passa a ser membro da residência.  
- [ ] CA-3: Ao **recusar**, nenhum vínculo é criado e a solicitação deixa de estar pendente.  
- [ ] CA-4: O solicitante é notificado da decisão.  
- [ ] CA-5: Um usuário que não é o Owner não consegue responder solicitações.

**Regras de negócio**

- **RN-017:** Cada residência tem exatamente um Owner, e apenas ele decide sobre entradas. 📄

**Cenários BDD relacionados:** CEN-009.1, CEN-009.2, CEN-009.3

---

### US-016 — Ver minhas notificações pelo sino da navbar

**Vinculada a:** FEAT-017 | **Prioridade:** Should | **Status:** Concluído | **Origem:** 💡

> Como **usuário autenticado**, quero **ver um sino na barra de navegação com as minhas notificações**, para que **eu perceba convites, decisões e avisos sem precisar procurar em cada tela do sistema**.

**Critérios de aceitação**

- [ ] CA-1: A navbar exibe um ícone de sino para o usuário autenticado.  
- [ ] CA-2: Havendo notificações não lidas, o sino exibe um indicador com a quantidade.  
- [ ] CA-3: Ao clicar no sino, abre um painel com as notificações mais recentes.  
- [ ] CA-4: Cada notificação exibe um texto descritivo e o momento em que ocorreu.  
- [ ] CA-5: O painel distingue visualmente as não lidas das já lidas.  
- [ ] CA-6: Sem nenhuma notificação, o painel exibe uma mensagem de estado vazio.  
- [ ] CA-7: O painel apresenta, ao final, a opção **"Mostrar tudo"**.  
- [ ] CA-8: "Mostrar tudo" leva à tela dedicada de notificações (US-021).  
- [ ] CA-9: O sino não aparece para quem não está autenticado.  
- [ ] CA-10: Clicar em uma notificação leva ao contexto dela (ex.: um convite leva à tela onde ele é respondido).

**Regras de negócio**

- **RN-034:** Cada usuário vê exclusivamente as próprias notificações.  
- **RN-035 :** Quantas notificações o painel do sino mostra?: as 5 mais recentes. O painel é um alerta, não um histórico — o resto fica na tela dedicada.  
- **RN-036:** Quando uma notificação passa a contar como lida?**:** ao abrir o painel, as que estão visíveis são marcadas como lidas.  
- **RN-037:** O catálogo de tipos é extensível. A central **não** é exclusiva de convites e solicitações — qualquer área do sistema pode publicar notificações nela.  
- **RN-038 :** As ações (aceitar/recusar) acontecem dentro da própria notificação ou apenas no destino?**:** apenas no destino nesta release. Duplicar a ação em dois lugares dobra o esforço e o risco de estados divergentes.

**Notas técnicas**

- Entidade nova `Notification`, com: destinatário, tipo, estado de leitura, data e os dados necessários para montar o texto e o link de destino.  
- **A notificação deve ser genérica desde o começo.** Modelar em cima de convites e depois generalizar custaria uma migração e a reescrita das telas.  
- Esta funcionalidade **destrava** os critérios "é notificado" que hoje estão parados: CA-7 da US-014, CA-7 da US-015 e CA-4 da US-009.

**Catálogo inicial de tipos de notificação** 💡

| Tipo | Quando ocorre | Quem recebe | Origem |
| :---- | :---- | :---- | :---- |
| `INVITE_RECEIVED` | Owner convida um usuário (FEAT-014) | O convidado | 📄 |
| `JOIN_REQUEST_RECEIVED` | Usuário solicita entrada por código (FEAT-013) | O owner | 📄 |
| `JOIN_REQUEST_ACCEPTED` | Owner aceita a solicitação (FEAT-016) | O solicitante | 📄 |
| `JOIN_REQUEST_DECLINED` | Owner recusa a solicitação (FEAT-016) | O solicitante |  |
| `MEMBER_REMOVED` | Owner remove um membro (US-014) | O membro removido |  |
| `OWNERSHIP_TRANSFERRED` | Propriedade é transferida (US-015) | O novo owner |  |
| `MONTH_CLOSED` | A conta do mês é fechada | Todos os membros da residência |  |

> ⬜ **`MONTH_CLOSED` ainda não tem origem no sistema.** Não existe o conceito de "fechamento de mês" no modelo atual — ele nasce junto com o EP-04/EP-05. O tipo fica registrado aqui para que o modelo de notificações já seja desenhado para recebê-lo.

**Cenários BDD relacionados:** CEN-016.1 a CEN-016.5

---

### US-021 — Ver o histórico completo de notificações

**Vinculada a:** FEAT-017 | **Prioridade:** Should | **Status:** Concluído | **Origem:** 💡

> Como **usuário autenticado**, quero **abrir uma tela dedicada com todas as minhas notificações**, para que **eu consiga rever avisos antigos que já saíram do painel do sino**.

**Critérios de aceitação**

- [ ] CA-1: Existe uma rota dedicada às notificações do usuário.  
- [ ] CA-2: A tela lista todas as notificações, da mais recente para a mais antiga.  
- [ ] CA-3: A tela distingue visualmente as não lidas das já lidas.  
- [ ] CA-4: Sem nenhuma notificação, a tela exibe uma mensagem de estado vazio.  
- [ ] CA-5: A tela oferece a opção de marcar todas como lidas.  
- [ ] CA-6: Clicar em uma notificação leva ao contexto dela.  
- [ ] CA-7: A tela é alcançada pela opção "Mostrar tudo" do painel do sino.  
- [ ] CA-8: Um usuário não consegue ver as notificações de outro.

**Regras de negócio**

- **RN-039 :** Qual a rota?**:** `/app/alerts`, mantendo o padrão em inglês já usado em `/app/residences`.  
- **RN-040 :** A tela pagina ou carrega tudo?**:** paginar a partir de 20 itens. Notificação acumula rápido, diferente de residência.  
- **RN-041 :** Notificações antigas são descartadas em algum momento?**:** não nesta release, mas registrar como ponto de atenção de crescimento da tabela.

**Cenários BDD relacionados:** CEN-021.1 a CEN-021.4

---

### US-022 — Cancelar um convite ou uma solicitação pendente

**Vinculada a:** FEAT-018 | **Prioridade:** Could | **Status:** Concluído | **Origem:** 💡

> Como **quem enviou um convite ou uma solicitação de entrada**, quero **cancelá-lo enquanto ainda estiver pendente**, para que **eu possa desfazer um envio equivocado antes que a outra pessoa responda**.

**Critérios de aceitação**

- [ ] CA-1: O owner visualiza os convites que enviou e que continuam pendentes.  
- [ ] CA-2: O owner consegue cancelar um convite pendente.  
- [ ] CA-3: O usuário visualiza as solicitações de entrada que enviou e continuam pendentes.  
- [ ] CA-4: O usuário consegue cancelar uma solicitação pendente.  
- [ ] CA-5: Após o cancelamento, o convite ou a solicitação deixa de aparecer para o destinatário.  
- [ ] CA-6: Não é possível cancelar algo que já foi aceito ou recusado.  
- [ ] CA-7: Ninguém consegue cancelar convite ou solicitação de outra pessoa.  
- [ ] CA-8: Depois de cancelar, é possível enviar um novo convite ou uma nova solicitação para o mesmo destino.

**Regras de negócio**

- **RN-042:** Apenas quem originou pode cancelar — o owner cancela convites que enviou, o solicitante cancela as próprias solicitações.  
- **RN-043:** O cancelamento só é permitido enquanto o estado for pendente. Aceito ou recusado é um desfecho final.  
- **RN-044 :** O destinatário é notificado do cancelamento?**:** não. Seria ruído sobre algo em que ele nunca chegou a agir — basta a pendência desaparecer.

**Cenários BDD relacionados:** CEN-022.1 a CEN-022.5

---

### US-017 — Regenerar o código da residência

**Vinculada a:** FEAT-019 | **Prioridade:** Could | **Status:** Concluído | **Origem:** 💡

> Como **owner**, quero **gerar um novo código para a minha residência**, para que **um código que vazou ou foi compartilhado com a pessoa errada deixe de servir para pedir entrada**.

**Critérios de aceitação**

- [ ] CA-1: Apenas o owner enxerga a opção de gerar um novo código.  
- [ ] CA-2: A ação exige confirmação explícita, avisando que o código atual deixará de funcionar.  
- [ ] CA-3: Após confirmar, a residência passa a ter um código diferente do anterior.  
- [ ] CA-4: O código anterior deixa de ser aceito no fluxo de entrada por código.  
- [ ] CA-5: O novo código segue o mesmo formato da criação (RN-004) e continua único no sistema.  
- [ ] CA-6: Os membros atuais permanecem na residência — regenerar não desliga ninguém.  
- [ ] CA-7: A lista de residências e o painel passam a exibir o novo código para todos os membros.  
- [ ] CA-8: Um membro comum não consegue regenerar o código.  
- [ ] CA-9: Não é possível regenerar o código de uma residência arquivada (RN-032).

**Regras de negócio**

- **RN-045:** Apenas o owner regenera o código — mesma autoridade das demais ações de gestão.  
- **RN-046:** O novo código é gerado pelo sistema, nunca escolhido pelo usuário (RN-002).  
- **RN-047:** Regenerar não altera a composição de membros da residência.  
- **RN-048:** As solicitações de entrada pendentes, feitas com o código antigo, continuam valendo?**:** **não** — cancelar todas as pendentes. Se o motivo de regenerar é um vazamento, manter pendências originadas do código vazado contradiz a intenção da ação.

**Notas técnicas**

- ⚠️ **A URL da residência muda.** A rota é `/app/residences/{code}` (RN-009), então regenerar troca o endereço da tela. Depois de confirmar, o owner precisa ser redirecionado para a nova URL, e qualquer link antigo passa a cair na página de não encontrado — que é o comportamento correto, e o mesmo dado a um código inexistente (RN-010).  
- Reaproveita o gerador de código já existente, incluindo o tratamento de colisão.

**Cenários BDD relacionados:** CEN-017.1 a CEN-017.5

---

### US-023 — Proteger a entrada por código contra tentativa em massa

**Vinculada a:** FEAT-020 | **Prioridade:** Should | **Status:** Concluído | **Origem:** 💡

> Como **owner**, quero **que o sistema limite tentativas repetidas de entrada por código**, para que **ninguém encontre a minha residência testando códigos até acertar**.

**Critérios de aceitação**

- [ ] CA-1: Após um número limite de tentativas malsucedidas dentro de uma janela de tempo, novas tentativas do mesmo usuário são recusadas temporariamente.  
- [ ] CA-2: Durante o bloqueio, a tela informa que houve tentativas demais e que ele deve aguardar.  
- [ ] CA-3: O bloqueio expira sozinho ao fim da janela, sem intervenção de ninguém.  
- [ ] CA-4: Uma tentativa bem-sucedida zera o contador do usuário.  
- [ ] CA-5: O bloqueio recai sobre quem tenta, nunca sobre a residência alvo.  
- [ ] CA-6: A mensagem de erro não revela se o código digitado existe ou não.  
- [ ] CA-7: O bloqueio não impede o usuário de usar o resto do sistema — só o fluxo de entrada por código.

**Regras de negócio**

- **RN-049 :** Qual o limite e a janela?**:** 10 tentativas malsucedidas em 15 minutos, com bloqueio de 15 minutos.  
- **RN-050:** A resposta a um código inválido é sempre a mesma, exista ele ou não. O limite existe justamente para dificultar a enumeração — a mensagem não pode entregar aquilo que ele protege (mesmo princípio da RN-010).  
- **RN-051 :** O limite é por usuário, por IP, ou os dois?**:** por usuário autenticado. A rota já exige login, o que torna a contagem simples e confiável; limitar por IP quebraria em redes compartilhadas e traria pouco ganho.  
- **RN-052 :** Onde o contador fica guardado?**:** em tabela no banco. Contador em memória não sobrevive a reinício do processo nem funciona com mais de uma instância da aplicação — e a V2.0 já prevê deploy em container.

**Notas técnicas**

- **Dimensionamento:** o código tem 6 caracteres em um alfabeto de 32 (RN-004), o que dá cerca de **1,07 bilhão de combinações**. Adivinhar por força bruta já é impraticável; esta funcionalidade é defesa em profundidade. Por isso o limite pode ser generoso o bastante para nunca atrapalhar quem só errou a digitação.  
- **Depende da FEAT-013**, que é o fluxo que ela protege. Implementar antes não teria o que limitar.

**Cenários BDD relacionados:** CEN-023.1 a CEN-023.4

---

## 2.5 Estórias — EP-04: Despesas

### US-010 — Cadastrar minhas despesas na residência

**Vinculada a:** FEAT-021 | **Prioridade:** Must | **Status:** Concluído | **Origem:** 📄

> Como **membro**, quero **cadastrar minhas próprias despesas quando eu quiser**, para que **eu não dependa de outra pessoa lançar tudo de uma vez**.

**Critérios de aceitação**

- [ ] CA-1: O membro cadastra despesas informando, no mínimo, nome, valor, categoria (alimentação, despesas domesticas, assinaturas, lazer).  
- [ ] CA-2: O lançamento é **incremental** — o membro pode cadastrar uma despesa por vez, em momentos diferentes do mês.  
- [ ] CA-3: A despesa fica vinculada à residência e ao membro que a lançou.  
- [ ] CA-4: Valores inválidos (zero, negativo, não numérico) são rejeitados com mensagem clara.  
- [ ] CA-5: Ao cadastrar, o membro seleciona uma **categoria**.  *(FEAT-024 — pré-requisito dos relatórios)*

**Regras de negócio**

- **RN-018:** Um membro lança despesas **apenas** em residências às quais pertence. 📄  
- **RN-019 :** Um membro pode lançar despesa em nome de outro?**:** não na V2.0 — cada um lança as suas. Isso mantém a autoria confiável para o rateio futuro (FEAT-029).  
- **RN-020 :** É permitido lançar despesa em competência passada ou futura?: as despesas lançadas serão cadastradas no mês corrente que ainda não foi fechado.

**Notas técnicas**

- Rota: `/app/residences/{code}/expenses/new`  
- Ver dependência **D-02** (remodelagem de `Expense`).

**Cenários BDD relacionados:** CEN-010.1, CEN-010.2, CEN-010.3

---

### US-011 — Consultar as despesas da residência

**Vinculada a:** FEAT-022 | **Prioridade:** Must | **Status:** Concluído | **Origem:** 📄

> Como **membro**, quero **consultar as despesas da residência**, para que **eu acompanhe quanto a casa está gastando**.  
>   
> ✅ **Comportamento definido.** As perguntas Q-1 a Q-6 foram respondidas seguindo as sugestões, e os critérios abaixo refletem o que foi implementado.

**Perguntas a responder antes de implementar:**

| \# | Pergunta | Sugestão do Claude 💡 |
| :---- | :---- | :---- |
| Q-1 | O membro vê as despesas de **todos** os membros ou só as suas? | Todos — a residência é um espaço compartilhado; a transparência é a razão de existir do recurso. |
| Q-2 | A consulta é sempre filtrada por competência (mês/ano)? | Sim, com o mês corrente pré-selecionado. |
| Q-3 | Qual o agrupamento padrão da visualização? | Por membro, com o total da residência em destaque. |
| Q-4 | Deve existir um total por membro e um total geral? | Sim, ambos. |
| Q-5 | Alguém pode editar/excluir despesa alheia? | Não — só o autor edita a própria (ver FEAT-023). |
| Q-6 | Existe estado vazio? | Sim: "Nenhuma despesa cadastrada nesta competência." |

**Critérios de aceitação**

- [ ] CA-1: A consulta é filtrada por competência, com a competência aberta pré-selecionada (Q-2).
- [ ] CA-2: O membro vê as despesas de todos os membros da residência (Q-1).
- [ ] CA-3: As despesas aparecem agrupadas por membro (Q-3).
- [ ] CA-4: Cada grupo exibe o total do membro, e a tela exibe o total da residência em destaque (Q-4).
- [ ] CA-5: Cada despesa exibe nome, categoria e valor.
- [ ] CA-6: Despesas recorrentes são identificadas visualmente.
- [ ] CA-7: Sem despesas na competência, é exibida a mensagem "Nenhuma despesa cadastrada nesta competência" (Q-6).
- [ ] CA-8: As ações de editar e excluir aparecem apenas nas despesas do próprio membro (Q-5).
- [ ] CA-9: Numa competência fechada, nenhuma despesa pode ser editada ou excluída.
- [ ] CA-10: Numa residência arquivada, a consulta funciona mas nada pode ser alterado.
- [ ] CA-11: O seletor de competência lista os meses com movimento e sempre inclui a competência aberta.

**Regras de negócio**

- **RN-053 💡:** Fechar o mês é ação do owner. Ao fechar, a competência vira somente leitura e os novos lançamentos passam para a competência seguinte.
- **RN-054 💡:** Um mês fechado pode ser reaberto pelo owner, mas **apenas o fechamento mais recente**. Reabrir um mês do meio deixaria buracos na sequência e quebraria a ideia de "conta acertada até tal mês".
- **RN-055 💡:** Reabrir uma competência passada a destrava para edição, mas **não muda onde os novos lançamentos caem** — eles seguem na competência aberta.
- **RN-056 💡:** O fechamento notifica todos os membros com `MONTH_CLOSED` e dispara a geração das despesas recorrentes (FEAT-025) na competência seguinte.

**Cenários BDD relacionados:** CEN-011.1 *(rascunho — ver seção 3.10)*

---

## 2.6 Estórias — EP-05: Relatórios e Análise

> Todas as estórias desta seção assumem uma tela dedicada de relatórios, em `/app/residences/{code}/reports`, com duas abas: **Residência** e **Meus gastos**. A competência é escolhida pelo mesmo seletor em grade já usado na consulta de despesas.

### US-024 — Consultar o relatório da residência por categoria

**Vinculada a:** FEAT-026 | **Prioridade:** Must | **Status:** Não iniciado | **Origem:** 💡

> Como **membro**, quero **ver quanto a casa gastou em cada categoria numa competência**, para que **eu entenda para onde está indo o dinheiro da residência**.

**Critérios de aceitação**

- [ ] CA-1: A tela abre na aba "Residência".
- [ ] CA-2: Cada categoria exibe o valor gasto e o percentual que representa do total.
- [ ] CA-3: As categorias aparecem da que mais gastou para a que menos gastou.
- [ ] CA-4: Categorias sem nenhum lançamento na competência não são exibidas.
- [ ] CA-5: O total da residência aparece em destaque.
- [ ] CA-6: A competência é escolhida pelo mesmo seletor da consulta de despesas.
- [ ] CA-7: Sem despesas na competência, é exibida uma mensagem de estado vazio.
- [ ] CA-8: Apenas membros da residência acessam a tela.

**Regras de negócio**

- **RN-057:** O relatório considera apenas despesas ativas — lançamentos excluídos (`deletedAt`) ficam de fora.
- **RN-058:** Os percentuais são calculados sobre o total da competência exibida, não sobre o histórico.
- **RN-059 💡:** Competências fechadas e abertas são igualmente consultáveis. Fechar o mês congela os lançamentos, não a leitura.

**Cenários BDD relacionados:** CEN-024.1 a CEN-024.3

---

### US-025 — Consultar o meu relatório pessoal

**Vinculada a:** FEAT-026 | **Prioridade:** Must | **Status:** Não iniciado | **Origem:** 💡

> Como **membro**, quero **ver onde eu gastei mais**, para que **eu entenda os meus próprios hábitos, e não só os da casa**.

**Critérios de aceitação**

- [ ] CA-1: A aba "Meus gastos" exibe apenas os lançamentos do próprio usuário.
- [ ] CA-2: A quebra por categoria segue o mesmo formato da aba da residência.
- [ ] CA-3: O total pessoal aparece em destaque.
- [ ] CA-4: É exibido o percentual que os meus gastos representam do total da casa.
- [ ] CA-5: Sem lançamentos meus na competência, é exibida uma mensagem de estado vazio.
- [ ] CA-6: Trocar de aba mantém a competência selecionada.

**Regras de negócio**

- **RN-060 ⬜:** O relatório pessoal soma todas as residências do usuário ou apenas a atual? **Sugestão 💡:** apenas a atual, já que a tela vive dentro da residência. Uma visão consolidada entre casas seria outra tela, fora do EP-05.

**Cenários BDD relacionados:** CEN-025.1, CEN-025.2

---

### US-026 — Comparar duas competências

**Vinculada a:** FEAT-027 | **Prioridade:** Should | **Status:** Não iniciado | **Origem:** 💡

> Como **membro**, quero **comparar o mês atual com outro mês**, para que **eu perceba se a casa está gastando mais do que antes e em quê**.

**Critérios de aceitação**

- [ ] CA-1: Por padrão, a comparação é entre a competência selecionada e a imediatamente anterior.
- [ ] CA-2: É possível escolher manualmente a competência de comparação.
- [ ] CA-3: A variação é exibida em valor absoluto e em percentual, no total e por categoria.
- [ ] CA-4: Aumentos e quedas são distinguidos visualmente.
- [ ] CA-5: Categoria que existia antes e sumiu aparece com queda de 100%.
- [ ] CA-6: Categoria que não existia antes aparece como "nova", sem percentual.
- [ ] CA-7: Se não houver competência anterior com dados, a comparação informa isso em vez de exibir números vazios.

**Regras de negócio**

- **RN-061 💡:** Quando a base de comparação é zero, o sistema **não** exibe percentual — divisão por zero não tem leitura útil. A categoria é marcada como nova.

**Cenários BDD relacionados:** CEN-026.1 a CEN-026.4

---

### US-027 — Visualizar os gráficos do relatório

**Vinculada a:** FEAT-028 | **Prioridade:** Should | **Status:** Não iniciado | **Origem:** 💡

> Como **membro**, quero **ver os gastos em gráfico**, para que **eu entenda a proporção entre as categorias de relance, sem ler tabela**.

**Critérios de aceitação**

- [ ] CA-1: Um gráfico mostra a composição da competência por categoria.
- [ ] CA-2: Um gráfico mostra a evolução do total ao longo das últimas competências.
- [ ] CA-3: Os gráficos respeitam a aba selecionada — residência ou pessoal.
- [ ] CA-4: Os mesmos valores continuam disponíveis em texto, para quem usa leitor de tela.
- [ ] CA-5: Os gráficos se adaptam à largura da tela no celular.
- [ ] CA-6: Sem dados na competência, o espaço do gráfico exibe o estado vazio em vez de um gráfico em branco.

**Regras de negócio**

- **RN-062 ⬜:** Quantas competências a evolução mostra? **Sugestão 💡:** as últimas 6, o suficiente para enxergar tendência sem poluir no celular.

**Notas técnicas**

- ⚠️ **A escolha da biblioteca precisa de validação antes de virar dependência.** O Recharts declara suporte a React 19 nas *peer dependencies*, mas há relatos abertos de gráficos que não renderizam em versões recentes do React 19 — e o projeto usa a 19.1.0. **Sugestão 💡:** validar com um teste pequeno antes de adotar; se houver atrito, o Chart.js (via `react-chartjs-2`) é a alternativa de menor risco, por desenhar em canvas e depender pouco dos internos do React.

**Cenários BDD relacionados:** CEN-027.1 a CEN-027.3

---

### US-028 — Ver o rateio entre os membros

**Vinculada a:** FEAT-029 | **Prioridade:** Must | **Status:** Não iniciado | **Origem:** 💡

> Como **membro**, quero **saber quanto eu devo pagar ou tenho a receber**, para que **a casa acerte as contas do mês sem discussão**.

**Critérios de aceitação**

- [ ] CA-1: A cota individual é o total da competência dividido pelo número de participantes.
- [ ] CA-2: Para cada participante, a tela exibe quanto ele gastou, qual é a cota e qual o saldo.
- [ ] CA-3: Quem gastou acima da cota aparece como quem **tem a receber**.
- [ ] CA-4: Quem gastou abaixo da cota aparece como quem **deve pagar**.
- [ ] CA-5: Quem não lançou nada aparece devendo a cota inteira.
- [ ] CA-6: A soma de todos os saldos é zero.
- [ ] CA-7: O rateio acompanha a competência selecionada.
- [ ] CA-8: Sem despesas na competência, o rateio informa que não há o que dividir.

**Regras de negócio**

- **RN-063:** A divisão é igual entre os participantes, como no cálculo da V1. Não há pesos nem cotas diferenciadas.
- **RN-064 ⬜:** Quem entrou no meio da competência paga cota cheia? **Sugestão 💡:** sim. Proporcional por dias exigiria registrar a data de entrada em cada competência e tornaria o número difícil de conferir na mão.
- **RN-065 ⬜:** **Quem entra na conta do rateio?** Este é o ponto mais delicado. Pela RN-022, um membro que sai mantém as despesas dos meses já fechados. Se o rateio dividir só entre os **membros atuais**, o total continua incluindo os gastos de quem saiu, e a cota de todo mundo infla indevidamente. **Sugestão 💡:** participar do rateio quem for membro atual **ou** tiver ao menos um lançamento na competência. **Ressalva:** a resposta totalmente correta exigiria histórico de participação (quem era membro em cada mês), que o modelo não guarda hoje.
- **RN-066 💡:** Arredondamento: como os valores são inteiros em centavos, a cota pode não dividir exatamente. A sobra de centavos deve ser distribuída de forma determinística, para que a soma dos saldos feche em zero.

**Cenários BDD relacionados:** CEN-028.1 a CEN-028.4

---

### US-029 — Exportar o relatório em CSV 💡

**Vinculada a:** FEAT-033 | **Prioridade:** Could | **Status:** Não iniciado | **Origem:** 💡

> Como **membro**, quero **baixar os lançamentos da competência em planilha**, para que **eu consiga conferir as contas fora do sistema ou guardar um registro próprio**.

**Critérios de aceitação**

- [ ] CA-1: A tela de relatórios oferece a ação de exportar.
- [ ] CA-2: O arquivo traz uma linha por despesa, com data, autor, nome, categoria e valor.
- [ ] CA-3: O arquivo respeita a competência e a aba selecionadas.
- [ ] CA-4: O nome do arquivo identifica a residência e a competência.
- [ ] CA-5: Valores saem em formato numérico utilizável em planilha.

**Regras de negócio**

- **RN-067 💡:** O CSV usa ponto e vírgula como separador e vírgula como decimal, que é o formato que o Excel em português abre sem pedir configuração.

**Cenários BDD relacionados:** CEN-029.1, CEN-029.2

---

### US-030 — Compartilhar o resumo do mês como imagem 💡

**Vinculada a:** FEAT-034 | **Prioridade:** Could | **Status:** Não iniciado | **Origem:** 💡

> Como **membro**, quero **gerar uma imagem do resumo do mês**, para que **eu consiga mandar no grupo da casa sem pedir que todos abram o sistema**.

**Critérios de aceitação**

- [ ] CA-1: A tela de relatórios oferece a ação de compartilhar.
- [ ] CA-2: A imagem contém o nome da residência, a competência, o total e o rateio por membro.
- [ ] CA-3: Em dispositivos compatíveis, a ação abre o compartilhamento nativo do sistema.
- [ ] CA-4: Onde não houver compartilhamento nativo, a imagem é baixada.
- [ ] CA-5: A imagem é legível em tela de celular.

**Notas técnicas**

- A imagem é **desenhada pelo próprio sistema em SVG** e rasterizada em PNG pelo canvas, sem capturar a tela. Isso garante que ela saia igual em qualquer navegador: não há CSS a reinterpretar nem fonte a adivinhar.
- A fonte viaja embutida em base64 dentro do SVG, porque o rasterizador do canvas não enxerga as fontes carregadas pela página.
- ✅ **Correção de premissa:** o utilitário `compartilharDespesas.js` da V1 **já usava** esta mesma abordagem. As dependências `html2canvas` e `dom-to-image-more` estavam instaladas mas **nunca eram importadas** em lugar nenhum — foram removidas.

**Cenários BDD relacionados:** CEN-030.1, CEN-030.2

---

### US-031 — Comparar com a média dos meses anteriores 💡

**Vinculada a:** FEAT-035 | **Prioridade:** Could | **Status:** Não iniciado | **Origem:** 💡

> Como **membro**, quero **saber quando uma categoria fugiu do padrão**, para que **eu perceba um gasto fora do normal sem precisar comparar mês a mês na mão**.

**Critérios de aceitação**

- [ ] CA-1: Cada categoria exibe a média das competências anteriores ao lado do valor atual.
- [ ] CA-2: Desvios acima de um limite definido são sinalizados visualmente.
- [ ] CA-3: A sinalização distingue gasto acima e abaixo da média.
- [ ] CA-4: Categorias sem histórico suficiente não são sinalizadas.

**Regras de negócio**

- **RN-068 ⬜:** Quantos meses formam a média e qual o limite de desvio? **Sugestão 💡:** média das 3 competências anteriores e sinalização a partir de 30% de desvio, exigindo ao menos 2 meses de histórico para não alarmar com base em um único mês.

**Cenários BDD relacionados:** CEN-031.1, CEN-031.2

---

### 2.7 Estórias pendentes de escrita

> Funcionalidades já no backlog que ainda não têm estória detalhada. Use o template da seção 2.2.

| Estória | Funcionalidade | Origem |
| :---- | :---- | :---- |
| US-012 | FEAT-023 — Editar / excluir despesa própria | 💡 |
| US-018 | FEAT-024 — Categoria da despesa | 💡 |

---

# 3\. Cenários BDD

Escritos em **Gherkin (pt-BR)**. A diretiva `# language: pt` habilita as palavras-chave em português no Cucumber e ferramentas compatíveis.

**Palavras-chave:** `Funcionalidade`, `Contexto`, `Cenário`, `Esquema do Cenário`, `Exemplos`, `Dado`, `Quando`, `Então`, `E`, `Mas`.

## 3.1 Template de funcionalidade

\# language: pt

Funcionalidade: \<nome da funcionalidade\>

Vinculada a: FEAT-0XX | US-0XX

Contexto:

Dado que \\\<pré-condição comum a todos os cenários\\\>

\# CEN-0XX.1 — \<caminho feliz\>

Cenário: \<resultado esperado em uma frase\>

Dado \\\<estado inicial\\\>

Quando \\\<ação do usuário\\\>

Então \\\<resultado observável\\\>

E \\\<resultado adicional\\\>

---

## 3.2 Menu principal (US-001)

\# language: pt

Funcionalidade: Menu principal do aplicativo

Vinculada a: FEAT-004 | US-001

Contexto:

Dado que existe um usuário chamado "Gabriel"

E que "Gabriel" está autenticado

\# CEN-001.1

Cenário: Visualizar as opções do menu principal

Quando "Gabriel" acessa a rota "/app"

Então ele vê a opção "Residências"

E ele vê a opção "Criar residência"

E ele vê a opção "Entrar em residência"

\# CEN-001.2 — 💡 Sugestão do Claude

Cenário: Usuário não autenticado é redirecionado

Dado que "Gabriel" não está autenticado

Quando ele acessa a rota "/app"

Então ele é redirecionado para a tela de login

---

## 3.3 Criação de residência (US-002)

\# language: pt

Funcionalidade: Criação de residência

Vinculada a: FEAT-005 | US-002

Contexto:

Dado que existe um usuário chamado "Gabriel"

E que "Gabriel" está autenticado

E que ele está na tela de criação de residência

\# CEN-002.1 — caminho feliz

Cenário: Criar residência com nome válido

Quando ele informa "Casa da Praia" no campo "Nome da residência"

E confirma a criação

Então a residência "Casa da Praia" é criada

E a residência recebe um código único

E "Gabriel" é registrado como criador da residência

E um modal de sucesso é exibido com a mensagem de residência criada

E o modal apresenta a opção de convidar usuários

E o modal apresenta a opção de confirmar

\# CEN-002.2

Cenário: Confirmar o modal de sucesso

Dado que "Gabriel" acabou de criar a residência "Casa da Praia"

E que o modal de sucesso está visível

Quando ele aciona a opção de confirmar

Então o modal é fechado

E ele é direcionado ao painel da residência "Casa da Praia"

\# CEN-002.3 — 💡 Sugestão do Claude (depende de RN-003)

Esquema do Cenário: Recusar nomes inválidos de residência

Quando ele informa "\\\<nome\\\>" no campo "Nome da residência"

E confirma a criação

Então a residência não é criada

E é exibida a mensagem de erro "\\\<mensagem\\\>"

Exemplos:

| nome                                        | mensagem                                     |

|                                             | Informe o nome da residência                 |

| ab                                          | O nome deve ter ao menos 3 caracteres        |

| \\\<texto com 41 caracteres\\\>                   | O nome deve ter no máximo 40 caracteres      |

---

## 3.4 Lista de residências (US-003 e US-004)

\# language: pt

Funcionalidade: Lista de residências do usuário

Vinculada a: FEAT-006, FEAT-007 | US-003, US-004

Contexto:

Dado que existe um usuário chamado "Gabriel"

E que "Gabriel" está autenticado

\# CEN-003.1 — caminho feliz

Cenário: Visualizar as residências das quais participo

Dado que existe a residência "Casa da Praia" criada por "Marina"

E que "Gabriel" é membro da residência "Casa da Praia"

Quando ele acessa a lista de residências

Então ele vê um item com o título "Casa da Praia"

E o item exibe "Marina" como criador

E o item apresenta a opção de copiar o código

E o item apresenta a opção de ver a residência

\# CEN-003.2 — estado vazio

Cenário: Usuário sem nenhuma residência

Dado que "Gabriel" não é membro de nenhuma residência

Quando ele acessa a lista de residências

Então ele vê a mensagem "Você não está cadastrado em nenhuma residência"

\# CEN-004.1

Cenário: Copiar o código da residência

Dado que "Gabriel" é membro da residência "Casa da Praia" de código "K7RB2M"

E que ele está na lista de residências

Quando ele aciona a opção de copiar o código da residência "Casa da Praia"

Então o valor "K7RB2M" é copiado para a área de transferência

E é exibida uma confirmação de que o código foi copiado

---

## 3.5 Painel da residência (US-005)

\# language: pt

Funcionalidade: Painel da residência

Vinculada a: FEAT-008 | US-005

Contexto:

Dado que existe a residência "Casa da Praia" de código "K7RB2M"

E que existe um usuário chamado "Gabriel"

E que "Gabriel" está autenticado

\# CEN-005.1 — caminho feliz

Cenário: Membro acessa o painel da residência

Dado que "Gabriel" é membro da residência "Casa da Praia"

Quando ele acessa a rota "/app/residences/K7RB2M"

Então ele vê "Casa da Praia" como título principal

E ele vê "K7RB2M" como título secundário

E ele vê o botão "Consultar despesas"

E ele vê o botão "Cadastrar despesas"

\# CEN-005.2 — 💡 Sugestão do Claude (RN-010)

Cenário: Não-membro não acessa o painel

Dado que "Gabriel" não é membro da residência "Casa da Praia"

Quando ele acessa a rota "/app/residences/K7RB2M"

Então ele vê uma página de residência não encontrada

E nenhuma informação da residência "Casa da Praia" é exibida

\# CEN-005.3 — 💡 Sugestão do Claude

Cenário: Código inexistente

Quando ele acessa a rota "/app/residences/ZZZZZZ"

Então ele vê uma página de residência não encontrada

---

## 3.6 Entrada por código (US-006)

\# language: pt

Funcionalidade: Solicitação de entrada em residência por código

Vinculada a: FEAT-013 | US-006

Contexto:

Dado que existe a residência "Casa da Praia" de código "K7RB2M" criada por "Marina"

E que existe um usuário chamado "Gabriel"

E que "Gabriel" está autenticado

E que ele está na tela de entrada em residência

\# CEN-006.1 — caminho feliz

Cenário: Solicitar entrada com código válido

Dado que "Gabriel" não é membro da residência "Casa da Praia"

Quando ele informa o código "K7RB2M"

E confirma a solicitação

Então uma solicitação de entrada é enviada para "Marina"

E "Gabriel" vê a confirmação de que a solicitação foi enviada

Mas "Gabriel" ainda não é membro da residência "Casa da Praia"

\# CEN-006.2

Cenário: Código inexistente

Quando ele informa o código "ZZZZZZ"

E confirma a solicitação

Então nenhuma solicitação de entrada é criada

E é exibida uma mensagem informando que a residência não foi encontrada

\# CEN-006.3 — 💡 Sugestão do Claude

Cenário: Usuário já é membro da residência

Dado que "Gabriel" já é membro da residência "Casa da Praia"

Quando ele informa o código "K7RB2M"

E confirma a solicitação

Então nenhuma solicitação de entrada é criada

E é exibida uma mensagem informando que ele já participa dessa residência

\# CEN-006.4 — 💡 Sugestão do Claude

Cenário: Solicitação pendente não é duplicada

Dado que "Gabriel" já possui uma solicitação pendente para a residência "Casa da Praia"

Quando ele informa o código "K7RB2M"

E confirma a solicitação

Então nenhuma solicitação adicional é criada

E é exibida uma mensagem informando que a solicitação já está aguardando resposta

---

## 3.7 Convite de usuários (US-007 e US-008)

\# language: pt

Funcionalidade: Convite de usuários para a residência

Vinculada a: FEAT-014, FEAT-015 | US-007, US-008

Observação: depende do identificador público de usuário (FEAT-003 / D-01)

Contexto:

Dado que existe um usuário com nome de usuário "marina"

E que existe um usuário com nome de usuário "gabriel"

E que "marina" criou a residência "Casa da Praia"

E que "marina" está autenticada

\# CEN-007.1 — caminho feliz

Cenário: Owner convida um usuário existente

Dado que "marina" abriu o modal de convite da residência "Casa da Praia"

Quando ela informa o nome de usuário "gabriel"

E confirma o convite

Então um convite para a residência "Casa da Praia" é enviado a "gabriel"

E "gabriel" recebe a notificação do convite

\# CEN-007.2

Cenário: Convidar nome de usuário inexistente

Dado que "marina" abriu o modal de convite da residência "Casa da Praia"

Quando ela informa o nome de usuário "usuario-que-nao-existe"

E confirma o convite

Então nenhum convite é criado

E é exibida uma mensagem informando que o usuário não foi encontrado

\# CEN-008.1 — caminho feliz

Cenário: Convidado aceita o convite

Dado que "gabriel" recebeu um convite para a residência "Casa da Praia"

E que "gabriel" está autenticado

Quando ele aceita o convite

Então "gabriel" passa a ser membro da residência "Casa da Praia"

E a residência "Casa da Praia" aparece na lista de residências de "gabriel"

\# CEN-008.2

Cenário: Convidado recusa o convite

Dado que "gabriel" recebeu um convite para a residência "Casa da Praia"

E que "gabriel" está autenticado

Quando ele recusa o convite

Então "gabriel" não é membro da residência "Casa da Praia"

E o convite deixa de constar como pendente

---

## 3.8 Aprovação de solicitações (US-009)

\# language: pt

Funcionalidade: Aprovação de solicitações de entrada

Vinculada a: FEAT-016 | US-009

Contexto:

Dado que "marina" criou a residência "Casa da Praia"

E que "gabriel" solicitou entrada na residência "Casa da Praia"

\# CEN-009.1 — caminho feliz

Cenário: Owner aceita a solicitação

Dado que "marina" está autenticada

Quando ela aceita a solicitação de "gabriel"

Então "gabriel" passa a ser membro da residência "Casa da Praia"

E "gabriel" é notificado de que a solicitação foi aceita

\# CEN-009.2

Cenário: Owner recusa a solicitação

Dado que "marina" está autenticada

Quando ela recusa a solicitação de "gabriel"

Então "gabriel" não é membro da residência "Casa da Praia"

E a solicitação deixa de constar como pendente

\# CEN-009.3 — 💡 Sugestão do Claude (RN-017)

Cenário: Membro comum não pode responder solicitações

Dado que "carlos" é membro da residência "Casa da Praia" mas não é o criador

E que "carlos" está autenticado

Quando ele tenta aceitar a solicitação de "gabriel"

Então a ação é negada

E "gabriel" não é membro da residência "Casa da Praia"

---

## 3.9 Cadastro de despesas (US-010)

\# language: pt

Funcionalidade: Cadastro de despesas pelo próprio membro

Vinculada a: FEAT-021 | US-010

Contexto:

Dado que existe a residência "Casa da Praia" de código "K7RB2M"

E que "gabriel" é membro da residência "Casa da Praia"

E que "gabriel" está autenticado

\# CEN-010.1 — caminho feliz

Cenário: Cadastrar uma despesa

Quando ele cadastra a despesa "Conta de luz" no valor de 180.50 para a competência 08/2026

Então a despesa "Conta de luz" é registrada na residência "Casa da Praia"

E a despesa consta como lançada por "gabriel"

E a despesa consta na competência 08/2026

\# CEN-010.2 — lançamento incremental (essência da mudança da V2.0)

Cenário: Cadastrar despesas em momentos diferentes do mesmo mês

Dado que "gabriel" já cadastrou a despesa "Conta de luz" na competência 08/2026

Quando ele cadastra a despesa "Supermercado" no valor de 340.00 para a competência 08/2026

Então a residência "Casa da Praia" possui 2 despesas na competência 08/2026

E ambas constam como lançadas por "gabriel"

\# CEN-010.3 — 💡 Sugestão do Claude

Esquema do Cenário: Recusar valores inválidos

Quando ele cadastra a despesa "Conta de luz" no valor de \\\<valor\\\> para a competência 08/2026

Então a despesa não é registrada

E é exibida a mensagem de erro "\\\<mensagem\\\>"

Exemplos:

| valor  | mensagem                             |

| 0      | O valor deve ser maior que zero      |

| \\-50.00 | O valor deve ser maior que zero      |

\# CEN-010.4 — 💡 Sugestão do Claude (RN-018)

Cenário: Não-membro não cadastra despesa

Dado que "carlos" não é membro da residência "Casa da Praia"

E que "carlos" está autenticado

Quando ele tenta cadastrar uma despesa na residência "Casa da Praia"

Então a ação é negada

E nenhuma despesa é registrada na residência "Casa da Praia"

---

## 3.10 Consulta de despesas (US-011) — rascunho

> ⬜ **Rascunho.** Depende das respostas de Q-1 a Q-6 (seção 2.5). O cenário abaixo assume as sugestões 💡 propostas lá — **revise antes de implementar**.

\# language: pt

Funcionalidade: Consulta de despesas da residência

Vinculada a: FEAT-022 | US-011

Status: rascunho — comportamento em definição

Contexto:

Dado que existe a residência "Casa da Praia"

E que "gabriel" e "marina" são membros da residência "Casa da Praia"

E que "gabriel" está autenticado

\# CEN-011.1 — 💡 rascunho, assume Q-1 \= "vê despesas de todos"

Cenário: Consultar as despesas da competência corrente

Dado que "gabriel" lançou 180.50 em "Conta de luz" na competência 08/2026

E que "marina" lançou 340.00 em "Supermercado" na competência 08/2026

Quando ele consulta as despesas da residência na competência 08/2026

Então ele vê a despesa "Conta de luz" atribuída a "gabriel"

E ele vê a despesa "Supermercado" atribuída a "marina"

E ele vê o total da residência de 520.50

\# CEN-011.2 — 💡 rascunho, estado vazio (Q-6)

Cenário: Competência sem despesas

Dado que não há despesas na competência 09/2026

Quando ele consulta as despesas da residência na competência 09/2026

Então ele vê a mensagem "Nenhuma despesa cadastrada nesta competência"

---

## 3.11 Saída de residência (US-013)

\# language: pt

Funcionalidade: Saída de residência

Vinculada a: FEAT-009 | US-013

Contexto:

Dado que "marina" criou a residência "Casa da Praia"

E que "gabriel" é membro da residência "Casa da Praia"

\# CEN-013.1 — caminho feliz

Cenário: Membro sai da residência

Dado que "gabriel" está autenticado

E que ele está no painel da residência "Casa da Praia"

Quando ele aciona a opção de sair da residência

E confirma a saída

Então "gabriel" deixa de ser membro da residência "Casa da Praia"

E a residência "Casa da Praia" não aparece mais na lista de residências dele

\# CEN-013.2 — a confirmação protege contra saída acidental

Cenário: Membro desiste de sair

Dado que "gabriel" está autenticado

E que ele acionou a opção de sair da residência "Casa da Praia"

Quando ele cancela a saída

Então "gabriel" continua sendo membro da residência "Casa da Praia"

\# CEN-013.3 — RN-021

Cenário: Owner não pode sair da própria residência

Dado que "marina" está autenticada

Quando ela abre o painel da residência "Casa da Praia"

Então a opção de sair da residência não está disponível para ela

---

## 3.12 Remoção de membro (US-014)

\# language: pt

Funcionalidade: Remoção de membro da residência

Vinculada a: FEAT-010 | US-014

Contexto:

Dado que "marina" criou a residência "Casa da Praia"

E que "gabriel" é membro da residência "Casa da Praia"

\# CEN-014.1 — caminho feliz

Cenário: Owner remove um membro

Dado que "marina" está autenticada

E que ela está na lista de membros da residência "Casa da Praia"

Quando ela aciona a remoção de "gabriel"

E confirma a remoção

Então "gabriel" deixa de ser membro da residência "Casa da Praia"

E a residência "Casa da Praia" não aparece mais na lista de residências dele

\# CEN-014.2 — CA-5

Cenário: Owner não pode remover a si mesmo

Dado que "marina" está autenticada

Quando ela abre a lista de membros da residência "Casa da Praia"

Então a opção de remover não está disponível para "marina"

\# CEN-014.3 — RN-024

Cenário: Membro comum não pode remover ninguém

Dado que "gabriel" está autenticado

Quando ele tenta remover "marina" da residência "Casa da Praia"

Então a ação é negada

E "marina" continua sendo membro da residência "Casa da Praia"

\# CEN-014.4 — RN-025

Cenário: Membro removido pode solicitar entrada novamente

Dado que "gabriel" foi removido da residência "Casa da Praia"

E que "gabriel" está autenticado

Quando ele informa o código da residência "Casa da Praia"

E confirma a solicitação

Então uma solicitação de entrada é enviada para "marina"

---

## 3.13 Transferência de propriedade (US-015)

\# language: pt

Funcionalidade: Transferência de propriedade da residência

Vinculada a: FEAT-011 | US-015

Contexto:

Dado que "marina" criou a residência "Casa da Praia"

E que "gabriel" é membro da residência "Casa da Praia"

\# CEN-015.1 — caminho feliz

Cenário: Owner transfere a propriedade para outro membro

Dado que "marina" está autenticada

Quando ela transfere a propriedade da residência "Casa da Praia" para "gabriel"

E confirma a transferência

Então "gabriel" passa a ser o criador da residência "Casa da Praia"

E "marina" continua na residência "Casa da Praia" como membro comum

E a residência "Casa da Praia" possui exatamente um criador

\# CEN-015.2 — RN-029, destrava a US-013 para o antigo owner

Cenário: Antigo owner passa a poder sair da residência

Dado que "marina" transferiu a propriedade da residência "Casa da Praia" para "gabriel"

Quando "marina" abre o painel da residência "Casa da Praia"

Então a opção de sair da residência está disponível para ela

\# CEN-015.3 — RN-027

Cenário: Não é possível transferir para quem não é membro

Dado que "marina" está autenticada

E que "carlos" não é membro da residência "Casa da Praia"

Quando ela tenta transferir a propriedade da residência "Casa da Praia" para "carlos"

Então a ação é negada

E "marina" continua sendo a criadora da residência "Casa da Praia"

\# CEN-015.4 — CA-6

Cenário: Membro comum não pode transferir a propriedade

Dado que "gabriel" está autenticado

Quando ele tenta transferir a propriedade da residência "Casa da Praia" para si mesmo

Então a ação é negada

E "marina" continua sendo a criadora da residência "Casa da Praia"

---

## 3.14 Renomear residência (US-019)

\# language: pt

Funcionalidade: Renomeação da residência

Vinculada a: FEAT-012 | US-019

Contexto:

Dado que "marina" criou a residência "Casa da Praia" de código "K7RB2M"

E que "gabriel" é membro da residência "Casa da Praia"

\# CEN-019.1 — caminho feliz

Cenário: Owner renomeia a residência

Dado que "marina" está autenticada

Quando ela altera o nome da residência "Casa da Praia" para "Casa do Campo"

Então a residência passa a se chamar "Casa do Campo"

E o código da residência continua sendo "K7RB2M"

E "gabriel" vê "Casa do Campo" na lista de residências dele

\# CEN-019.2 — CA-5, reaproveita a RN-003

Cenário: Nome inválido não altera a residência

Dado que "marina" está autenticada

Quando ela altera o nome da residência "Casa da Praia" para "ab"

Então é exibida a mensagem de erro "O nome deve ter ao menos 3 caracteres"

E a residência continua se chamando "Casa da Praia"

\# CEN-019.3 — RN-031

Cenário: Membro comum não pode renomear

Dado que "gabriel" está autenticado

Quando ele abre o painel da residência "Casa da Praia"

Então a opção de renomear a residência não está disponível para ele

---

## 3.15 Arquivar residência (US-020) — rascunho

> ✅ **Aprovado.** As respostas de Q-7 a Q-12 (seção 2.3, US-020) confirmaram as sugestões, e os cenários abaixo passaram a valer como especificação.

\# language: pt

Funcionalidade: Arquivamento de residência

Vinculada a: FEAT-012 | US-020

Status: rascunho — comportamento em definição

Contexto:

Dado que "marina" criou a residência "Casa da Praia"

E que "gabriel" é membro da residência "Casa da Praia"

\# CEN-020.1 — 💡 rascunho, assume Q-7, Q-8 e Q-9

Cenário: Owner arquiva a residência

Dado que "marina" está autenticada

Quando ela arquiva a residência "Casa da Praia"

Então a residência "Casa da Praia" aparece como arquivada na lista de "gabriel"

E "gabriel" ainda consegue consultar as despesas da residência "Casa da Praia"

Mas "gabriel" não consegue cadastrar despesas na residência "Casa da Praia"

\# CEN-020.2 — 💡 rascunho, assume Q-10 e Q-12

Cenário: Owner desarquiva a residência

Dado que a residência "Casa da Praia" está arquivada

E que "marina" está autenticada

Quando ela desarquiva a residência "Casa da Praia"

Então "gabriel" volta a conseguir cadastrar despesas na residência "Casa da Praia"

---

## 3.16 Sino de notificações (US-016)

\# language: pt

Funcionalidade: Sino de notificações na navbar

Vinculada a: FEAT-017 | US-016

Contexto:

Dado que existe um usuário chamado "gabriel"

E que "gabriel" está autenticado

\# CEN-016.1 — caminho feliz

Cenário: Sino indica a quantidade de notificações não lidas

Dado que "gabriel" possui 3 notificações não lidas

Quando ele acessa qualquer tela do aplicativo

Então ele vê o ícone de sino na barra de navegação

E o sino exibe o indicador "3"

\# CEN-016.2

Cenário: Abrir o painel do sino

Dado que "gabriel" recebeu um convite para a residência "Casa da Praia"

Quando ele aciona o sino

Então o painel exibe a notificação do convite para a residência "Casa da Praia"

E a notificação exibe o momento em que ocorreu

E o painel exibe a opção "Mostrar tudo"

\# CEN-016.3 — estado vazio

Cenário: Usuário sem notificações

Dado que "gabriel" não possui nenhuma notificação

Quando ele aciona o sino

Então ele vê uma mensagem informando que não há notificações

E o sino não exibe indicador de não lidas

\# CEN-016.4 — CA-8

Cenário: Ir para a tela dedicada pelo painel

Dado que "gabriel" abriu o painel do sino

Quando ele aciona a opção "Mostrar tudo"

Então ele é levado à tela de notificações

\# CEN-016.5 — CA-9

Cenário: Visitante não vê o sino

Dado que "gabriel" não está autenticado

Quando ele acessa a página inicial

Então o ícone de sino não é exibido na barra de navegação

---

## 3.17 Tela de notificações (US-021)

\# language: pt

Funcionalidade: Histórico completo de notificações

Vinculada a: FEAT-017 | US-021

Contexto:

Dado que existe um usuário chamado "gabriel"

E que "gabriel" está autenticado

\# CEN-021.1 — caminho feliz

Cenário: Consultar todas as notificações

Dado que "gabriel" possui 8 notificações

Quando ele acessa a tela de notificações

Então ele vê as 8 notificações

E as notificações aparecem da mais recente para a mais antiga

E as não lidas são exibidas de forma distinta das já lidas

\# CEN-021.2 — CA-5

Cenário: Marcar todas como lidas

Dado que "gabriel" possui 4 notificações não lidas

E que ele está na tela de notificações

Quando ele aciona a opção de marcar todas como lidas

Então nenhuma notificação aparece como não lida

E o sino deixa de exibir indicador de não lidas

\# CEN-021.3 — estado vazio

Cenário: Nenhuma notificação registrada

Dado que "gabriel" não possui nenhuma notificação

Quando ele acessa a tela de notificações

Então ele vê uma mensagem informando que não há notificações

\# CEN-021.4 — CA-8 / RN-034

Cenário: Notificações são privadas de cada usuário

Dado que "marina" possui uma notificação de convite

Quando "gabriel" acessa a tela de notificações

Então ele não vê a notificação de "marina"

---

## 3.18 Cancelamento de convite e solicitação (US-022)

\# language: pt

Funcionalidade: Cancelamento de convite e de solicitação pendente

Vinculada a: FEAT-018 | US-022

Contexto:

Dado que "marina" criou a residência "Casa da Praia"

E que existe um usuário com nome de usuário "gabriel"

\# CEN-022.1 — caminho feliz do convite

Cenário: Owner cancela um convite pendente

Dado que "marina" convidou "gabriel" para a residência "Casa da Praia"

E que "marina" está autenticada

Quando ela cancela o convite enviado a "gabriel"

Então o convite deixa de constar como pendente

E "gabriel" não vê mais o convite para a residência "Casa da Praia"

\# CEN-022.2 — caminho feliz da solicitação

Cenário: Solicitante cancela a própria solicitação

Dado que "gabriel" solicitou entrada na residência "Casa da Praia"

E que "gabriel" está autenticado

Quando ele cancela a própria solicitação

Então a solicitação deixa de constar como pendente

E "marina" não vê mais a solicitação de "gabriel"

\# CEN-022.3 — RN-043

Cenário: Não é possível cancelar um convite já respondido

Dado que "gabriel" já aceitou o convite para a residência "Casa da Praia"

E que "marina" está autenticada

Quando ela tenta cancelar o convite enviado a "gabriel"

Então a ação é negada

E "gabriel" continua sendo membro da residência "Casa da Praia"

\# CEN-022.4 — RN-042

Cenário: Não é possível cancelar convite de outra pessoa

Dado que "marina" convidou "gabriel" para a residência "Casa da Praia"

E que "carlos" está autenticado

Quando ele tenta cancelar o convite enviado a "gabriel"

Então a ação é negada

E o convite continua pendente

\# CEN-022.5 — CA-8

Cenário: Reenviar após cancelar

Dado que "marina" cancelou o convite enviado a "gabriel"

E que "marina" está autenticada

Quando ela convida "gabriel" novamente para a residência "Casa da Praia"

Então um novo convite é enviado a "gabriel"

---

## 3.19 Regeneração do código (US-017)

\# language: pt

Funcionalidade: Regeneração do código da residência

Vinculada a: FEAT-019 | US-017

Contexto:

Dado que "marina" criou a residência "Casa da Praia" de código "K7RB2M"

E que "gabriel" é membro da residência "Casa da Praia"

\# CEN-017.1 — caminho feliz

Cenário: Owner gera um novo código

Dado que "marina" está autenticada

Quando ela gera um novo código para a residência "Casa da Praia"

E confirma a operação

Então a residência "Casa da Praia" passa a ter um código diferente de "K7RB2M"

E "marina" vê o novo código no painel da residência

E "gabriel" continua sendo membro da residência "Casa da Praia"

\# CEN-017.2 — CA-4, o efeito que justifica a funcionalidade

Cenário: Código antigo deixa de funcionar

Dado que "marina" gerou um novo código para a residência "Casa da Praia"

E que "carlos" está autenticado

Quando ele informa o código "K7RB2M"

E confirma a solicitação

Então nenhuma solicitação de entrada é criada

E é exibida uma mensagem informando que a residência não foi encontrada

\# CEN-017.3 — CA-8

Cenário: Membro comum não pode regenerar o código

Dado que "gabriel" está autenticado

Quando ele abre o painel da residência "Casa da Praia"

Então a opção de gerar um novo código não está disponível para ele

\# CEN-017.4 — CA-9

Cenário: Residência arquivada não permite regenerar

Dado que a residência "Casa da Praia" está arquivada

E que "marina" está autenticada

Quando ela tenta gerar um novo código para a residência "Casa da Praia"

Então a ação é negada

E o código da residência continua sendo "K7RB2M"

\# CEN-017.5 — RN-048

Cenário: Solicitações pendentes feitas com o código antigo são canceladas

Dado que "carlos" possui uma solicitação pendente para a residência "Casa da Praia"

E que "marina" está autenticada

Quando ela gera um novo código para a residência "Casa da Praia"

Então a solicitação de "carlos" deixa de constar como pendente

E "marina" não vê mais a solicitação de "carlos"

---

## 3.20 Proteção contra tentativa em massa (US-023)

\# language: pt

Funcionalidade: Limite de tentativas na entrada por código

Vinculada a: FEAT-020 | US-023

Contexto:

Dado que existe a residência "Casa da Praia" de código "K7RB2M"

E que "carlos" está autenticado

E que o limite é de 10 tentativas malsucedidas em 15 minutos

\# CEN-023.1 — caminho feliz da proteção

Cenário: Bloqueio após exceder o limite de tentativas

Dado que "carlos" já fez 10 tentativas malsucedidas nos últimos 15 minutos

Quando ele informa mais um código inexistente

Então a tentativa é recusada

E é exibida uma mensagem informando que houve tentativas demais

E nenhuma solicitação de entrada é criada

\# CEN-023.2 — CA-3

Cenário: Bloqueio expira sozinho

Dado que "carlos" está bloqueado por excesso de tentativas

E que se passaram 15 minutos desde o bloqueio

Quando ele informa o código "K7RB2M"

E confirma a solicitação

Então uma solicitação de entrada é enviada para a residência "Casa da Praia"

\# CEN-023.3 — CA-4

Cenário: Tentativa bem-sucedida zera o contador

Dado que "carlos" já fez 5 tentativas malsucedidas nos últimos 15 minutos

Quando ele informa o código "K7RB2M"

E confirma a solicitação

Então uma solicitação de entrada é enviada para a residência "Casa da Praia"

E o contador de tentativas de "carlos" é zerado

\# CEN-023.4 — CA-5, o bloqueio nunca atinge a residência alvo

Cenário: Bloqueio de um usuário não afeta os outros

Dado que "carlos" está bloqueado por excesso de tentativas

E que "gabriel" está autenticado

Quando "gabriel" informa o código "K7RB2M"

E confirma a solicitação

Então uma solicitação de entrada é enviada para a residência "Casa da Praia"

---

## 3.21 Relatório da residência (US-024)

```gherkin
# language: pt

Funcionalidade: Relatório da residência por categoria
  Vinculada a: FEAT-026 | US-024

  Contexto:
    Dado que "gabriel" e "marina" são membros da residência "Casa da Praia"
    E que "gabriel" está autenticado

  # CEN-024.1 — caminho feliz
  Cenário: Consultar a divisão por categoria
    Dado que na competência 08/2026 a residência tem 600.00 em "Alimentação"
    E que na competência 08/2026 a residência tem 200.00 em "Contas domésticas"
    Quando ele abre o relatório da residência na competência 08/2026
    Então ele vê o total de 800.00
    E ele vê "Alimentação" com 600.00 e 75% do total
    E ele vê "Contas domésticas" com 200.00 e 25% do total
    E "Alimentação" aparece antes de "Contas domésticas"

  # CEN-024.2 — CA-4
  Cenário: Categoria sem lançamento não é exibida
    Dado que na competência 08/2026 não há nenhuma despesa em "Lazer"
    Quando ele abre o relatório da residência na competência 08/2026
    Então "Lazer" não aparece no relatório

  # CEN-024.3 — estado vazio
  Cenário: Competência sem despesas
    Dado que não há despesas na competência 09/2026
    Quando ele abre o relatório da residência na competência 09/2026
    Então ele vê uma mensagem informando que não há despesas nesta competência
```

---

## 3.22 Relatório pessoal (US-025)

```gherkin
# language: pt

Funcionalidade: Relatório pessoal do membro
  Vinculada a: FEAT-026 | US-025

  Contexto:
    Dado que "gabriel" e "marina" são membros da residência "Casa da Praia"
    E que "gabriel" está autenticado

  # CEN-025.1 — caminho feliz
  Cenário: Consultar apenas os próprios gastos
    Dado que "gabriel" lançou 300.00 na competência 08/2026
    E que "marina" lançou 500.00 na competência 08/2026
    Quando ele abre a aba "Meus gastos" na competência 08/2026
    Então ele vê o total pessoal de 300.00
    E ele vê que seus gastos representam 37,5% do total da casa
    Mas ele não vê os lançamentos de "marina" no total pessoal

  # CEN-025.2 — CA-6
  Cenário: Trocar de aba preserva a competência
    Dado que ele está no relatório da residência na competência 07/2026
    Quando ele alterna para a aba "Meus gastos"
    Então a competência exibida continua sendo 07/2026
```

---

## 3.23 Comparativo entre competências (US-026)

```gherkin
# language: pt

Funcionalidade: Comparativo entre competências
  Vinculada a: FEAT-027 | US-026

  Contexto:
    Dado que "gabriel" é membro da residência "Casa da Praia"
    E que "gabriel" está autenticado

  # CEN-026.1 — caminho feliz
  Cenário: Comparar com o mês anterior
    Dado que a residência gastou 800.00 na competência 08/2026
    E que a residência gastou 1000.00 na competência 07/2026
    Quando ele abre o comparativo da competência 08/2026
    Então ele vê a variação de -200.00 no total
    E ele vê a variação de -20% no total
    E a variação é apresentada como queda

  # CEN-026.2 — CA-6 e RN-061
  Cenário: Categoria que não existia no mês anterior
    Dado que "Lazer" teve 150.00 na competência 08/2026
    E que "Lazer" não teve nenhum lançamento na competência 07/2026
    Quando ele abre o comparativo da competência 08/2026
    Então "Lazer" aparece marcada como nova
    E nenhum percentual de variação é exibido para "Lazer"

  # CEN-026.3 — CA-5
  Cenário: Categoria que desapareceu
    Dado que "Assinaturas" teve 90.00 na competência 07/2026
    E que "Assinaturas" não teve nenhum lançamento na competência 08/2026
    Quando ele abre o comparativo da competência 08/2026
    Então "Assinaturas" aparece com queda de 100%

  # CEN-026.4 — CA-7
  Cenário: Sem competência anterior para comparar
    Dado que 08/2026 é a competência mais antiga com despesas
    Quando ele abre o comparativo da competência 08/2026
    Então ele vê uma mensagem informando que não há competência anterior para comparação
```

---

## 3.24 Gráficos do relatório (US-027)

```gherkin
# language: pt

Funcionalidade: Gráficos do relatório
  Vinculada a: FEAT-028 | US-027

  Contexto:
    Dado que "gabriel" é membro da residência "Casa da Praia"
    E que "gabriel" está autenticado

  # CEN-027.1 — caminho feliz
  Cenário: Ver a composição da competência
    Dado que a residência tem despesas em 3 categorias na competência 08/2026
    Quando ele abre o relatório na competência 08/2026
    Então ele vê um gráfico com a composição das 3 categorias
    E os mesmos valores continuam disponíveis em texto

  # CEN-027.2 — CA-3
  Cenário: O gráfico acompanha a aba selecionada
    Dado que ele está vendo o gráfico da residência na competência 08/2026
    Quando ele alterna para a aba "Meus gastos"
    Então o gráfico passa a representar apenas os lançamentos dele

  # CEN-027.3 — CA-6
  Cenário: Competência sem dados não desenha gráfico vazio
    Dado que não há despesas na competência 09/2026
    Quando ele abre o relatório na competência 09/2026
    Então nenhum gráfico é desenhado
    E ele vê a mensagem de estado vazio no lugar
```

---

## 3.25 Rateio entre membros (US-028)

```gherkin
# language: pt

Funcionalidade: Rateio das despesas entre os membros
  Vinculada a: FEAT-029 | US-028

  Contexto:
    Dado que "gabriel" e "marina" são os membros da residência "Casa da Praia"
    E que "gabriel" está autenticado

  # CEN-028.1 — caminho feliz
  Cenário: Calcular quem paga e quem recebe
    Dado que "marina" lançou 300.00 na competência 08/2026
    E que "gabriel" lançou 100.00 na competência 08/2026
    Quando ele abre o rateio da competência 08/2026
    Então a cota individual é 200.00
    E "marina" aparece com 100.00 a receber
    E "gabriel" aparece com 100.00 a pagar
    E a soma dos saldos é zero

  # CEN-028.2 — CA-5
  Cenário: Membro que não lançou nada deve a cota inteira
    Dado que "marina" lançou 400.00 na competência 08/2026
    E que "gabriel" não lançou nenhuma despesa na competência 08/2026
    Quando ele abre o rateio da competência 08/2026
    Então a cota individual é 200.00
    E "gabriel" aparece com 200.00 a pagar
    E "marina" aparece com 200.00 a receber

  # CEN-028.3 — RN-066
  Cenário: Sobra de centavos na divisão
    Dado que a residência tem 3 membros
    E que o total da competência 08/2026 é 100.00
    Quando ele abre o rateio da competência 08/2026
    Então a soma dos saldos é zero
    E a diferença entre a maior e a menor cota não passa de 0.01

  # CEN-028.4 — CA-8
  Cenário: Competência sem despesas
    Dado que não há despesas na competência 09/2026
    Quando ele abre o rateio da competência 09/2026
    Então ele vê uma mensagem informando que não há o que dividir
```

---

## 3.26 Exportação em CSV (US-029)

```gherkin
# language: pt

Funcionalidade: Exportação do relatório em CSV
  Vinculada a: FEAT-033 | US-029

  Contexto:
    Dado que "gabriel" é membro da residência "Casa da Praia"
    E que "gabriel" está autenticado

  # CEN-029.1 — caminho feliz
  Cenário: Exportar a competência
    Dado que a residência tem 5 despesas na competência 08/2026
    Quando ele exporta o relatório da competência 08/2026
    Então um arquivo CSV é baixado
    E o arquivo contém 5 linhas de despesa
    E cada linha traz data, autor, nome, categoria e valor
    E o nome do arquivo identifica a residência e a competência

  # CEN-029.2 — CA-3
  Cenário: A exportação respeita a aba selecionada
    Dado que ele está na aba "Meus gastos" da competência 08/2026
    Quando ele exporta o relatório
    Então o arquivo contém apenas os lançamentos dele
```

---

## 3.27 Compartilhamento como imagem (US-030)

```gherkin
# language: pt

Funcionalidade: Compartilhamento do resumo do mês
  Vinculada a: FEAT-034 | US-030

  Contexto:
    Dado que "gabriel" é membro da residência "Casa da Praia"
    E que "gabriel" está autenticado
    E que a residência tem despesas na competência 08/2026

  # CEN-030.1 — caminho feliz
  Cenário: Gerar a imagem do resumo
    Quando ele aciona a opção de compartilhar o resumo da competência 08/2026
    Então uma imagem é gerada com o nome da residência
    E a imagem contém a competência e o total
    E a imagem contém o rateio por membro

  # CEN-030.2 — CA-4
  Cenário: Dispositivo sem compartilhamento nativo
    Dado que o dispositivo não oferece compartilhamento nativo
    Quando ele aciona a opção de compartilhar o resumo
    Então a imagem é baixada
```

---

## 3.28 Média e variação por categoria (US-031)

```gherkin
# language: pt

Funcionalidade: Comparação com a média das competências anteriores
  Vinculada a: FEAT-035 | US-031

  Contexto:
    Dado que "gabriel" é membro da residência "Casa da Praia"
    E que "gabriel" está autenticado
    E que a média é calculada sobre as 3 competências anteriores
    E que o desvio é sinalizado a partir de 30%

  # CEN-031.1 — caminho feliz
  Cenário: Sinalizar gasto acima da média
    Dado que "Contas domésticas" tem média de 200.00 nas competências anteriores
    E que "Contas domésticas" tem 300.00 na competência 08/2026
    Quando ele abre o relatório da competência 08/2026
    Então "Contas domésticas" aparece sinalizada como acima da média
    E a média de 200.00 é exibida ao lado do valor atual

  # CEN-031.2 — CA-4
  Cenário: Categoria sem histórico suficiente não é sinalizada
    Dado que "Lazer" tem lançamentos em apenas 1 competência anterior
    Quando ele abre o relatório da competência 08/2026
    Então "Lazer" não recebe sinalização de desvio
```

---

# 4\. Anexos

## 4.1 Matriz de rastreabilidade

| Épico | Funcionalidade | Estória | Cenários |
| :---- | :---- | :---- | :---- |
| EP-02 | FEAT-004 | US-001 | CEN-001.1, CEN-001.2 |
| EP-02 | FEAT-005 | US-002 | CEN-002.1, CEN-002.2, CEN-002.3 |
| EP-02 | FEAT-006 | US-003 | CEN-003.1, CEN-003.2 |
| EP-02 | FEAT-007 | US-004 | CEN-004.1 |
| EP-02 | FEAT-008 | US-005 | CEN-005.1, CEN-005.2, CEN-005.3 |
| EP-02 | FEAT-009 | US-013 | CEN-013.1, CEN-013.2, CEN-013.3 |
| EP-02 | FEAT-010 | US-014 | CEN-014.1 a CEN-014.4 |
| EP-02 | FEAT-011 | US-015 | CEN-015.1 a CEN-015.4 |
| EP-02 | FEAT-012 | US-019 | CEN-019.1, CEN-019.2, CEN-019.3 |
| EP-02 | FEAT-012 | US-020 ⬜ | CEN-020.1, CEN-020.2 (rascunho) |
| EP-03 | FEAT-013 | US-006 | CEN-006.1 a CEN-006.4 |
| EP-03 | FEAT-014 | US-007 | CEN-007.1, CEN-007.2 |
| EP-03 | FEAT-015 | US-008 | CEN-008.1, CEN-008.2 |
| EP-03 | FEAT-016 | US-009 | CEN-009.1, CEN-009.2, CEN-009.3 |
| EP-03 | FEAT-017 | US-016 | CEN-016.1 a CEN-016.5 |
| EP-03 | FEAT-017 | US-021 | CEN-021.1 a CEN-021.4 |
| EP-03 | FEAT-018 | US-022 | CEN-022.1 a CEN-022.5 |
| EP-03 | FEAT-019 | US-017 | CEN-017.1 a CEN-017.5 |
| EP-03 | FEAT-020 | US-023 | CEN-023.1 a CEN-023.4 |
| EP-04 | FEAT-021 | US-010 | CEN-010.1 a CEN-010.4 |
| EP-04 | FEAT-022 | US-011 | CEN-011.1, CEN-011.2 |
| EP-05 | FEAT-026 | US-024 | CEN-024.1 a CEN-024.3 |
| EP-05 | FEAT-026 | US-025 | CEN-025.1, CEN-025.2 |
| EP-05 | FEAT-027 | US-026 | CEN-026.1 a CEN-026.4 |
| EP-05 | FEAT-028 | US-027 | CEN-027.1 a CEN-027.3 |
| EP-05 | FEAT-029 | US-028 | CEN-028.1 a CEN-028.4 |
| EP-05 | FEAT-033 | US-029 | CEN-029.1, CEN-029.2 |
| EP-05 | FEAT-034 | US-030 | CEN-030.1, CEN-030.2 |
| EP-05 | FEAT-035 | US-031 | CEN-031.1, CEN-031.2 |

## 4.2 Decisões pendentes (checklist)

- [x] **RN-003** — Definir as restrições do nome da residência.  
- [x] **RN-004** — Definir o formato e o tamanho do `code`.  
- [x] **RN-005** — Definir se há limite de residências por usuário.  
- [x] **RN-013** — Definir o intervalo mínimo para refazer solicitação recusada.  
- [x] **RN-015** — Definir se o convite expira e em quanto tempo.  
- [x] **RN-019** — Definir se um membro pode lançar despesa em nome de outro.  
- [x] **RN-020** — Definir se competências passadas/futuras são permitidas.  
- [x] **D-01** — Decidir entre criar `username` ou convidar por e-mail. *(Resolvido: `username` criado na FEAT-003.)*  
- [x] **D-03** — Decidir o destino do modelo `Person` na V2.0. *(Removido.)*  
- [x] **Q-1 a Q-6** — Definir o comportamento da consulta de despesas (FEAT-022).  
- [x] **RN-022** — Definir o destino das despesas de quem sai ou é removido da residência. *(Decidido; falta aplicar no código — depende do EP-04.)*  
- [x] **RN-025** — Definir se um membro removido pode solicitar entrada novamente.  
- [x] **RN-028** — Definir se a transferência de propriedade exige aceite do destinatário.  
- [x] **Q-7 a Q-12** — Definir o comportamento do arquivamento de residência (FEAT-012).  
- [x] **RN-035** — Definir quantas notificações o painel do sino exibe.  
- [x] **RN-036** — Definir quando uma notificação passa a contar como lida.  
- [x] **RN-038** — Definir se aceitar/recusar acontece dentro da notificação ou só no destino.  
- [x] **RN-039** — Definir a rota da tela de notificações.  
- [x] **RN-040** — Definir se a tela de notificações pagina.  
- [x] **RN-041** — Definir se notificações antigas são descartadas.  
- [x] **RN-044** — Definir se o destinatário é notificado quando um convite é cancelado.  
- [x] **RN-048** — Definir se solicitações pendentes sobrevivem à regeneração do código.  
- [x] **RN-049** — Definir o limite de tentativas e a janela de tempo.  
- [x] **RN-051** — Definir se o limite é por usuário, por IP ou ambos.  
- [x] **RN-052** — Definir onde o contador de tentativas fica armazenado.
- [x] **RN-060** — Definir se o relatório pessoal soma todas as residências ou só a atual. *(Só a atual.)*
- [x] **RN-062** — Definir quantas competências o gráfico de evolução exibe. *(As últimas 6.)*
- [x] **RN-064** — Definir se quem entrou no meio da competência paga cota cheia. *(Sim.)*
- [x] **RN-065** — Definir quem participa do rateio. *(Membros atuais. Quem sai leva junto os lançamentos da competência aberta — RN-022.)*
- [x] **RN-068** — Definir a janela da média e o limite de desvio sinalizado. *(3 meses, 30%, mínimo de 2 meses de histórico.)*
- [x] **US-027 (notas técnicas)** — Validar a biblioteca de gráficos com React 19. *(Recharts 3.10.1 validado no navegador: funciona, mas a pizza exige `isAnimationActive={false}`.)*
- [x] **US-030 (FEAT-034)** — Decidir a abordagem técnica do compartilhamento como imagem. *(SVG desenhado pelo próprio sistema, rasterizado em PNG. As dependências `html2canvas` e `dom-to-image-more` foram removidas — estavam instaladas mas nunca eram importadas.)*

## 4.3 Esboço de modelo de dados 💡

> **Sugestão do Claude — não implementada.** Serve para tornar as estórias acima executáveis e para orientar a migração. Revise antes de aplicar.

Residence

id        Int      (PK)

name      String

code      String   (único)

ownerId   Int      \-\> User

createdAt DateTime

Membership            // relação N:M entre User e Residence

id           Int    (PK)

userId       Int    \-\> User

residenceId  Int    \-\> Residence

role         Enum   (OWNER | MEMBER)

joinedAt     DateTime

(único: userId \+ residenceId)

Invite                // Owner \-\> Usuário

id           Int    (PK)

residenceId  Int    \-\> Residence

invitedUserId Int   \-\> User

invitedById  Int    \-\> User

status       Enum   (PENDING | ACCEPTED | DECLINED | EXPIRED)

createdAt    DateTime

JoinRequest           // Usuário \-\> Residência

id           Int    (PK)

residenceId  Int    \-\> Residence

requesterId  Int    \-\> User

status       Enum   (PENDING | ACCEPTED | DECLINED)

createdAt    DateTime

Expense (revisado)

id           String (PK, uuid)

name         String

value        Float

month        Int

year         Int

residenceId  Int    \-\> Residence     // novo

createdById  Int    \-\> User          // novo — autor do lançamento

categoryId   Int?   \-\> Category      // FEAT-024

deletedAt    DateTime?

**Pontos de atenção da migração (D-02):**

- As despesas atuais estão ligadas a `Person`, não a `User`/`Residence`. É preciso decidir o destino dos dados existentes antes de rodar a migração.  
- `value` como `Float` é impreciso para dinheiro. **Sugestão 💡:** migrar para `Decimal` (Prisma `@db.Decimal(10,2)`) ou armazenar em centavos como inteiro.

## 4.4 Fora do escopo da V2.0

Registrado aqui para não se perder, sem entrar nesta release: a área administrativa com auditoria e monitoramento de acessos (FEAT-030 a FEAT-032).

> O EP-05 (relatórios, gráficos e rateio) **deixou de estar fora do escopo** — as FEAT-026 a FEAT-029 e as FEAT-033 a FEAT-035 foram promovidas para a V2.0.

---

*Fim do documento.*  
