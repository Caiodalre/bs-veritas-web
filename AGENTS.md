# B&S Veritas Web

## Contexto

- Projeto: `bs-veritas-web`
- Dominio: `bsveritas.com.br`
- Objetivo: site empresarial da B&S Veritas.

## Stack planejada

- Next.js com App Router
- TypeScript em modo strict
- Tailwind CSS
- Zod e React Hook Form para formularios, quando necessarios
- Vitest para testes unitarios e de componentes
- Playwright para testes de ponta a ponta
- Drizzle ORM com PostgreSQL
- pnpm como unico gerenciador de pacotes
- Git com `main` como branch principal
- Vercel para hospedagem da aplicacao
- Cloudflare para DNS e servicos de borda

## Regras de implementacao

- Usar Server Components por padrao; adicionar `use client` somente quando necessario.
- Nao usar `any`. Manter tipagem explicita e segura.
- Nao alterar a arquitetura ou a stack sem aprovacao.
- Nao instalar, remover ou atualizar dependencias sem aprovacao da etapa correspondente.
- Nao expor segredos, tokens, credenciais ou variaveis de ambiente sensiveis.
- Nao inserir dados pessoais ou empresariais reais em exemplos e testes.
- Preferir mudancas pequenas, focadas e faceis de revisar.
- Nao criar integracoes externas, recursos em nuvem ou deploys sem aprovacao.
- Nao fazer push direto para `main`.

## Validacao

- Executar somente os comandos relevantes para a etapa aprovada.
- Antes de concluir uma mudanca de codigo, validar typecheck, lint, testes e build quando esses comandos existirem.
- Informar claramente o que mudou, o que foi validado e qualquer pendencia.
- Trabalhar uma etapa por vez e aguardar aprovacao antes de avancar.
