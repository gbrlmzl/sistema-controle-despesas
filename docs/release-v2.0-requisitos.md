# Release V2.0 — Atualização Geral

## Documento de Requisitos: Backlog, Estórias de Usuário e Cenários BDD

**Projeto:** Sistema de Controle de Despesas
**Release:** V2.0 — Despesas colaborativas por residência
**Autor:** Gabriel Mizael
**Status do documento:** Rascunho — em preenchimento
**Última atualização:** 03/08/2026

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
|---|---|
| 📄 | **Origem: Esboço** — extraído diretamente do esboço original da V2.0. |
| 💡 | **Sugestão do Claude** — proposto por mim, não estava no esboço. **Requer sua validação.** |
| ⬜ | **A definir** — lacuna reconhecida, aguardando decisão. Preencher antes de implementar. |

### Convenção de IDs

| Prefixo | Elemento | Exemplo |
|---|---|---|
| `EP-00` | Épico | EP-02 |
| `FEAT-000` | Funcionalidade | FEAT-004 |
| `US-000` | Estória de Usuário | US-006 |
| `RN-000` | Regra de Negócio | RN-003 |
| `CEN-000.0` | Cenário BDD | CEN-006.2 |

### Convenção de prioridade (MoSCoW)

| Valor | Significado |
|---|---|
| **Must** | Sem isso a release não existe. |
| **Should** | Importante, mas a release funciona sem. |
| **Could** | Desejável se sobrar tempo. |
| **Won't** | Fora do escopo desta release (fica registrado para o futuro). |

### Convenção de status

`Não iniciado` · `Em andamento` · `Em revisão` · `Concluído` · `Bloqueado`

---

## 0. Contexto

### 0.1 Estado atual (V1.1)

O sistema opera em **modo de dono único**: um `User` autenticado cadastra `Person` (participantes que **não** possuem login próprio) e lança as `Expense` de cada participante, por mês e ano.

Modelo atual, de forma resumida:

```
User (login) ──1:N──> Person (participante sem login) ──1:N──> Expense (mês/ano)
```

**Limitação:** todas as despesas dependem de uma única pessoa operando o sistema, normalmente lançando tudo de uma vez.

### 0.2 Estado alvo (V2.0) 📄

Múltiplos usuários **com login próprio** compartilham uma **residência** e cada um lança as próprias despesas, de forma incremental, quando quiser.

```
User (login) ──N:M (via Membership)──> Residence ──1:N──> Expense
                                          │
                                          └── 1 Owner (criador)
```

### 0.3 Glossário

| Termo | Definição |
|---|---|
| **Residence** | Agrupamento de usuários que compartilham despesas. Equivale à "casa"/"residência" do esboço. Possui `id` (chave primária) e `code`. 📄 |
| **Code** | Código curto e único da residência, usado por outro usuário para solicitar entrada. 📄 |
| **Owner** | Usuário criador da residência. É o único que aceita/recusa solicitações de entrada. Cada residência tem exatamente um. 📄 |
| **Member** | Usuário que pertence a uma residência (inclui o Owner). 📄 |
| **Invite** | Convite enviado **pelo Owner** para um usuário entrar na residência. Fluxo de dentro para fora. 📄 |
| **JoinRequest** | Solicitação enviada **por um usuário** que digitou o código. Fluxo de fora para dentro. 📄 |
| **Expense** | Despesa lançada por um membro, vinculada à residência e a uma competência (mês/ano). 📄 |
| **Competência** | Par mês/ano ao qual a despesa se refere. 💡 |

### 0.4 Dependências técnicas identificadas

| # | Dependência | Impacto | Origem |
|---|---|---|---|
| D-01 | **Não existe campo `username` no modelo `User` atual.** O esboço prevê convite "pelo nome de usuário". É preciso criar um identificador público único (`username`) ou trocar o convite para e-mail. | Bloqueia FEAT-006 | 💡 |
| D-02 | `Expense` hoje aponta para `Person`, não para `User`/`Residence`. Será necessária migração de modelo e decisão sobre os dados existentes. | Bloqueia EP-04 | 💡 |
| D-03 | Definir o destino do modelo `Person` na V2.0: é descontinuado, ou continua existindo para representar participante sem login dentro de uma residência? | Afeta EP-04 | ⬜ |

> ⬜ **Decisão pendente (D-03):** manter `Person` permite registrar quem não usa o app (ex.: um filho, um agregado). Removê-lo simplifica o modelo. **Recomendação 💡:** manter, pois cobre o caso de uso original da V1 sem perdas.

---

# 1. Backlog de Funcionalidades

## EP-01 — Conta e Identidade

> Base de autenticação sobre a qual a colaboração se apoia.

| ID | Funcionalidade | Descrição | Prior. | Status | Origem |
|---|---|---|---|---|---|
| FEAT-001 | Cadastro de conta | Usuário cria conta para acessar o sistema. *(já existe na V1)* | Must | Concluído | 📄 |
| FEAT-002 | Login / Logout | Autenticação de sessão. *(já existe na V1)* | Must | Concluído | 📄 |
| FEAT-003 | Identificador público (`username`) | Campo único e público que permite um usuário ser encontrado e convidado por outro, sem expor o e-mail. | Must | Não iniciado | 💡 (ver D-01) |

## EP-02 — Gestão de Residências

| ID | Funcionalidade | Descrição | Prior. | Status | Origem |
|---|---|---|---|---|---|
| FEAT-004 | Menu principal `/app` | Tela inicial pós-login com as opções "Residências", "Criar residência" e "Entrar em residência". | Must | Não iniciado | 📄 |
| FEAT-005 | Criar residência | Criação com nome; sistema gera `id` e `code` único. Modal de sucesso com ações "Convidar" e "Confirmar". | Must | Não iniciado | 📄 |
| FEAT-006 | Listar minhas residências | Lista vertical das residências do usuário, com nome, criador, copiar código e acessar. Estado vazio tratado. | Must | Não iniciado | 📄 |
| FEAT-007 | Copiar código da residência | Botão que copia o `code` para a área de transferência. | Should | Não iniciado | 📄 |
| FEAT-008 | Painel da residência | Rota `/app/residences/{code}` com nome, código e acesso a "Consultar despesas" e "Cadastrar despesas". | Must | Não iniciado | 📄 |
| FEAT-009 | Sair da residência | Membro não-owner abandona a residência por vontade própria. | Should | Não iniciado | 💡 |
| FEAT-010 | Remover membro | Owner remove um membro da residência. | Could | Não iniciado | 💡 |
| FEAT-011 | Transferir propriedade | Owner transfere o papel de owner para outro membro (necessário antes de o owner sair). | Could | Não iniciado | 💡 |
| FEAT-012 | Editar / arquivar residência | Renomear ou arquivar uma residência inativa. | Could | Não iniciado | 💡 |

