# Painel Browns Alfaiataria

Painel de atendimento e controle de clientes da Browns Alfaiataria.

Versão atual: **v0.1.0**. Ver [CHANGELOG.md](CHANGELOG.md).

## Rodar

```bash
npm run dev
```

Abre em http://localhost:3000

## Stack

- Next.js 16 com App Router e TypeScript
- Tailwind CSS 4
- PostgreSQL com Prisma (a partir da v0.2.0)

## Organização

```
app/
  (painel)/        telas internas, compartilham a casca com menu
    chat/          conversas
    kanban/        funil + chat
    clientes/      listagem
  login/           fora da casca
components/
  layout/          barra de ícones, sidebar, casca
  chat/            lista, painel de mensagens, detalhes
  kanban/          quadro e cartão
lib/
  tipos.ts         modelo de domínio
  dados-simulados.ts   dados de mentira, some na v0.2.0
  utils.ts         formatação e cálculo de urgência
  versao.ts        versão exibida no painel
docs/
  modelo-de-dados.md
```

## Convenções

Código e nomes em português, para bater com o vocabulário do negócio: cliente,
atendimento, etapa, necessidade. Evita ficar traduzindo conceito o tempo todo.
