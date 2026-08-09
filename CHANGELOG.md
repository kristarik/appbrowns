# Histórico de versões

## v0.3.2 - Números de verdade

Corrige algo que só apareceu com o painel em produção: a barra lateral mostrava
números inventados.

### O problema

Os contadores estavam cravados no código desde a época dos dados simulados. Numa
instalação nova e vazia, a lateral anunciava "Todas as conversas 8", "WhatsApp
6", "Ana 3", enquanto a lista ao lado dizia "Nenhuma conversa encontrada".

Em produção isso é pior do que não ter número: dá a entender que existem oito
conversas esperando resposta.

### O que mudou

Todos os contadores vêm do banco agora. Um contador zerado simplesmente não
aparece, para uma instalação nova não virar uma parede de zeros.

A lista de atendentes na lateral também é real: sai de quem tem conversa
atribuída, em vez de nomes fixos.

### Os filtros passaram a filtrar

Os links da lateral levavam a URLs que as telas ignoravam. Agora funcionam:

- **Chat**: minhas, não atribuídas, resolvidas, por canal e por atendente
- **Kanban**: meus, evento em até 7 dias, checklist incompleto, por interesse e
  por origem do lead
- **Follow-ups**: atrasadas, para hoje, concluídas
- **Clientes**: com atendimento aberto, cadastrados no mês

Os filtros rodam no servidor, pela URL. Isso deixa cada visão com endereço
próprio, que pode ser salvo nos favoritos ou mandado para outra pessoa.

## v0.3.1 - No ar

O painel sai da máquina de desenvolvimento e passa a rodar no VPS, em container,
ao lado do banco.

Endereço: `http://179.198.114.184:3000`

### Como ficou

- Imagem Docker em três estágios, usando a saída standalone do Next. A imagem
  final não carrega código-fonte nem dependências de desenvolvimento
- O container roda como usuário sem privilégio, não como root
- Banco de produção (`browns`) separado do de desenvolvimento (`browns_dev`),
  no mesmo Postgres
- Migrações não rodam sozinhas no deploy, de propósito: uma migração aplicada
  por engano pode apagar coluna com dado real dentro

### Sem usuário inicial em produção

O banco de produção subiu vazio, sem nenhum usuário. É proposital.

A senha do seed (`browns2026`) está escrita no repositório. Se ela existisse em
produção, qualquer pessoa com acesso ao código entraria no sistema.

O usuário é criado pelo comando `npm run usuario:producao`, que pergunta a senha
no terminal e grava só o hash. A senha não passa por arquivo nem pelo Git.

### Correções que o deploy revelou

- `prisma generate` exigia `DATABASE_URL` e quebrava a construção da imagem,
  onde banco nenhum existe
- O client do Prisma era criado ao importar o módulo, então `next build`
  quebrava ao analisar as páginas. Agora a conexão nasce no primeiro uso

## v0.3.0 - Banco e login

O painel para de esquecer. Nada mais é simulado: tudo que aparece na tela vem do
PostgreSQL, e tudo que você faz é gravado.

### Banco de dados

PostgreSQL 17 rodando no VPS, em container. Prisma 7 como ORM.

Duas bases separadas: `browns_dev` para desenvolvimento e `browns` para
produção. Rodar migração de desenvolvimento contra o banco de produção é como se
perde dado real sem querer.

O banco escuta apenas em `127.0.0.1` dentro do servidor, ou seja, não está
exposto na internet. Para desenvolver, sua máquina chega nele por um túnel SSH.

Tabelas: usuário, cliente, atendimento, tarefa, conversa e mensagem.

Dois detalhes que evitam problema mais adiante:

- Telefone do cliente é único, para o webhook do WhatsApp achar a pessoa pelo
  número em vez de criar um cadastro novo a cada mensagem
- Mensagem tem `idExterno` único, porque a Meta reenvia o mesmo evento com
  frequência e sem isso a conversa encheria de duplicatas

O checklist das etapas fica em JSON, não em colunas. Os campos variam por etapa,
então colunas fixas seriam dezenas quase sempre vazias.

### Login

Autenticação real, com senha guardada como hash bcrypt. A sessão é um JWT
assinado em cookie httpOnly, válido por 12 horas.

Proteção em duas camadas: o middleware barra quem não tem cookie, e o layout do
painel valida a assinatura no servidor, derrubando token forjado ou expirado.