## EP-03 — Acesso: Convites e Solicitações

| ID | Funcionalidade | Descrição | Prior. | Status | Origem |
|---|---|---|---|---|---|
| FEAT-013 | Entrar em residência por código | Usuário digita o código; se a residência existir, gera uma solicitação de entrada ao owner. | Must | Não iniciado | 📄 |
| FEAT-014 | Convidar usuário por `username` | Owner convida um usuário pelo nome de usuário, a partir do modal de sucesso ou do painel. | Must | Não iniciado | 📄 |
| FEAT-015 | Aceitar / recusar convite recebido | Usuário convidado decide sobre o convite. | Must | Não iniciado | 📄 |
| FEAT-016 | Aceitar / recusar solicitação de entrada | Owner decide sobre as solicitações recebidas. | Must | Não iniciado | 📄 |
| FEAT-017 | Central de notificações | Área única onde o usuário vê convites recebidos e o owner vê solicitações pendentes. | Should | Não iniciado | 💡 |
| FEAT-018 | Cancelar convite / solicitação | Quem originou pode cancelar enquanto estiver pendente. | Could | Não iniciado | 💡 |
| FEAT-019 | Regenerar código da residência | Owner gera novo código, invalidando o anterior (útil se o código vazou). | Could | Não iniciado | 💡 |
| FEAT-020 | Proteção contra tentativa em massa de códigos | Limite de tentativas de entrada por código, evitando descoberta por força bruta. | Should | Não iniciado | 💡 |

## EP-04 — Despesas Colaborativas

| ID | Funcionalidade | Descrição | Prior. | Status | Origem |
|---|---|---|---|---|---|
| FEAT-021 | Cadastrar despesa própria | Membro lança suas despesas na residência, de forma incremental, a qualquer momento do mês. | Must | Não iniciado | 📄 |
| FEAT-022 | Consultar despesas da residência | Visualização das despesas da residência. **Comportamento ainda em definição.** | Must | ⬜ A definir | 📄 |
| FEAT-023 | Editar / excluir despesa própria | Membro corrige ou remove um lançamento que fez (exclusão lógica via `deletedAt`). | Should | Não iniciado | 💡 |
| FEAT-024 | Categoria da despesa | Campo de categoria selecionado no cadastro (Contas domésticas, Alimentação, Assinaturas, etc.). Pré-requisito dos relatórios. | Should | Não iniciado | 💡 (citado como intenção futura) |
| FEAT-025 | Despesa recorrente | Lançamento que se repete automaticamente nos meses seguintes (ex.: aluguel, assinatura). | Could | Não iniciado | 💡 |

## EP-05 — Relatórios e Análise

> Bloco majoritariamente futuro; registrado agora porque **condiciona decisões de modelagem** tomadas na V2.0 (especialmente FEAT-024).

| ID | Funcionalidade | Descrição | Prior. | Status | Origem |
|---|---|---|---|---|---|
| FEAT-026 | Relatório por categoria | Visão de quanto foi gasto em cada categoria em uma competência. | Won't (V2.0) | Não iniciado | 💡 |
| FEAT-027 | Comparativo entre meses | Comparação de gastos entre competências diferentes. | Won't (V2.0) | Não iniciado | 💡 |
| FEAT-028 | Gráficos do relatório | Representação visual dos gastos por categoria e por período. | Won't (V2.0) | Não iniciado | 💡 |
| FEAT-029 | Rateio entre membros | Cálculo de quanto cada membro deve/recebe para equilibrar as despesas da residência. | Won't (V2.0) | Não iniciado | 💡 |

## EP-06 — Administração e Auditoria

| ID | Funcionalidade | Descrição | Prior. | Status | Origem |
|---|---|---|---|---|---|
| FEAT-030 | Papel ADMIN | Papel de sistema com acesso à área administrativa. | Won't (V2.0) | Não iniciado | 💡 |
| FEAT-031 | Trilha de auditoria | Registro de eventos sensíveis (criação de residência, entrada/saída de membro, exclusão de despesa). | Won't (V2.0) | Não iniciado | 💡 |
| FEAT-032 | Monitoramento de acessos | Visualização de logins e acessos para o ADMIN. | Won't (V2.0) | Não iniciado | 💡 |

---

# 2. Estórias de Usuário

## 2.1 Personas

| Persona | Descrição |
|---|---|
| **Visitante** | Ainda não autenticado. |
| **Usuário autenticado** | Possui conta e sessão ativa. Pode ou não pertencer a alguma residência. |
| **Owner** | Usuário autenticado que criou a residência. Herda tudo do Membro e decide sobre entradas. |
| **Membro** | Usuário autenticado que pertence a uma residência. |
| **ADMIN** 💡 | Papel de sistema, com acesso à auditoria. Fora do escopo da V2.0. |

## 2.2 Template de estória

> Copie o bloco abaixo para criar novas estórias.

```
### US-0XX — <título curto e acionável>

Vinculada a: FEAT-0XX | Prioridade: <Must/Should/Could> | Status: <status> | Origem: <📄/💡/⬜>

Como <persona>,
quero <ação/capacidade>,
para que <benefício percebido>.

Critérios de aceitação
- [ ] CA-1: ...
- [ ] CA-2: ...

Regras de negócio
- RN-0XX: ...

Notas técnicas
- Rota: ...
- Entidades afetadas: ...
- Validações: ...

Cenários BDD relacionados: CEN-0XX.1, CEN-0XX.2
```

