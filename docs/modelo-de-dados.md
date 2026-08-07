# Modelo de dados

Modelagem baseada na tabela de status enviada pela loja. Vira schema Prisma na
v0.3.0. A definição executável do funil está em `lib/funil.ts`.

## Cliente

| Campo | Tipo |
|---|---|
| nome | texto |
| telefone | texto, formato E.164 |
| email | texto, opcional |
| observacoes | texto longo |
| criadoEm | data |

Telefone é a chave que liga a conversa do WhatsApp ao cliente. Sempre
normalizado como 5511999999999, sem parênteses ou traços, senão o mesmo cliente
vira dois registros.

## Atendimento

Um cliente pode voltar várias vezes: aluga um terno em março, faz um sob medida
em outubro. Cada passagem pelo funil é um atendimento separado. Sem isso o
histórico se perde a cada nova venda.

| Campo | Tipo | Observação |
|---|---|---|
| clienteId | relação | |
| origem | opção | Google Ads, Instagram, Facebook, indicação, passou na loja, site, outro |
| canal | opção | WhatsApp, Instagram, telefone |
| necessidade | opção | aluguel, terno sob medida, camisa sob medida, ajuste |
| ocasiao | opção | casamento, formatura, corporativo, aniversário, outro |
| dataEvento | data | define a urgência |
| interesseInicial | texto | o que o cliente pediu na primeira conversa |
| etapa | opção | as nove do funil |
| valor | decimal | |
| responsavel | relação | |
| dados | mapa aberto | checklist da etapa, ver abaixo |

**Origem do lead é o campo mais importante para o marketing.** É o que permite
cruzar investimento em anúncio com faturamento. Se ficar vazio, o relatório de
marketing mostra visitas no site e nada mais.

## Checklist por etapa

Cada etapa exige campos próprios. Como variam por etapa, ficam num mapa aberto
(`dados`) em vez de colunas fixas. A definição de quais campos existem em cada
etapa vive em `lib/funil.ts`.

O checklist **avisa mas não bloqueia**: a atendente costuma estar com o cliente
na frente e nem sempre dá para preencher tudo na hora. O card mostra quantos
campos faltam.

| Etapa | Campos exigidos |
|---|---|
| Novo | nenhum, os dados básicos já vêm do cadastro |
| Atendimento inicial | nenhum |
| Agendado | data e horário da visita, consultor, confirmação de presença, observações, origem do agendamento |
| Decidindo | data da visita, produtos experimentados, orçamento apresentado, objeção principal, próxima data de contato |
| Aguardando retirada | venda confirmada, data da retirada, horário |
| Em provas e ajustes | próxima prova, data prevista de liberação |
| Em locação | data da retirada, previsão de devolução, observações |
| Finalizado | cliente satisfeito, avaliação recebida, foto autorizada |
| Perdido | motivo: preço, estoque, prazo, concorrência, sem retorno |

## Fluxos diferentes

Aluguel e sob medida não passam pelas mesmas etapas:

- **Em provas e ajustes** só vale para terno sob medida, camisa sob medida e ajuste
- **Em locação** só vale para aluguel

O quadro é único, mas ao filtrar por interesse as colunas que não se aplicam
somem. Evita cards pulando colunas vazias.

## Tarefa (follow-up)

Cada etapa define seus follow-ups. Ao entrar na etapa, o sistema cria as tarefas
com prazo. Elas aparecem na tela de Follow-ups, e a atendente decide o que
mandar. Não há disparo automático de mensagem por enquanto.

| Campo | Tipo |
|---|---|
| atendimentoId | relação |
| titulo | texto |
| etapaOrigem | opção |
| venceEm | data e hora |
| concluida | booleano |
| responsavel | relação |

## Conversa e mensagem

| Conversa | |
|---|---|
| clienteId | relação |
| canal | whatsapp, instagram, telefone |
| status | aberta, resolvida |
| naoLidas | contador |
| ultimaMensagemEm | data |

| Mensagem | |
|---|---|
| conversaId | relação |
| direcao | recebida, enviada |
| conteudo | texto |
| autor | cliente, atendente, sistema |
| enviadaEm | data |
| idExterno | id na Meta, evita duplicar no webhook |

## Usuário

Nome, email, senha (hash), papel (admin ou atendente).

## Relatórios que o modelo permite

**Comercial**, direto do funil:

- Conversão entre as nove etapas
- Atendimentos por interesse
- Motivos de perda
- Sazonalidade por ocasião
- Desempenho por atendente
- Faturamento por período

**Marketing**, exige Google Analytics e Google Ads conectados:

- Origem dos leads cruzada com faturamento
- Custo por lead e por venda
- Acessos ao site e origem do tráfego
- Campanhas que trazem lead mas não venda
