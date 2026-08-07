# Modelo de dados

Rascunho da modelagem, a partir do que voce descreveu. Serve de referencia antes
de virar schema Prisma. Se algo aqui nao bate com a operacao da loja, e melhor
corrigir agora do que depois de ter dados dentro.

## Cliente

| Campo | Tipo | Origem |
|---|---|---|
| nome | texto | atendente digita ou vem do perfil do WhatsApp |
| telefone | texto | automatico, vem do WhatsApp |
| email | texto | opcional |
| observacoes | texto longo | livre |
| criadoEm | data | automatico |

Telefone e a chave que liga a conversa do WhatsApp ao cliente. Guardar sempre
normalizado em formato E.164 (5511999999999), sem parenteses ou tracos, senao o
mesmo cliente vira dois registros.

## Atendimento

Um cliente pode voltar varias vezes: alugou um terno em marco, faz um sob medida
em outubro. Cada passagem pelo funil e um atendimento separado, com seus proprios
dados de evento. Sem isso o historico se perde a cada nova venda.

| Campo | Tipo | Observacao |
|---|---|---|
| clienteId | relacao | dono do atendimento |
| necessidade | opcao | aluguel, terno sob medida, camisa sob medida, ajuste |
| dataEvento | data | quando o cliente precisa da peca pronta |
| tipoEvento | opcao | casamento, formatura, corporativo, outro |
| etapa | opcao | posicao no kanban |
| valor | decimal | opcional, alimenta o relatorio de faturamento |
| responsavel | relacao | atendente que cuida |
| motivoPerda | texto | preenchido so quando etapa = perdido |

A data do evento merece atencao: e ela que define a urgencia real. Uma peca sob
medida para daqui a 15 dias e mais urgente que um aluguel para daqui a 3 meses,
mesmo tendo entrado depois. Vale destacar visualmente no card do kanban.

## Etapas do kanban

Proposta inicial, baseada em como costuma funcionar uma alfaiataria:

1. Novo contato
2. Em atendimento
3. Orcamento enviado
4. Aguardando prova
5. Em producao
6. Finalizado
7. Perdido

As duas ultimas sao estados finais. "Perdido" sai do fluxo mas continua no
relatorio, para voce medir onde os clientes desistem.

Isso e um chute educado. Voce conhece a operacao e vai querer ajustar.

## Conversa e mensagem

| Conversa | |
|---|---|
| clienteId | relacao |
| canal | whatsapp, instagram, manual |
| status | aberta, resolvida |
| naoLidas | contador |
| ultimaMensagemEm | data |

| Mensagem | |
|---|---|
| conversaId | relacao |
| direcao | recebida, enviada |
| conteudo | texto |
| autor | cliente, atendente, sistema |
| enviadaEm | data |
| idExterno | id da mensagem na Meta, evita duplicar no webhook |

## Usuario

Login do painel: nome, email, senha (hash), papel (admin ou atendente).

## Relatorios que o modelo permite

- Atendimentos por necessidade, para saber o que mais sai
- Taxa de conversao por etapa, para achar onde trava
- Motivos de perda
- Volume por tipo de evento e sazonalidade (formatura e casamento tem picos)
- Desempenho por atendente
- Faturamento por periodo