---

## 2.3 Estórias — EP-02: Gestão de Residências

### US-001 — Ver o menu principal do aplicativo

**Vinculada a:** FEAT-004 | **Prioridade:** Must | **Status:** Não iniciado | **Origem:** 📄

> Como **usuário autenticado**,
> quero **ver um menu com as opções de residência ao entrar no app**,
> para que **eu saiba quais caminhos tenho disponíveis logo no primeiro acesso**.

**Critérios de aceitação**

- [ ] CA-1: Ao acessar `/app` autenticado, vejo as opções "Residências", "Criar residência" e "Entrar em residência".
- [ ] CA-2: "Residências" me leva à lista de residências das quais participo.
- [ ] CA-3: "Criar residência" me leva à tela de criação.
- [ ] CA-4: "Entrar em residência" me leva à tela de entrada por código.
- [ ] CA-5: Se eu não estiver autenticado, sou redirecionado para o login. 💡

**Regras de negócio**

- **RN-001:** A rota `/app` exige sessão ativa. 💡

**Notas técnicas**

- Rota: `/app`
- ⬜ **A definir:** o menu deve destacar visualmente alguma opção quando o usuário ainda não pertence a nenhuma residência? **Sugestão 💡:** sim — destacar "Criar residência" reduz o atrito do primeiro acesso.

**Cenários BDD relacionados:** CEN-001.1, CEN-001.2

---

### US-002 — Criar uma residência

**Vinculada a:** FEAT-005 | **Prioridade:** Must | **Status:** Não iniciado | **Origem:** 📄

> Como **usuário autenticado**,
> quero **criar uma residência informando um nome**,
> para que **eu possa reunir outras pessoas e compartilhar as despesas da casa**.

**Critérios de aceitação**

- [ ] CA-1: A tela de criação apresenta o campo "Nome da residência".
- [ ] CA-2: Ao submeter um nome válido, a residência é criada com `id` (chave primária) e `code` único.
- [ ] CA-3: O usuário que criou torna-se automaticamente o **Owner** e o primeiro membro. 💡
- [ ] CA-4: Após a criação, é exibido um modal de sucesso com a mensagem de confirmação.
- [ ] CA-5: O modal oferece duas ações: **convidar usuários** (ícone) e **confirmar** (ícone).
- [ ] CA-6: Ao clicar em "confirmar", o modal fecha e o usuário é levado ao painel da residência. 💡
- [ ] CA-7: Nome inválido bloqueia a criação e exibe mensagem de erro junto ao campo. 💡

**Regras de negócio**

- **RN-002:** O `code` é único em todo o sistema, curto e gerado pelo sistema (nunca informado pelo usuário). 📄
- **RN-003 ⬜:** Restrições do nome da residência — *"restrições de nome serão descritas"* no esboço.
  **Sugestão 💡 para preencher:** obrigatório; 3 a 40 caracteres; letras, números, espaços e acentos; sem espaços no início/fim; não pode ser só espaços.
- **RN-004 ⬜:** Formato do `code`. **Sugestão 💡:** 6 caracteres alfanuméricos maiúsculos, excluindo caracteres ambíguos (`O`, `0`, `I`, `1`) para facilitar a leitura e a digitação manual.
- **RN-005 ⬜:** Um usuário pode criar quantas residências? **Sugestão 💡:** sem limite na V2.0, mas registrar como ponto de atenção para abuso.
- **RN-006 💡:** Nomes de residência **não** precisam ser únicos — a identificação é feita pelo `code`.

**Notas técnicas**

- Rota: `/app/residences/new`
- Entidades: cria `Residence`, cria `Membership` do criador com papel `OWNER`.
- Geração do `code`: deve tratar colisão (tentar novamente até obter um código livre).

**Cenários BDD relacionados:** CEN-002.1, CEN-002.2, CEN-002.3

---

### US-003 — Listar as residências das quais participo

**Vinculada a:** FEAT-006 | **Prioridade:** Must | **Status:** Não iniciado | **Origem:** 📄

> Como **membro**,
> quero **ver a lista das residências às quais pertenço**,
> para que **eu possa escolher em qual delas quero trabalhar**.

**Critérios de aceitação**

- [ ] CA-1: A lista é vertical, com um container por residência.
- [ ] CA-2: Cada container exibe o **nome da residência** como título principal.
- [ ] CA-3: Cada container exibe o **nome do criador** como título secundário, precedido de um ícone que remete a criador/administrador.
- [ ] CA-4: Cada container possui o botão **copiar código** (ícone de copiar).
- [ ] CA-5: Cada container possui o botão **ver residência** (ícone de seta para a direita), que navega para `/app/residences/{code}`.
- [ ] CA-6: Se o usuário não pertence a nenhuma residência, é exibida a mensagem **"Você não está cadastrado em nenhuma residência"**.
- [ ] CA-7: A lista inclui as residências que o próprio usuário criou. 💡

**Regras de negócio**

- **RN-007:** A lista contém exclusivamente residências das quais o usuário é membro ativo. 📄
- **RN-008 ⬜:** Ordenação da lista. **Sugestão 💡:** mais recentemente acessada primeiro; na falta desse dado, ordem de entrada na residência.

**Notas técnicas**

- Rota: `/app/residences`
- ⬜ **A definir:** haverá paginação? **Sugestão 💡:** desnecessária na V2.0 — o volume esperado por usuário é baixo.

**Cenários BDD relacionados:** CEN-003.1, CEN-003.2

---

### US-004 — Copiar o código da residência

**Vinculada a:** FEAT-007 | **Prioridade:** Should | **Status:** Não iniciado | **Origem:** 📄

> Como **membro**,
> quero **copiar o código da residência com um clique**,
> para que **eu possa compartilhá-lo rapidamente com quem quero convidar**.

**Critérios de aceitação**

