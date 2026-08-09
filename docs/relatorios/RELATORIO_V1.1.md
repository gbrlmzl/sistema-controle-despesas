# 📊 Relatório de Refatoração — CRONOS: Versão 1.1

**Data:** 2026-07-28
**Escopo:** 5 pontos de refatoração acordados no `PLANO_REFATORACAO_CRONOS.md`, mais 3 bugs graves descobertos durante a análise.
**Status:** ✅ Implementado e testado em ambiente Docker (Postgres + Next.js) no WSL.

---

## 🎯 Sumário executivo

| # | Tema | Resultado |
|---|------|-----------|
| 1 | Arquitetura REST da API | Rotas renomeadas para inglês, semântica REST, respostas padronizadas |
| 2 | Soft delete (exclusão lógica) | Coluna `deletedAt` em `Person` e `Expense`; nenhum dado mais é perdido |
| 3 | Remoção da integração Imgur | Rota, hook e chaves de API removidos |
| 4 | Avatares pré-definidos | 20 avatares SVG locais + galeria de seleção + validação por whitelist |
| 5 | `profilePic` (login Google) | Preservado; convive com avatares locais sem sobrescrita indevida |
| — | Bugs graves | Rotas quebradas e falha de segurança IDOR corrigidas |

---

## 🐛 Bugs corrigidos junto com a refatoração

### Bug 1 — Rota "Formatar Sistema" 100% quebrada
Arquivo antigo: `src/app/api/usuarios/dados/route.js`
Usava nomes de model e campos que **não existiam** no schema atual:
```js
db.usuario, db.pessoa, db.gasto      // models corretos: user, person, expense
where: { idUsuario, idPessoa }       // campos corretos: userId, personId
```
Qualquer chamada lançava exceção. **Impacto:** funcionalidade totalmente inutilizada.

### Bug 2 — `GET /api/gastos` quebrado
- Usava `prisma.expense.findMany(...)` sem importar `prisma` (só existia `db`). → `ReferenceError`.
- Linha 9: `return new NextResponse.json(...)` — sintaxe inválida (`new` aplicado a um método).

### Bug 3 — `PATCH /api/usuarios` sem autenticação (IDOR)
- Não chamava `auth()`; recebia o email pelo `formData` e atualizava aquele registro.
- **Qualquer usuário podia alterar a foto de perfil de qualquer outro** apenas enviando o email dele.

---

## 🔄 Comparativo Antes × Depois

### 🛣️ Rotas da API

| Aspecto | Antes | Depois |
|---|---|---|
| Idioma dos endpoints | Português (`/gastos`, `/pessoas`, `/usuarios`) misturado com models em inglês (`user`, `person`, `expense`) | Inglês em toda a stack (`/expenses`, `/persons`, `/users/me`) |
| "Formatar sistema" | `DELETE /api/usuarios/dados` (nome sem semântica clara + rota quebrada) | `DELETE /api/users/me/data` (semântica de "reset dos meus dados") |
| Atualização de usuário | `PATCH /api/usuarios` sem auth, aceita email pelo body | `PATCH /api/users/me` com `auth()`, usa email da sessão |
| Formato de resposta | Inconsistente: `{gastos}`, `{success, data}`, `{error}` | Padronizado: `{ success, message, data }` em todas |
| Rota Imgur | `POST /api/imgur` (upload externo) | Removida |
| Delete individual | Ausente (mas planejado no rascunho inicial) | **Intencionalmente ausente** — regra de negócio: mês registrado é imutável |

### 🗄️ Banco de dados & Exclusão

| Aspecto | Antes | Depois |
|---|---|---|
| Modelo de exclusão | Hard delete (`deleteMany`) — dados apagados fisicamente | Soft delete (`updateMany` com `deletedAt`) |
| Auditoria | Impossível reconstruir histórico | Todo o histórico preservado; consulta por `deletedAt IS NOT NULL` |
| Sobrescrita de mês/ano | `expense.deleteMany` remove os antigos e cria novos | `expense.updateMany` marca antigos como excluídos e cria novos |
| Filtro nas leituras | Todos os registros | `where: { deletedAt: null }` em todas as queries de leitura |
| Colunas novas em `Person` | — | `deletedAt DateTime?` |
| Colunas novas em `Expense` | — | `deletedAt DateTime?` |
| Migration | — | `20260728150000_add_soft_delete_deleted_at` |

### 🖼️ Foto de perfil

| Aspecto | Antes | Depois |
|---|---|---|
| Origem da foto | Upload de arquivo do usuário → Imgur → URL externa gravada no banco | Escolha entre 20 avatares SVG locais em `public/avatars/` |
| Dependência externa | Tokens `IMGUR_ACCESS_TOKEN`, `REFRESH_TOKEN`, `CLIENT_ID`, `CLIENT_SECRET` | Nenhuma |
| Fonte de verdade dos avatares | — | `src/lib/avatars.js` (`AVATARS` + `isValidAvatar`) — usada no front e no back |
| UX de troca de foto | `<input type="file">` + preview via `FileReader` | Galeria em modal com 20 opções (grid 5×4, responsivo) |
| Validação backend | Nenhuma (aceitava qualquer URL) | Whitelist: só grava se `isValidAvatar(avatar) === true` |
| E-mail no PATCH | Vinha do body (IDOR) | Vem da sessão (`session.user.email`) |
| Auth no PATCH | Ausente | Obrigatório (`auth()`) |
| Compatibilidade com Google | `profilePic` guarda URL do Google; escolha do usuário sobrescreve | Preservado — `profilePic` aceita tanto URL do Google quanto caminho `/avatars/avatar-XX.svg` |

