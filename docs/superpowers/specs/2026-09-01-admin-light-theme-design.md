# Painel admin — tema claro escopado

**Data:** 2026-09-01
**Status:** Aprovado

## Problema

A paleta `:root` do `index.css` é toda escura (feita pro site público, que é
dark theme). O painel `/admin` é uma superfície clara, mas usa os mesmos
primitivos shadcn. Todo `Input` / `SelectTrigger` / `SelectContent` / `Dialog` /
`Popover` / toast que não tem override manual de cor herda os tokens escuros
(`--background`, `--input`, `--border`, `--popover`, `--muted-foreground`, `--ring`)
e sai azul-marinho sobre fundo claro. Ex.: a busca e o filtro de ano em
`CultosContent` (`<Input className="pl-9">` e `<SelectTrigger>` sem classe de cor).

Hoje ~15 componentes admin contornam isso repetindo
`className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] focus:border-[hsl(var(--primary))]"`
— inconsistente e fácil de esquecer.

## Solução (Abordagem A)

Escopar um **tema claro** à rota `/admin` reescrevendo os tokens shadcn numa
classe no `<html>`. Como fica no `<html>`, cobre também o conteúdo em portal
(dropdowns, modais, toasts) que renderiza fora da árvore do admin.

### Mudanças

1. **`src/index.css`** — novo bloco em `@layer base`:

   ```css
   .admin-light {
     --background: 0 0% 100%;
     --foreground: 220 30% 20%;
     --card: 0 0% 100%;
     --card-foreground: 220 30% 20%;
     --popover: 0 0% 100%;
     --popover-foreground: 220 30% 20%;
     --primary: 38 80% 55%;          /* dourado, inalterado */
     --primary-foreground: 0 0% 100%;
     --secondary: 220 20% 96%;
     --secondary-foreground: 220 30% 20%;
     --muted: 220 20% 96%;
     --muted-foreground: 220 12% 46%;
     --accent: 220 20% 94%;          /* hover de itens de menu/dropdown — cinza, não dourado */
     --accent-foreground: 220 30% 20%;
     --border: 220 20% 90%;
     --input: 220 20% 90%;
     --ring: 38 80% 55%;
   }
   ```

2. **`src/hooks/useAdminTheme.ts`** — hook que adiciona `admin-light` em
   `document.documentElement` no mount e remove no unmount.

3. **`src/pages/AdminDashboard.tsx`** e **`src/pages/AdminLogin.tsx`** — chamam
   `useAdminTheme()`.

### Fora de escopo

- Layout, espaçamento, tipografia, estados vazios, redesign.
- Limpar os overrides `bg-[hsl(...)]` já espalhados (viram redundantes,
  inofensivos; limpeza opcional depois).
- Split light/dark completo do shadcn no site público.

## Critérios de sucesso

- Busca e filtro de ano em Cultos ficam claros.
- Dropdowns (`Select`), modais (`Dialog`) e toasts dentro do painel ficam claros.
- Site público inalterado (não recebe a classe).
- Nenhuma mudança de posição/tamanho de elemento.