E-mail inexistente e senha errada devolvem a mesma mensagem, de propósito. Dizer
qual dos dois falhou entrega para um atacante quais e-mails existem no sistema.

### O que agora é de verdade

- Arrastar card grava a etapa no banco. Recarregue a página: continua lá
- Trocar etapa pelo painel lateral também grava
- Responder no chat grava a mensagem com seu nome e atualiza a conversa
- Resolver conversa grava
- Concluir follow-up grava

Kanban e follow-ups usam atualização otimista: a tela responde na hora e o React
desfaz sozinho se a gravação falhar.

As mensagens são buscadas sob demanda ao abrir a conversa, não todas de uma vez.
Um histórico de anos de WhatsApp não caberia no carregamento da página.

### Correções

- O horário das conversas usava a data fixa da época dos dados simulados, então
  uma conversa de três dias atrás aparecia como se fosse de hoje

## v0.2.1 - Kanban utilizável

Correção de dois problemas que deixavam o quadro inutilizável.

### Quadro espremido

O painel de chat e o de detalhes ocupavam 704px dos 944px disponíveis, sobrando
240px para as nove colunas. Na prática dava para ver uma coluna e meia.

O que mudou:

- Nenhum card vem selecionado ao abrir, então o quadro usa a largura toda
- O painel de detalhes não abre mais sozinho no kanban
- Botão "Fechar conversa" devolve o quadro inteiro a qualquer momento
- Colunas de 288px para 256px, cabe mais coisa na tela

### Arrastar cards

Agora funciona. Segura o card e solta na coluna destino. A coluna alvo fica
destacada em azul durante o arraste, e a alça de arraste aparece ao passar o
mouse sobre o card.

Ao mudar de etapa, o checklist e os avisos de pendência recalculam sozinhos.

Importante: como ainda não existe banco, mover um card só vale até recarregar a
página. Persistência de verdade entra na v0.3.0.

### Correções menores

- Componente declarado dentro do render na barra de ícones, que zerava estado a
  cada renderização
- Concordância: "1 atrasada" e "em 1 dia" no lugar de "1 atrasadas" e "em 1 dias"

## v0.2.0 - Funil real

Substitui o funil inventado pelo funil de verdade da loja, a partir da tabela de
status enviada pelo time. Continua com dados simulados.

### Etapas

As sete etapas chutadas viraram as nove reais: Novo, Atendimento inicial,
Agendado, Decidindo, Aguardando retirada, Em provas e ajustes, Em locação,
Finalizado, Perdido.

Aluguel e sob medida seguem caminhos diferentes. Ao filtrar por interesse, as
colunas que não se aplicam somem do quadro: aluguel não passa por provas, sob
medida nunca entra em locação.

### Checklist por etapa

Cada etapa exige campos próprios, definidos em `lib/funil.ts`. O card mostra
quantos faltam e o painel lateral lista item por item.

Avisa mas não bloqueia: a atendente costuma estar com o cliente na frente.

### Follow-ups

Tela nova. Cada etapa define seus follow-ups, que viram tarefas com prazo. As
atrasadas aparecem destacadas. Sem disparo automático de mensagem.

### Campos novos

Origem do lead, canal de entrada, ocasião (antes chamada de tipo de evento) e
interesse inicial. Origem do lead é o que vai ligar o investimento em anúncio ao
faturamento no relatório de marketing.

### Relatórios

Separados em Comercial e Marketing, com o escopo de cada um documentado na tela.
Ainda não construídos.

## v0.1.0 - Fundação

Primeira versão navegável. Todo o conteúdo vem de dados simulados em
`lib/dados-simulados.ts`. Nada é salvo, nada é real.

O objetivo desta versão é validar o layout antes de investir em banco e
integrações.

### Telas

- **Chat** com lista de conversas, histórico e painel lateral do cliente
- **Kanban** com sete etapas e o chat acoplado na mesma tela
- **Clientes** em tabela, com busca e as colunas de filtro definidas
- **Login** visual
- Relatórios, Notificações e Configurações sinalizadas como não construídas

### Estrutura

- Barra de ícones fixa com logo, seções e versão visível
- Sidebar colapsável, com conteúdo que muda conforme a seção
- Urgência calculada pela data do evento: vermelho até 7 dias, laranja até 21

### Ainda não existe

- Autenticação de verdade
- Banco de dados
- Arrastar cards entre colunas
- WhatsApp e Bling
- Relatórios
