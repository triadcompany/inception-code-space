# Passe de responsividade mobile — site + admin

**Data:** 2026-09-02
**Status:** Aprovado

## Problema

No celular (relatado pelo usuário, em todas as superfícies):
- conteúdo rola pro lado / estoura a largura;
- texto e botões desproporcionais;
- tabelas / listas / grids ruins.

Culpados concretos achados no código:

| Onde | Problema |
|---|---|
| Cabeçalhos do admin (11 telas + `AdminPageShell`) | `flex items-center justify-between` com `h1 text-3xl` fixo + botões de ação lado a lado; estoura em telas estreitas |
| `UsuariosContent` (2× `<Table>`) | colunas fixas, rola horizontal / aperta |
| Linhas de lista (`DoutrinasContent`, `EstudosContent`, `TemasContent`, `PaginasContent`, `GaleriaContent`) | `flex` com título + pill + 2 botões, apertado |
| `CultosContent` barra de busca | `Input` + `SelectTrigger w-[140px]` fixo lado a lado |
| Site público | maioria já responsivo; conferir dropdowns `min-w-[220px]`, grids, títulos hero, padding lateral |

## Abordagem

Auditoria com viewport mobile real (Playwright, 375px + 390px) + correção por
onda, re-verificando cada uma. Sem mudança no desktop — só adicionar os
breakpoints mobile que faltam.

### Onda 1 — cabeçalhos e ações do admin
- Novo `src/components/admin/AdminHeader.tsx` (título + descrição + slot de ações):
  `flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`, título
  `text-2xl sm:text-3xl`, ações `w-full sm:w-auto` e `flex-wrap`.
- Aplicar em `AdminPageShell` e nos 10 cabeçalhos inline (Cultos, Estudos,
  Doutrinas, Galeria, Configurações, Usuários, Páginas, Dashboard, Agenda).

### Onda 2 — listas e tabelas do admin
- Linhas de lista: `flex-wrap` + ações que descem pra baixo do título abaixo de
  `sm`; título com `min-w-0 truncate`.
- `UsuariosContent`: abaixo de `sm`, esconder `<Table>` e renderizar lista de
  cards (nome, e-mail, status, ações); `sm:` pra cima mantém a tabela.
- `CultosContent` busca: `flex-col sm:flex-row`, `Select` `w-full sm:w-[140px]`.

### Onda 3 — site público
- Conferir cada página em 375px: `Cultos`, `CultoDetalhe`, `EstudosBiblicos`,
  `EstudoDetalhe`, `Doutrina`, `DoutrinaDetalhe`, `Fotos`, `AoVivo`, `Sobre`,
  `VinteAnos`, `OInicio`, `CultosEspeciais`, `Contato`, `Index`.
- Corrigir: grids que não quebram, títulos hero sem step mobile, dropdowns
  `min-w-[...]` que estouram, `overflow-x` em blocos largos, padding lateral
  (`px-4`).

### Onda 4 — login / registro / perfil
- `Login`, `Registro`, `AdminLogin`, `Perfil`: padding do card (`p-6 sm:p-8`),
  `max-w`, campos e botões `w-full`, evitar corte em telas baixas.

## Verificação

Playwright screenshotando cada superfície a 375px e 390px, antes e depois de
cada onda. Admin: login real com a conta do usuário. Público: URL direta.

## Fora de escopo

- Redesign / mudança de identidade visual.
- Mudança de comportamento desktop.
- Otimização de performance / peso de imagem (já servidas de `/uploads`).

## Critérios de sucesso

- Nenhuma página com scroll horizontal em 375px.
- Cabeçalhos, listas e tabelas do admin legíveis e sem aperto em 375px.
- Botões e texto em tamanho proporcional no mobile.
- Desktop idêntico ao de antes.
