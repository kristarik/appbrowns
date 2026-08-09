# Painel Browns Alfaiataria

Painel de atendimento e controle de clientes da Browns Alfaiataria.

Versão atual: **v0.3.0**. Ver [CHANGELOG.md](CHANGELOG.md).

## Rodar

O banco fica no VPS e não está exposto na internet, então é preciso abrir um
túnel SSH antes. São duas janelas de terminal.

Na primeira, o túnel (deixe rodando):

```bash
npm run tunel
```

Na segunda, o painel:

```bash
npm run dev
```

Abre em http://localhost:3000

Se aparecer erro de conexão com o banco, quase sempre é o túnel que caiu. Basta
rodar `npm run tunel` de novo.

## Acesso

Usuário inicial criado pelo seed:

- E-mail: `contato@kristarik.com.br`
- Senha: `browns2026`

Trocar assim que possível.

## Stack

- Next.js 16 com App Router e TypeScript
- Tailwind CSS 4
- PostgreSQL 17 com Prisma 7
- Autenticação própria: bcrypt para a senha, JWT em cookie httpOnly

## Banco de dados

Roda em container no VPS, escutando apenas em `127.0.0.1`.

- `browns_dev` para desenvolvimento
- `browns` para produção

Comandos:

```bash
npm run db:migrar
```

```bash
npm run db:popular
```

```bash
npm run db:studio
```

## Organização

```
app/
  (painel)/        telas internas, exigem sessão
    chat/          conversas
    kanban/        funil + chat
    clientes/      listagem
    tarefas/       follow-ups
  login/           fora da casca
  acoes.ts         server actions
components/
  layout/          barra de ícones, sidebar, casca
  chat/            lista, painel de mensagens, detalhes
  kanban/          quadro, cartão, tela
  clientes/        tabela
  tarefas/         lista
lib/
  tipos.ts         modelo de domínio
  funil.ts         etapas, checklist e follow-ups
  consultas.ts     leitura do banco
  db.ts            client do Prisma
  sessao.ts        JWT e cookie
  utils.ts         formatação e cálculo de urgência
prisma/
  schema.prisma    estrutura das tabelas
  seed.ts          dados iniciais
docs/
  modelo-de-dados.md
```

## Convenções

Código e nomes em português, para bater com o vocabulário do negócio: cliente,
atendimento, etapa, necessidade. Evita ficar traduzindo conceito o tempo todo.

Os identificadores dos tipos em `lib/tipos.ts` são idênticos aos enums do Prisma,
então o dado do banco chega na tela sem camada de tradução no meio.