- [ ] CA-1: Clicar no ícone de copiar coloca o `code` na área de transferência.
- [ ] CA-2: Uma confirmação visual é exibida após a cópia (ex.: "Código copiado!"). 💡
- [ ] CA-3: Se o navegador negar acesso à área de transferência, o código é exibido para cópia manual. 💡

**Cenários BDD relacionados:** CEN-004.1

---

### US-005 — Acessar o painel de uma residência

**Vinculada a:** FEAT-008 | **Prioridade:** Must | **Status:** Não iniciado | **Origem:** 📄

> Como **membro**,
> quero **abrir o painel de uma residência específica**,
> para que **eu possa consultar ou cadastrar despesas dela**.

**Critérios de aceitação**

- [ ] CA-1: A rota é `/app/residences/{code}`.
- [ ] CA-2: O **nome da residência** é o título principal da tela.
- [ ] CA-3: O **código** é o título secundário.
- [ ] CA-4: A tela apresenta os botões "Consultar despesas" e "Cadastrar despesas".
- [ ] CA-5: Se o usuário **não é membro** da residência, o acesso é negado. 💡
- [ ] CA-6: Se o código não corresponde a nenhuma residência, é exibida uma página de não encontrado. 💡

**Regras de negócio**

- **RN-009 💡:** A rota é identificada pelo `code`, não pelo `id`. O `id` não deve ser exposto na URL.
- **RN-010 💡:** Um não-membro que acessa a URL diretamente deve receber a **mesma** resposta de "não encontrado" dada a um código inexistente — assim não é possível descobrir quais códigos existem testando URLs.

**Cenários BDD relacionados:** CEN-005.1, CEN-005.2, CEN-005.3

---

## 2.4 Estórias — EP-03: Convites e Solicitações

### US-006 — Solicitar entrada em uma residência por código

**Vinculada a:** FEAT-013 | **Prioridade:** Must | **Status:** Não iniciado | **Origem:** 📄

> Como **usuário autenticado**,
> quero **informar o código de uma residência para pedir para entrar**,
> para que **eu possa participar da casa em que moro e lançar minhas despesas**.

**Critérios de aceitação**

- [ ] CA-1: A tela apresenta um campo para inserir o código da residência.
- [ ] CA-2: Se a residência existe, uma **solicitação de entrada** é enviada ao Owner.
- [ ] CA-3: O usuário recebe confirmação de que a solicitação foi enviada e fica aguardando resposta.
- [ ] CA-4: Se o código não existe, é exibida mensagem de erro e nenhuma solicitação é criada.
- [ ] CA-5: Se o usuário já é membro daquela residência, o sistema informa isso e não cria solicitação. 💡
- [ ] CA-6: Se já existe uma solicitação pendente do usuário para aquela residência, o sistema não cria uma duplicada. 💡

**Regras de negócio**

- **RN-011:** A entrada **nunca** é automática — depende sempre da aprovação do Owner. 📄
- **RN-012 💡:** O código deve ser tratado sem diferenciar maiúsculas de minúsculas e ignorando espaços nas pontas, para tolerar erros de digitação e colagem.
- **RN-013 💡:** Uma solicitação recusada pode ser refeita, mas sujeita a um intervalo mínimo, para evitar insistência abusiva. ⬜ *Definir o intervalo.*

**Notas técnicas**

- Rota: `/app/residences/join`
- Entidades: cria `JoinRequest` com status `PENDING`.
- Ver **FEAT-020** (proteção contra tentativa em massa de códigos).

**Cenários BDD relacionados:** CEN-006.1, CEN-006.2, CEN-006.3, CEN-006.4

---

### US-007 — Convidar um usuário para a residência

**Vinculada a:** FEAT-014 | **Prioridade:** Must | **Status:** Não iniciado | **Origem:** 📄 | **Depende de:** D-01 / FEAT-003

> Como **owner**,
> quero **convidar um usuário pelo nome de usuário**,
> para que **ele entre na residência sem precisar que eu passe o código por fora do app**.

**Critérios de aceitação**

- [ ] CA-1: O modal de sucesso da criação oferece a ação "convidar usuários".
- [ ] CA-2: A ação abre um modal com um campo para informar o **nome de usuário**.
- [ ] CA-3: Ao confirmar, o usuário informado recebe uma notificação de convite.
- [ ] CA-4: Se o nome de usuário não existe, é exibida mensagem de erro e nenhum convite é criado.
- [ ] CA-5: Se o usuário já é membro, o sistema informa e não cria o convite. 💡
- [ ] CA-6: Se já existe convite pendente para aquele usuário, não é criado outro. 💡
- [ ] CA-7: O convite também pode ser enviado a partir do painel da residência, não só logo após a criação. 💡

**Regras de negócio**

- **RN-014:** Apenas o Owner pode convidar. 📄
- **RN-015 ⬜:** Convite expira? **Sugestão 💡:** sim, em 7 dias, para não deixar convites pendentes indefinidamente.

**Cenários BDD relacionados:** CEN-007.1, CEN-007.2

---

### US-008 — Responder a um convite recebido

**Vinculada a:** FEAT-015 | **Prioridade:** Must | **Status:** Não iniciado | **Origem:** 📄

> Como **usuário autenticado convidado**,
> quero **aceitar ou recusar um convite de residência**,
> para que **eu só participe das casas que realmente me dizem respeito**.

**Critérios de aceitação**

- [ ] CA-1: O usuário convidado visualiza o convite recebido, com o nome da residência e quem convidou.
- [ ] CA-2: Ao **aceitar**, o usuário passa a ser membro e a residência aparece na sua lista.
- [ ] CA-3: Ao **recusar**, nenhum vínculo é criado e o convite deixa de estar pendente.
- [ ] CA-4: Um convite já respondido não pode ser respondido novamente. 💡

**Regras de negócio**

- **RN-016 💡:** Aceitar convite dispensa aprovação do Owner — ele já manifestou a intenção ao convidar.

**Cenários BDD relacionados:** CEN-008.1, CEN-008.2

---

### US-009 — Responder a uma solicitação de entrada

**Vinculada a:** FEAT-016 | **Prioridade:** Must | **Status:** Não iniciado | **Origem:** 📄