### 🔐 Segurança

| Aspecto | Antes | Depois |
|---|---|---|
| `PATCH` de foto de perfil | Sem `auth()`; qualquer um edita qualquer usuário | `auth()` + email da sessão + whitelist do avatar |
| Segredos do Imgur | Versionados em `.env.local` (arquivo local, mas presentes em disco) | Removidos do repositório *(recomendado revogar os tokens no painel do Imgur)* |
| Superfície de ataque externa | Chamadas para API do Imgur (rate limit, disponibilidade, uploads arbitrários) | Zero — tudo local |

### 💻 Frontend (hooks + componentes)

| Arquivo | Antes | Depois |
|---|---|---|
| `src/hooks/useProfile.jsx` | Estado de upload, `FileReader`, validação de tipo/tamanho, 2 fetchs (Imgur → usuarios) | Estado de galeria/seleção, 1 fetch (`PATCH /users/me`), muito mais enxuto |
| `src/hooks/useControleDespesas.jsx` | `fetch("/api/pessoas")`, `fetch("/api/gastos")`, parse `.gastos` | `fetch("/api/persons")`, `fetch("/api/expenses")`, parse `.data` |
| `src/hooks/useCadastroDespesas.jsx` | `fetch("/api/gastos?...")`, parse `.gastos` | `fetch("/api/expenses?...")`, parse `.data` |
| `src/hooks/useCadastroPessoas.jsx` | `fetch("/api/pessoas")` | `fetch("/api/persons")` |
| `src/hooks/useFormatarSistema.jsx` | `fetch("/api/usuarios/dados")` | `fetch("/api/users/me/data")` |
| `src/app/(auth)/profile/Profile.jsx` | `<input type="file">` + botão editar | Botão "editar" abre galeria modal com 20 avatares |
| `Profile.module.css` | Estilos apenas da tela base | Estilos base **+** overlay, modal, grid, estados hover/selecionado, responsivo |

### 📁 Estrutura de arquivos

| Antes | Depois |
|---|---|
| `src/app/api/gastos/route.js` | `src/app/api/expenses/route.js` |
| `src/app/api/pessoas/route.js` | `src/app/api/persons/route.js` |
| `src/app/api/usuarios/route.js` | `src/app/api/users/me/route.js` |
| `src/app/api/usuarios/dados/route.js` | `src/app/api/users/me/data/route.js` |
| `src/app/api/imgur/route.js` | ❌ removido |
| — | `src/lib/avatars.js` (**novo**) |
| — | `public/avatars/avatar-01.svg` … `avatar-20.svg` (**novos**) |
| — | `prisma/migrations/20260728150000_add_soft_delete_deleted_at/` (**nova**) |

---

## 📦 Arquivos alterados / criados / removidos

**Criados (26):**
- `src/lib/avatars.js`
- `src/app/api/expenses/route.js`
- `src/app/api/persons/route.js`
- `src/app/api/users/me/route.js`
- `src/app/api/users/me/data/route.js`
- `public/avatars/avatar-01.svg` … `avatar-20.svg` (20 arquivos)
- `prisma/migrations/20260728150000_add_soft_delete_deleted_at/migration.sql`

**Modificados (7):**
- `prisma/schema.prisma` — colunas `deletedAt` em `Person` e `Expense`
- `src/hooks/useProfile.jsx` — reescrito para seleção de avatar
- `src/hooks/useCadastroDespesas.jsx` — novas rotas + parse `.data`
- `src/hooks/useControleDespesas.jsx` — novas rotas + parse `.data`
- `src/hooks/useCadastroPessoas.jsx` — nova rota
- `src/hooks/useFormatarSistema.jsx` — nova rota
- `src/app/(auth)/profile/Profile.jsx` — galeria modal
- `src/app/(auth)/profile/Profile.module.css` — estilos da galeria
- `.env.local` — chaves `IMGUR_*` removidas

**Removidos (5 diretórios de rota):**
- `src/app/api/gastos/`
- `src/app/api/pessoas/`
- `src/app/api/usuarios/`
- `src/app/api/imgur/`

---

## 🧪 Validação

- ✅ Aplicação sobe pelo Docker (`docker compose up --build` no WSL).
- ✅ Migration `add_soft_delete_deleted_at` aplicada via `prisma migrate deploy` no `command` do compose.
- ✅ Testes manuais reportados pelo usuário: fluxos funcionando (cadastro de pessoas/despesas, formatar sistema, troca de avatar).
- ✅ Nenhuma referência remanescente a `/api/gastos`, `/api/pessoas`, `/api/usuarios`, `/api/imgur` no código.
- ✅ Whitelist do avatar impede gravação de valores arbitrários no `profilePic`.

---