> Como **owner**,
> quero **aceitar ou recusar as solicitações de entrada na minha residência**,
> para que **somente pessoas autorizadas vejam as despesas da casa**.

**Critérios de aceitação**

- [ ] CA-1: O Owner visualiza as solicitações pendentes com o nome do solicitante.
- [ ] CA-2: Ao **aceitar**, o solicitante passa a ser membro da residência.
- [ ] CA-3: Ao **recusar**, nenhum vínculo é criado e a solicitação deixa de estar pendente.
- [ ] CA-4: O solicitante é notificado da decisão. 💡
- [ ] CA-5: Um usuário que não é o Owner não consegue responder solicitações. 💡

**Regras de negócio**

- **RN-017:** Cada residência tem exatamente um Owner, e apenas ele decide sobre entradas. 📄

**Cenários BDD relacionados:** CEN-009.1, CEN-009.2, CEN-009.3

---

## 2.5 Estórias — EP-04: Despesas

### US-010 — Cadastrar minhas despesas na residência

**Vinculada a:** FEAT-021 | **Prioridade:** Must | **Status:** Não iniciado | **Origem:** 📄

> Como **membro**,
> quero **cadastrar minhas próprias despesas quando eu quiser**,
> para que **eu não dependa de outra pessoa lançar tudo de uma vez**.

**Critérios de aceitação**

- [ ] CA-1: O membro cadastra despesas informando, no mínimo, nome, valor e competência (mês/ano).
- [ ] CA-2: O lançamento é **incremental** — o membro pode cadastrar uma despesa por vez, em momentos diferentes do mês.
- [ ] CA-3: A despesa fica vinculada à residência e ao membro que a lançou.
- [ ] CA-4: Valores inválidos (zero, negativo, não numérico) são rejeitados com mensagem clara. 💡
- [ ] CA-5: Ao cadastrar, o membro seleciona uma **categoria**. 💡 *(FEAT-024 — pré-requisito dos relatórios)*

**Regras de negócio**

- **RN-018:** Um membro lança despesas **apenas** em residências às quais pertence. 📄
- **RN-019 ⬜:** Um membro pode lançar despesa em nome de outro? **Sugestão 💡:** não na V2.0 — cada um lança as suas. Isso mantém a autoria confiável para o rateio futuro (FEAT-029).
- **RN-020 ⬜:** É permitido lançar despesa em competência passada ou futura? **Sugestão 💡:** permitir competências passadas (lançamento atrasado é o caso real mais comum) e bloquear competências futuras.

**Notas técnicas**

- Rota: `/app/residences/{code}/expenses/new`
- Ver dependência **D-02** (remodelagem de `Expense`).

**Cenários BDD relacionados:** CEN-010.1, CEN-010.2, CEN-010.3

---

### US-011 — Consultar as despesas da residência

**Vinculada a:** FEAT-022 | **Prioridade:** Must | **Status:** ⬜ **A definir** | **Origem:** 📄

> Como **membro**,
> quero **consultar as despesas da residência**,
> para que **eu acompanhe quanto a casa está gastando**.

> ⬜ **Comportamento ainda não definido no esboço** — *"Ainda estou pensando no comportamento dessa funcionalidade"*.

**Perguntas a responder antes de implementar:**

| # | Pergunta | Sugestão do Claude 💡 |
|---|---|---|
| Q-1 | O membro vê as despesas de **todos** os membros ou só as suas? | Todos — a residência é um espaço compartilhado; a transparência é a razão de existir do recurso. |
| Q-2 | A consulta é sempre filtrada por competência (mês/ano)? | Sim, com o mês corrente pré-selecionado. |
| Q-3 | Qual o agrupamento padrão da visualização? | Por membro, com o total da residência em destaque. |
| Q-4 | Deve existir um total por membro e um total geral? | Sim, ambos. |
| Q-5 | Alguém pode editar/excluir despesa alheia? | Não — só o autor edita a própria (ver FEAT-023). |
| Q-6 | Existe estado vazio? | Sim: "Nenhuma despesa cadastrada nesta competência." |

**Critérios de aceitação:** ⬜ *Preencher após responder as perguntas acima.*

**Cenários BDD relacionados:** CEN-011.1 *(rascunho — ver seção 3.6)*

---

### 2.6 Estórias pendentes de escrita

> Funcionalidades já no backlog que ainda não têm estória detalhada. Use o template da seção 2.2.

| Estória | Funcionalidade | Origem |
|---|---|---|
| US-012 | FEAT-023 — Editar / excluir despesa própria | 💡 |
| US-013 | FEAT-009 — Sair da residência | 💡 |
| US-014 | FEAT-010 — Remover membro | 💡 |
| US-015 | FEAT-011 — Transferir propriedade | 💡 |
| US-016 | FEAT-017 — Central de notificações | 💡 |
| US-017 | FEAT-019 — Regenerar código | 💡 |
| US-018 | FEAT-024 — Categoria da despesa | 💡 |

---

# 3. Cenários BDD

Escritos em **Gherkin (pt-BR)**. A diretiva `# language: pt` habilita as palavras-chave em português no Cucumber e ferramentas compatíveis.

**Palavras-chave:** `Funcionalidade`, `Contexto`, `Cenário`, `Esquema do Cenário`, `Exemplos`, `Dado`, `Quando`, `Então`, `E`, `Mas`.

## 3.1 Template de funcionalidade

```gherkin
# language: pt

Funcionalidade: <nome da funcionalidade>
  Vinculada a: FEAT-0XX | US-0XX

  Contexto:
    Dado que <pré-condição comum a todos os cenários>

  # CEN-0XX.1 — <caminho feliz>
  Cenário: <resultado esperado em uma frase>
    Dado <estado inicial>
    Quando <ação do usuário>
    Então <resultado observável>
    E <resultado adicional>
```

---

## 3.2 Menu principal (US-001)

```gherkin
# language: pt

Funcionalidade: Menu principal do aplicativo
  Vinculada a: FEAT-004 | US-001

  Contexto:
    Dado que existe um usuário chamado "Gabriel"
    E que "Gabriel" está autenticado

  # CEN-001.1
  Cenário: Visualizar as opções do menu principal
    Quando "Gabriel" acessa a rota "/app"
    Então ele vê a opção "Residências"
    E ele vê a opção "Criar residência"
    E ele vê a opção "Entrar em residência"

  # CEN-001.2 — 💡 Sugestão do Claude
  Cenário: Usuário não autenticado é redirecionado
    Dado que "Gabriel" não está autenticado
    Quando ele acessa a rota "/app"
    Então ele é redirecionado para a tela de login
```

---

## 3.3 Criação de residência (US-002)

```gherkin
# language: pt

Funcionalidade: Criação de residência
  Vinculada a: FEAT-005 | US-002

  Contexto:
    Dado que existe um usuário chamado "Gabriel"
    E que "Gabriel" está autenticado
    E que ele está na tela de criação de residência

  # CEN-002.1 — caminho feliz
  Cenário: Criar residência com nome válido
    Quando ele informa "Casa da Praia" no campo "Nome da residência"
    E confirma a criação
    Então a residência "Casa da Praia" é criada
    E a residência recebe um código único
    E "Gabriel" é registrado como criador da residência
    E um modal de sucesso é exibido com a mensagem de residência criada
    E o modal apresenta a opção de convidar usuários
    E o modal apresenta a opção de confirmar

  # CEN-002.2
  Cenário: Confirmar o modal de sucesso
    Dado que "Gabriel" acabou de criar a residência "Casa da Praia"
    E que o modal de sucesso está visível
    Quando ele aciona a opção de confirmar
    Então o modal é fechado
    E ele é direcionado ao painel da residência "Casa da Praia"

  # CEN-002.3 — 💡 Sugestão do Claude (depende de RN-003)
  Esquema do Cenário: Recusar nomes inválidos de residência
    Quando ele informa "<nome>" no campo "Nome da residência"
    E confirma a criação
    Então a residência não é criada
    E é exibida a mensagem de erro "<mensagem>"

    Exemplos:
      | nome                                        | mensagem                                     |
      |                                             | Informe o nome da residência                 |
      | ab                                          | O nome deve ter ao menos 3 caracteres        |
      | <texto com 41 caracteres>                   | O nome deve ter no máximo 40 caracteres      |
```

---

## 3.4 Lista de residências (US-003 e US-004)

```gherkin
# language: pt

Funcionalidade: Lista de residências do usuário
  Vinculada a: FEAT-006, FEAT-007 | US-003, US-004

  Contexto:
    Dado que existe um usuário chamado "Gabriel"
    E que "Gabriel" está autenticado

  # CEN-003.1 — caminho feliz
  Cenário: Visualizar as residências das quais participo
    Dado que existe a residência "Casa da Praia" criada por "Marina"
    E que "Gabriel" é membro da residência "Casa da Praia"
    Quando ele acessa a lista de residências
    Então ele vê um item com o título "Casa da Praia"
    E o item exibe "Marina" como criador
    E o item apresenta a opção de copiar o código
    E o item apresenta a opção de ver a residência

  # CEN-003.2 — estado vazio
  Cenário: Usuário sem nenhuma residência
    Dado que "Gabriel" não é membro de nenhuma residência
    Quando ele acessa a lista de residências
    Então ele vê a mensagem "Você não está cadastrado em nenhuma residência"

  # CEN-004.1
  Cenário: Copiar o código da residência
    Dado que "Gabriel" é membro da residência "Casa da Praia" de código "K7RB2M"
    E que ele está na lista de residências
    Quando ele aciona a opção de copiar o código da residência "Casa da Praia"
    Então o valor "K7RB2M" é copiado para a área de transferência
    E é exibida uma confirmação de que o código foi copiado
```

---

## 3.5 Painel da residência (US-005)

```gherkin
# language: pt

Funcionalidade: Painel da residência
  Vinculada a: FEAT-008 | US-005

  Contexto:
    Dado que existe a residência "Casa da Praia" de código "K7RB2M"
    E que existe um usuário chamado "Gabriel"
    E que "Gabriel" está autenticado

  # CEN-005.1 — caminho feliz
  Cenário: Membro acessa o painel da residência
    Dado que "Gabriel" é membro da residência "Casa da Praia"
    Quando ele acessa a rota "/app/residences/K7RB2M"
    Então ele vê "Casa da Praia" como título principal
    E ele vê "K7RB2M" como título secundário
    E ele vê o botão "Consultar despesas"
    E ele vê o botão "Cadastrar despesas"

  # CEN-005.2 — 💡 Sugestão do Claude (RN-010)
  Cenário: Não-membro não acessa o painel
    Dado que "Gabriel" não é membro da residência "Casa da Praia"
    Quando ele acessa a rota "/app/residences/K7RB2M"
    Então ele vê uma página de residência não encontrada
    E nenhuma informação da residência "Casa da Praia" é exibida

  # CEN-005.3 — 💡 Sugestão do Claude
  Cenário: Código inexistente
    Quando ele acessa a rota "/app/residences/ZZZZZZ"
    Então ele vê uma página de residência não encontrada
```

---

## 3.6 Entrada por código (US-006)

```gherkin
# language: pt

Funcionalidade: Solicitação de entrada em residência por código
  Vinculada a: FEAT-013 | US-006

  Contexto:
    Dado que existe a residência "Casa da Praia" de código "K7RB2M" criada por "Marina"
    E que existe um usuário chamado "Gabriel"
    E que "Gabriel" está autenticado
    E que ele está na tela de entrada em residência

  # CEN-006.1 — caminho feliz
  Cenário: Solicitar entrada com código válido
    Dado que "Gabriel" não é membro da residência "Casa da Praia"
    Quando ele informa o código "K7RB2M"
    E confirma a solicitação
    Então uma solicitação de entrada é enviada para "Marina"
    E "Gabriel" vê a confirmação de que a solicitação foi enviada
    Mas "Gabriel" ainda não é membro da residência "Casa da Praia"

  # CEN-006.2
  Cenário: Código inexistente
    Quando ele informa o código "ZZZZZZ"
    E confirma a solicitação
    Então nenhuma solicitação de entrada é criada
    E é exibida uma mensagem informando que a residência não foi encontrada

  # CEN-006.3 — 💡 Sugestão do Claude
  Cenário: Usuário já é membro da residência
    Dado que "Gabriel" já é membro da residência "Casa da Praia"
    Quando ele informa o código "K7RB2M"
    E confirma a solicitação
    Então nenhuma solicitação de entrada é criada
    E é exibida uma mensagem informando que ele já participa dessa residência

  # CEN-006.4 — 💡 Sugestão do Claude
  Cenário: Solicitação pendente não é duplicada
    Dado que "Gabriel" já possui uma solicitação pendente para a residência "Casa da Praia"
    Quando ele informa o código "K7RB2M"
    E confirma a solicitação
    Então nenhuma solicitação adicional é criada
    E é exibida uma mensagem informando que a solicitação já está aguardando resposta
```

---

## 3.7 Convite de usuários (US-007 e US-008)

```gherkin
# language: pt

Funcionalidade: Convite de usuários para a residência
  Vinculada a: FEAT-014, FEAT-015 | US-007, US-008
  Observação: depende do identificador público de usuário (FEAT-003 / D-01)

  Contexto:
    Dado que existe um usuário com nome de usuário "marina"
    E que existe um usuário com nome de usuário "gabriel"
    E que "marina" criou a residência "Casa da Praia"
    E que "marina" está autenticada

  # CEN-007.1 — caminho feliz
  Cenário: Owner convida um usuário existente
    Dado que "marina" abriu o modal de convite da residência "Casa da Praia"
    Quando ela informa o nome de usuário "gabriel"
    E confirma o convite
    Então um convite para a residência "Casa da Praia" é enviado a "gabriel"
    E "gabriel" recebe a notificação do convite

  # CEN-007.2
  Cenário: Convidar nome de usuário inexistente
    Dado que "marina" abriu o modal de convite da residência "Casa da Praia"
    Quando ela informa o nome de usuário "usuario-que-nao-existe"
    E confirma o convite
    Então nenhum convite é criado
    E é exibida uma mensagem informando que o usuário não foi encontrado

  # CEN-008.1 — caminho feliz
  Cenário: Convidado aceita o convite
    Dado que "gabriel" recebeu um convite para a residência "Casa da Praia"
    E que "gabriel" está autenticado
    Quando ele aceita o convite
    Então "gabriel" passa a ser membro da residência "Casa da Praia"
    E a residência "Casa da Praia" aparece na lista de residências de "gabriel"

  # CEN-008.2
  Cenário: Convidado recusa o convite
    Dado que "gabriel" recebeu um convite para a residência "Casa da Praia"
    E que "gabriel" está autenticado
    Quando ele recusa o convite
    Então "gabriel" não é membro da residência "Casa da Praia"
    E o convite deixa de constar como pendente
```

---

## 3.8 Aprovação de solicitações (US-009)

```gherkin
# language: pt

Funcionalidade: Aprovação de solicitações de entrada
  Vinculada a: FEAT-016 | US-009

  Contexto:
    Dado que "marina" criou a residência "Casa da Praia"
    E que "gabriel" solicitou entrada na residência "Casa da Praia"

  # CEN-009.1 — caminho feliz
  Cenário: Owner aceita a solicitação
    Dado que "marina" está autenticada
    Quando ela aceita a solicitação de "gabriel"
    Então "gabriel" passa a ser membro da residência "Casa da Praia"
    E "gabriel" é notificado de que a solicitação foi aceita

  # CEN-009.2
  Cenário: Owner recusa a solicitação
    Dado que "marina" está autenticada
    Quando ela recusa a solicitação de "gabriel"
    Então "gabriel" não é membro da residência "Casa da Praia"
    E a solicitação deixa de constar como pendente

  # CEN-009.3 — 💡 Sugestão do Claude (RN-017)
  Cenário: Membro comum não pode responder solicitações
    Dado que "carlos" é membro da residência "Casa da Praia" mas não é o criador
    E que "carlos" está autenticado
    Quando ele tenta aceitar a solicitação de "gabriel"
    Então a ação é negada
    E "gabriel" não é membro da residência "Casa da Praia"
```

---

## 3.9 Cadastro de despesas (US-010)

```gherkin
# language: pt

Funcionalidade: Cadastro de despesas pelo próprio membro
  Vinculada a: FEAT-021 | US-010

  Contexto:
    Dado que existe a residência "Casa da Praia" de código "K7RB2M"
    E que "gabriel" é membro da residência "Casa da Praia"
    E que "gabriel" está autenticado

  # CEN-010.1 — caminho feliz
  Cenário: Cadastrar uma despesa
    Quando ele cadastra a despesa "Conta de luz" no valor de 180.50 para a competência 08/2026
    Então a despesa "Conta de luz" é registrada na residência "Casa da Praia"
    E a despesa consta como lançada por "gabriel"
    E a despesa consta na competência 08/2026

  # CEN-010.2 — lançamento incremental (essência da mudança da V2.0)
  Cenário: Cadastrar despesas em momentos diferentes do mesmo mês
    Dado que "gabriel" já cadastrou a despesa "Conta de luz" na competência 08/2026
    Quando ele cadastra a despesa "Supermercado" no valor de 340.00 para a competência 08/2026
    Então a residência "Casa da Praia" possui 2 despesas na competência 08/2026
    E ambas constam como lançadas por "gabriel"

  # CEN-010.3 — 💡 Sugestão do Claude
  Esquema do Cenário: Recusar valores inválidos
    Quando ele cadastra a despesa "Conta de luz" no valor de <valor> para a competência 08/2026
    Então a despesa não é registrada
    E é exibida a mensagem de erro "<mensagem>"

    Exemplos:
      | valor  | mensagem                             |
      | 0      | O valor deve ser maior que zero      |
      | -50.00 | O valor deve ser maior que zero      |

  # CEN-010.4 — 💡 Sugestão do Claude (RN-018)
  Cenário: Não-membro não cadastra despesa
    Dado que "carlos" não é membro da residência "Casa da Praia"
    E que "carlos" está autenticado
    Quando ele tenta cadastrar uma despesa na residência "Casa da Praia"
    Então a ação é negada
    E nenhuma despesa é registrada na residência "Casa da Praia"
```

---

## 3.10 Consulta de despesas (US-011) — rascunho

> ⬜ **Rascunho.** Depende das respostas de Q-1 a Q-6 (seção 2.5). O cenário abaixo assume as sugestões 💡 propostas lá — **revise antes de implementar**.

```gherkin
# language: pt

Funcionalidade: Consulta de despesas da residência
  Vinculada a: FEAT-022 | US-011
  Status: rascunho — comportamento em definição

  Contexto:
    Dado que existe a residência "Casa da Praia"
    E que "gabriel" e "marina" são membros da residência "Casa da Praia"
    E que "gabriel" está autenticado

  # CEN-011.1 — 💡 rascunho, assume Q-1 = "vê despesas de todos"
  Cenário: Consultar as despesas da competência corrente
    Dado que "gabriel" lançou 180.50 em "Conta de luz" na competência 08/2026
    E que "marina" lançou 340.00 em "Supermercado" na competência 08/2026
    Quando ele consulta as despesas da residência na competência 08/2026
    Então ele vê a despesa "Conta de luz" atribuída a "gabriel"
    E ele vê a despesa "Supermercado" atribuída a "marina"
    E ele vê o total da residência de 520.50

  # CEN-011.2 — 💡 rascunho, estado vazio (Q-6)
  Cenário: Competência sem despesas
    Dado que não há despesas na competência 09/2026
    Quando ele consulta as despesas da residência na competência 09/2026
    Então ele vê a mensagem "Nenhuma despesa cadastrada nesta competência"
```

---

# 4. Anexos

## 4.1 Matriz de rastreabilidade

| Épico | Funcionalidade | Estória | Cenários |
|---|---|---|---|
| EP-02 | FEAT-004 | US-001 | CEN-001.1, CEN-001.2 |
| EP-02 | FEAT-005 | US-002 | CEN-002.1, CEN-002.2, CEN-002.3 |
| EP-02 | FEAT-006 | US-003 | CEN-003.1, CEN-003.2 |
| EP-02 | FEAT-007 | US-004 | CEN-004.1 |
| EP-02 | FEAT-008 | US-005 | CEN-005.1, CEN-005.2, CEN-005.3 |
| EP-03 | FEAT-013 | US-006 | CEN-006.1 a CEN-006.4 |
| EP-03 | FEAT-014 | US-007 | CEN-007.1, CEN-007.2 |
| EP-03 | FEAT-015 | US-008 | CEN-008.1, CEN-008.2 |
| EP-03 | FEAT-016 | US-009 | CEN-009.1, CEN-009.2, CEN-009.3 |
| EP-04 | FEAT-021 | US-010 | CEN-010.1 a CEN-010.4 |
| EP-04 | FEAT-022 | US-011 ⬜ | CEN-011.1, CEN-011.2 (rascunho) |

## 4.2 Decisões pendentes (checklist)

- [ ] **RN-003** — Definir as restrições do nome da residência.
- [ ] **RN-004** — Definir o formato e o tamanho do `code`.
- [ ] **RN-005** — Definir se há limite de residências por usuário.
- [ ] **RN-013** — Definir o intervalo mínimo para refazer solicitação recusada.
- [ ] **RN-015** — Definir se o convite expira e em quanto tempo.
- [ ] **RN-019** — Definir se um membro pode lançar despesa em nome de outro.
- [ ] **RN-020** — Definir se competências passadas/futuras são permitidas.
- [ ] **D-01** — Decidir entre criar `username` ou convidar por e-mail.
- [ ] **D-03** — Decidir o destino do modelo `Person` na V2.0.
- [ ] **Q-1 a Q-6** — Definir o comportamento da consulta de despesas (FEAT-022).

## 4.3 Esboço de modelo de dados 💡

> **Sugestão do Claude — não implementada.** Serve para tornar as estórias acima executáveis e para orientar a migração. Revise antes de aplicar.

```
Residence
  id        Int      (PK)
  name      String
  code      String   (único)
  ownerId   Int      -> User
  createdAt DateTime

Membership            // relação N:M entre User e Residence
  id           Int    (PK)
  userId       Int    -> User
  residenceId  Int    -> Residence
  role         Enum   (OWNER | MEMBER)
  joinedAt     DateTime
  (único: userId + residenceId)

Invite                // Owner -> Usuário
  id           Int    (PK)
  residenceId  Int    -> Residence
  invitedUserId Int   -> User
  invitedById  Int    -> User
  status       Enum   (PENDING | ACCEPTED | DECLINED | EXPIRED)
  createdAt    DateTime

JoinRequest           // Usuário -> Residência
  id           Int    (PK)
  residenceId  Int    -> Residence
  requesterId  Int    -> User
  status       Enum   (PENDING | ACCEPTED | DECLINED)
  createdAt    DateTime

Expense (revisado)
  id           String (PK, uuid)
  name         String
  value        Float
  month        Int
  year         Int
  residenceId  Int    -> Residence     // novo
  createdById  Int    -> User          // novo — autor do lançamento
  categoryId   Int?   -> Category      // FEAT-024
  deletedAt    DateTime?
```

**Pontos de atenção da migração (D-02):**

- As despesas atuais estão ligadas a `Person`, não a `User`/`Residence`. É preciso decidir o destino dos dados existentes antes de rodar a migração.
- `value` como `Float` é impreciso para dinheiro. **Sugestão 💡:** migrar para `Decimal` (Prisma `@db.Decimal(10,2)`) ou armazenar em centavos como inteiro.

## 4.4 Fora do escopo da V2.0

Registrado aqui para não se perder, sem entrar nesta release: relatórios por categoria com gráficos e comparativo entre meses (FEAT-026 a FEAT-028), rateio entre membros (FEAT-029) e área administrativa com auditoria (FEAT-030 a FEAT-032).

---

*Fim do documento.*
